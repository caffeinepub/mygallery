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
  // Map uploadId to item IDs for batch uploads
  const uploadMappingRef = useRef<Map<string, string[]>>(new Map());
  // Store pending progress updates that arrive before items are added
  const pendingProgressRef = useRef<Map<string, number>>(new Map());

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
    setUploads(prev => {
      // Check if there's a pending progress update for this item
      const pendingProgress = pendingProgressRef.current.get(upload.id);
      if (pendingProgress !== undefined) {
        pendingProgressRef.current.delete(upload.id);
        return [...prev, { ...upload, progress: pendingProgress }];
      }
      return [...prev, upload];
    });
  }, []);

  const updateUpload = useCallback((id: string, progress: number) => {
    // Clamp progress to 0-100 range
    const clampedProgress = Math.max(0, Math.min(100, progress));
    pendingUpdatesRef.current.set(id, clampedProgress);

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushPendingUpdates);
    }
  }, [flushPendingUpdates]);

  const removeUpload = useCallback((id: string) => {
    pendingUpdatesRef.current.delete(id);
    pendingProgressRef.current.delete(id);
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.progress < 100));
  }, []);

  // Legacy API for compatibility with FileUploadSection
  const startUpload = useCallback((files: File[]): string => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`;
    const itemIds: string[] = [];
    
    files.forEach((file, index) => {
      const itemId = `${uploadId}-${index}`;
      itemIds.push(itemId);
      addUpload({
        id: itemId,
        name: file.name,
        progress: 0,
        type: 'file',
      });
    });
    
    // Store mapping for this batch upload
    uploadMappingRef.current.set(uploadId, itemIds);
    
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
    // Clamp progress to 0-100 range
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    // Check if this is a batch upload
    const batchItemIds = uploadMappingRef.current.get(uploadId);
    
    if (batchItemIds) {
      // For batch uploads, find the specific item by name
      // Use a ref-based approach to avoid stale closure
      setUploads(prev => {
        const matchingUpload = prev.find(u => batchItemIds.includes(u.id) && u.name === itemName);
        if (matchingUpload) {
          updateUpload(matchingUpload.id, clampedProgress);
        } else {
          // Item not found yet, store as pending
          const potentialId = batchItemIds.find(id => {
            // Try to match by checking if any batch item ID could match this name
            return true; // We'll store it and apply when the item is added
          });
          if (potentialId) {
            pendingProgressRef.current.set(potentialId, clampedProgress);
          }
        }
        return prev;
      });
    } else {
      // For single uploads (link, note), update by uploadId directly
      updateUpload(uploadId, clampedProgress);
    }
  }, [updateUpload]);

  const completeUpload = useCallback((uploadId: string) => {
    // Clean up mapping
    uploadMappingRef.current.delete(uploadId);
    
    // Remove all uploads that match this uploadId (for batch uploads)
    setUploads(prev => prev.filter(u => !u.id.startsWith(uploadId)));
    
    // Clean up any pending progress for this upload
    const batchItemIds = uploadMappingRef.current.get(uploadId);
    if (batchItemIds) {
      batchItemIds.forEach(id => {
        pendingProgressRef.current.delete(id);
        pendingUpdatesRef.current.delete(id);
      });
    } else {
      pendingProgressRef.current.delete(uploadId);
      pendingUpdatesRef.current.delete(uploadId);
    }
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
