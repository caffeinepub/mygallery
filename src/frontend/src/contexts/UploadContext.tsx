import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';

export interface UploadProgress {
  id: string;
  itemId: string; // Stable per-item ID for deterministic progress tracking
  name: string;
  progress: number;
  type: 'file' | 'link' | 'note';
  size?: number;
  completed?: boolean;
}

interface UploadContextType {
  uploads: UploadProgress[];
  addUpload: (upload: UploadProgress) => void;
  updateUpload: (itemId: string, progress: number) => void;
  removeUpload: (itemId: string) => void;
  clearCompleted: () => void;
  startUpload: (files: File[]) => string;
  startLinkUpload: (name: string) => string;
  startNoteUpload: (title: string) => string;
  updateProgress: (uploadId: string, itemId: string, progress: number) => void;
  completeUpload: (itemId: string) => void;
  isUploading: boolean;
  totalProgress: number;
  itemCount: number;
  registerBatchItems: (batchId: string, itemIds: string[]) => void;
  restoreItem: (item: UploadProgress) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());
  const rafIdRef = useRef<number | null>(null);
  const batchMappingRef = useRef<Map<string, string[]>>(new Map());

  const flushPendingUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.size === 0) {
      rafIdRef.current = null;
      return;
    }

    const updates = new Map(pendingUpdatesRef.current);
    pendingUpdatesRef.current.clear();

    setUploads(prev => 
      prev.map(upload => {
        const newProgress = updates.get(upload.itemId);
        return newProgress !== undefined ? { ...upload, progress: newProgress } : upload;
      })
    );

    rafIdRef.current = null;
  }, []);

  const addUpload = useCallback((upload: UploadProgress) => {
    setUploads(prev => [...prev, upload]);
  }, []);

  const updateUpload = useCallback((itemId: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    pendingUpdatesRef.current.set(itemId, clampedProgress);

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushPendingUpdates);
    }
  }, [flushPendingUpdates]);

  const removeUpload = useCallback((itemId: string) => {
    pendingUpdatesRef.current.delete(itemId);
    setUploads(prev => prev.filter(u => u.itemId !== itemId));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => !u.completed));
  }, []);

  const startUpload = useCallback((files: File[]) => {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const itemIds: string[] = [];

    files.forEach((file, index) => {
      const itemId = `${batchId}-${index}`;
      itemIds.push(itemId);
      addUpload({
        id: batchId,
        itemId,
        name: file.name,
        progress: 0,
        type: 'file',
        size: file.size,
        completed: false,
      });
    });

    batchMappingRef.current.set(batchId, itemIds);
    return batchId;
  }, [addUpload]);

  const startLinkUpload = useCallback((name: string) => {
    const batchId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const itemId = `${batchId}-0`;
    
    addUpload({
      id: batchId,
      itemId,
      name,
      progress: 0,
      type: 'link',
      completed: false,
    });

    batchMappingRef.current.set(batchId, [itemId]);
    return batchId;
  }, [addUpload]);

  const startNoteUpload = useCallback((title: string) => {
    const batchId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const itemId = `${batchId}-0`;
    
    addUpload({
      id: batchId,
      itemId,
      name: title,
      progress: 0,
      type: 'note',
      completed: false,
    });

    batchMappingRef.current.set(batchId, [itemId]);
    return batchId;
  }, [addUpload]);

  const updateProgress = useCallback((uploadId: string, itemId: string, progress: number) => {
    updateUpload(itemId, progress);
  }, [updateUpload]);

  const completeUpload = useCallback((itemId: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.itemId === itemId ? { ...upload, progress: 100, completed: true } : upload
      )
    );

    setTimeout(() => {
      removeUpload(itemId);
    }, 1000);
  }, [removeUpload]);

  const registerBatchItems = useCallback((batchId: string, itemIds: string[]) => {
    batchMappingRef.current.set(batchId, itemIds);
  }, []);

  const restoreItem = useCallback((item: UploadProgress) => {
    addUpload(item);
  }, [addUpload]);

  const isUploading = uploads.length > 0;

  const totalProgress = useMemo(() => {
    if (uploads.length === 0) return 0;

    const totalSize = uploads.reduce((sum, u) => sum + (u.size || 1), 0);
    const weightedProgress = uploads.reduce((sum, u) => {
      const weight = (u.size || 1) / totalSize;
      return sum + (u.progress * weight);
    }, 0);

    return Math.round(weightedProgress);
  }, [uploads]);

  const itemCount = uploads.length;

  return (
    <UploadContext.Provider
      value={{
        uploads,
        addUpload,
        updateUpload,
        removeUpload,
        clearCompleted,
        startUpload,
        startLinkUpload,
        startNoteUpload,
        updateProgress,
        completeUpload,
        isUploading,
        totalProgress,
        itemCount,
        registerBatchItems,
        restoreItem,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within UploadProvider');
  }
  return context;
}
