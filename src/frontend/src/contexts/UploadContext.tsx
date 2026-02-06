import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  updateProgress: (uploadId: string, itemName: string, progress: number) => void;
  completeUpload: (uploadId: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);

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

  const updateProgress = useCallback((uploadId: string, itemName: string, progress: number) => {
    setUploadBatches(prev =>
      prev.map(batch =>
        batch.id === uploadId
          ? {
              ...batch,
              items: batch.items.map(item =>
                item.displayName === itemName ? { ...item, progress } : item
              ),
            }
          : batch
      )
    );
  }, []);

  const completeUpload = useCallback((uploadId: string) => {
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
