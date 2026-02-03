import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FileProgress {
  fileName: string;
  progress: number;
}

interface UploadBatch {
  id: string;
  files: FileProgress[];
}

interface UploadContextType {
  uploadBatches: UploadBatch[];
  totalProgress: number;
  isUploading: boolean;
  fileCount: number;
  startUpload: (files: File[]) => string;
  updateProgress: (uploadId: string, fileName: string, progress: number) => void;
  completeUpload: (uploadId: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);

  const startUpload = useCallback((files: File[]): string => {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBatch: UploadBatch = {
      id: uploadId,
      files: files.map(file => ({ fileName: file.name, progress: 0 })),
    };
    setUploadBatches(prev => [...prev, newBatch]);
    return uploadId;
  }, []);

  const updateProgress = useCallback((uploadId: string, fileName: string, progress: number) => {
    setUploadBatches(prev =>
      prev.map(batch =>
        batch.id === uploadId
          ? {
              ...batch,
              files: batch.files.map(file =>
                file.fileName === fileName ? { ...file, progress } : file
              ),
            }
          : batch
      )
    );
  }, []);

  const completeUpload = useCallback((uploadId: string) => {
    setUploadBatches(prev => prev.filter(batch => batch.id !== uploadId));
  }, []);

  const allFiles = uploadBatches.flatMap(batch => batch.files);
  const totalProgress = allFiles.length > 0
    ? Math.round(allFiles.reduce((sum, file) => sum + file.progress, 0) / allFiles.length)
    : 0;

  const isUploading = uploadBatches.length > 0;
  const fileCount = allFiles.length;

  return (
    <UploadContext.Provider
      value={{
        uploadBatches,
        totalProgress,
        isUploading,
        fileCount,
        startUpload,
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
