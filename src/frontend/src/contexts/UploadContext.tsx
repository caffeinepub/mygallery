import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  type: 'file' | 'link' | 'note';
}

interface UploadContextType {
  uploads: UploadProgress[];
  addUpload: (upload: UploadProgress) => void;
  updateUpload: (id: string, progress: number) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  // Legacy API for compatibility
  startUpload: (files: File[]) => string;
  startLinkUpload: (name: string) => string;
  startNoteUpload: (title: string) => string;
  updateProgress: (uploadId: string, itemName: string, progress: number) => void;
  completeUpload: (uploadId: string) => void;
  isUploading: boolean;
  totalProgress: number;
  itemCount: number;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  // Coalesce progress updates using requestAnimationFrame
  const flushPendingUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.size === 0) {
      rafIdRef.current = null;
      return;
    }

    const updates = new Map(pendingUpdatesRef.current);
    pendingUpdatesRef.current.clear();

    setUploads(prev => 
      prev.map(upload => {
        const newProgress = updates.get(upload.id);
        return newProgress !== undefined ? { ...upload, progress: newProgress } : upload;
      })
    );

    rafIdRef.current = null;
  }, []);

  const addUpload = useCallback((upload: UploadProgress) => {
    setUploads(prev => [...prev, upload]);
  }, []);

  const updateUpload = useCallback((id: string, progress: number) => {
    pendingUpdatesRef.current.set(id, progress);

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushPendingUpdates);
    }
  }, [flushPendingUpdates]);

  const removeUpload = useCallback((id: string) => {
    pendingUpdatesRef.current.delete(id);
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.progress < 100));
  }, []);

  // Legacy API for compatibility with FileUploadSection
  const startUpload = useCallback((files: File[]): string => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`;
    files.forEach((file, index) => {
      addUpload({
        id: `${uploadId}-${index}`,
        name: file.name,
        progress: 0,
        type: 'file',
      });
    });
    return uploadId;
  }, [addUpload]);

  const startLinkUpload = useCallback((name: string): string => {
    const uploadId = `link-${Date.now()}-${Math.random()}`;
    addUpload({
      id: uploadId,
      name,
      progress: 0,
      type: 'link',
    });
    return uploadId;
  }, [addUpload]);

  const startNoteUpload = useCallback((title: string): string => {
    const uploadId = `note-${Date.now()}-${Math.random()}`;
    addUpload({
      id: uploadId,
      name: title,
      progress: 0,
      type: 'note',
    });
    return uploadId;
  }, [addUpload]);

  const updateProgress = useCallback((uploadId: string, itemName: string, progress: number) => {
    // For batch uploads, update specific item
    const matchingUpload = uploads.find(u => u.id.startsWith(uploadId) && u.name === itemName);
    if (matchingUpload) {
      updateUpload(matchingUpload.id, progress);
    } else {
      // For single uploads (link, note), update by uploadId directly
      updateUpload(uploadId, progress);
    }
  }, [uploads, updateUpload]);

  const completeUpload = useCallback((uploadId: string) => {
    // Remove all uploads that match this uploadId (for batch uploads)
    setUploads(prev => prev.filter(u => !u.id.startsWith(uploadId)));
  }, []);

  // Computed values for UnifiedProgressBar
  const isUploading = uploads.length > 0;
  const totalProgress = useMemo(() => {
    if (uploads.length === 0) return 0;
    const sum = uploads.reduce((acc, u) => acc + u.progress, 0);
    return Math.round(sum / uploads.length);
  }, [uploads]);
  const itemCount = uploads.length;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <UploadContext.Provider value={{ 
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
    }}>
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
