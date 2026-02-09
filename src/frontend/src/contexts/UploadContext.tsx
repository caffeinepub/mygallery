import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface UploadItem {
  displayName: string;
  progress: number;
}

interface UploadBatch {
  id: string;
  items: UploadItem[];
}

interface UploadContextType {
  uploadBatches: UploadBatch[];
  totalProgress: number;
  isUploading: boolean;
  itemCount: number;
  startUpload: (files: File[]) => string;
  startLinkUpload: (linkName: string) => string;
  startNoteUpload: (noteTitle: string) => string;
  updateProgress: (uploadId: string, itemName: string, progress: number) => void;
  completeUpload: (uploadId: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);
  const progressUpdateScheduled = useRef(false);
  const pendingUpdates = useRef<Map<string, Map<string, number>>>(new Map());

  const startUpload = useCallback((files: File[]): string => {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBatch: UploadBatch = {
      id: uploadId,
      items: files.map(file => ({ displayName: file.name, progress: 0 })),
    };
    setUploadBatches(prev => [...prev, newBatch]);
    return uploadId;
  }, []);

  const startLinkUpload = useCallback((linkName: string): string => {
    const uploadId = `link-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBatch: UploadBatch = {
      id: uploadId,
      items: [{ displayName: linkName, progress: 0 }],
    };
    setUploadBatches(prev => [...prev, newBatch]);
    return uploadId;
  }, []);

  const startNoteUpload = useCallback((noteTitle: string): string => {
    const uploadId = `note-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBatch: UploadBatch = {
      id: uploadId,
      items: [{ displayName: noteTitle, progress: 0 }],
    };
    setUploadBatches(prev => [...prev, newBatch]);
    return uploadId;
  }, []);

  const flushProgressUpdates = useCallback(() => {
    if (pendingUpdates.current.size === 0) {
      progressUpdateScheduled.current = false;
      return;
    }

    const updates = new Map(pendingUpdates.current);
    pendingUpdates.current.clear();

    setUploadBatches(prev =>
      prev.map(batch => {
        const batchUpdates = updates.get(batch.id);
        if (!batchUpdates) return batch;

        return {
          ...batch,
          items: batch.items.map(item => {
            const newProgress = batchUpdates.get(item.displayName);
            return newProgress !== undefined ? { ...item, progress: newProgress } : item;
          }),
        };
      })
    );

    progressUpdateScheduled.current = false;
  }, []);

  const updateProgress = useCallback((uploadId: string, itemName: string, progress: number) => {
    // Accumulate updates
    if (!pendingUpdates.current.has(uploadId)) {
      pendingUpdates.current.set(uploadId, new Map());
    }
    pendingUpdates.current.get(uploadId)!.set(itemName, progress);

    // Schedule flush on next animation frame if not already scheduled
    if (!progressUpdateScheduled.current) {
      progressUpdateScheduled.current = true;
      requestAnimationFrame(flushProgressUpdates);
    }
  }, [flushProgressUpdates]);

  const completeUpload = useCallback((uploadId: string) => {
    // Clear any pending updates for this upload
    pendingUpdates.current.delete(uploadId);
    
    setUploadBatches(prev => prev.filter(batch => batch.id !== uploadId));
  }, []);

  const allItems = uploadBatches.flatMap(batch => batch.items);
  const totalProgress = allItems.length > 0
    ? Math.round(allItems.reduce((sum, item) => sum + item.progress, 0) / allItems.length)
    : 0;

  const isUploading = uploadBatches.length > 0;
  const itemCount = allItems.length;

  return (
    <UploadContext.Provider
      value={{
        uploadBatches,
        totalProgress,
        isUploading,
        itemCount,
        startUpload,
        startLinkUpload,
        startNoteUpload,
        updateProgress,
        completeUpload,
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
