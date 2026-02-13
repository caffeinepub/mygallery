import React, { createContext, useContext, useState, useCallback } from 'react';

export type UploadType = 'file' | 'link' | 'note';

export interface UploadProgress {
  itemId: string;
  batchId: string;
  name: string;
  type: UploadType;
  progress: number;
  size: number;
  completed: boolean;
}

interface UploadContextType {
  uploads: UploadProgress[];
  isUploading: boolean;
  totalProgress: number;
  startUpload: (files: File[]) => string;
  startLinkUpload: (name: string) => string;
  startNoteUpload: (title: string) => string;
  updateProgress: (batchId: string, itemId: string, progress: number) => void;
  completeUpload: (itemId: string) => void;
  restoreItem: (itemId: string, name: string, type: UploadType, size: number, progress: number) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const startUpload = useCallback((files: File[]): string => {
    const batchId = `batch-${Date.now()}`;
    const newUploads: UploadProgress[] = files.map((file, index) => ({
      itemId: `${batchId}-${index}`,
      batchId,
      name: file.name,
      type: 'file' as UploadType,
      progress: 0,
      size: file.size,
      completed: false,
    }));

    setUploads(prev => [...prev, ...newUploads]);
    return batchId;
  }, []);

  const startLinkUpload = useCallback((name: string): string => {
    const batchId = `link-${Date.now()}`;
    const newUpload: UploadProgress = {
      itemId: `${batchId}-0`,
      batchId,
      name,
      type: 'link',
      progress: 0,
      size: 0,
      completed: false,
    };

    setUploads(prev => [...prev, newUpload]);
    return batchId;
  }, []);

  const startNoteUpload = useCallback((title: string): string => {
    const batchId = `note-${Date.now()}`;
    const newUpload: UploadProgress = {
      itemId: `${batchId}-0`,
      batchId,
      name: title,
      type: 'note',
      progress: 0,
      size: 0,
      completed: false,
    };

    setUploads(prev => [...prev, newUpload]);
    return batchId;
  }, []);

  const updateProgress = useCallback((batchId: string, itemId: string, progress: number) => {
    setUploads(prev =>
      prev.map(upload =>
        upload.itemId === itemId
          ? { ...upload, progress: Math.min(100, Math.max(0, progress)) }
          : upload
      )
    );
  }, []);

  const completeUpload = useCallback((itemId: string) => {
    setUploads(prev =>
      prev.map(upload =>
        upload.itemId === itemId
          ? { ...upload, progress: 100, completed: true }
          : upload
      )
    );

    // Remove completed uploads after a delay
    setTimeout(() => {
      setUploads(prev => prev.filter(upload => upload.itemId !== itemId));
    }, 2000);
  }, []);

  const restoreItem = useCallback((
    itemId: string,
    name: string,
    type: UploadType,
    size: number,
    progress: number
  ) => {
    setUploads(prev => {
      // Check if item already exists (prevent duplicates)
      const exists = prev.some(u => u.itemId === itemId);
      if (exists) {
        return prev;
      }

      const batchId = itemId.split('-').slice(0, -1).join('-') || `restored-${Date.now()}`;
      
      return [...prev, {
        itemId,
        batchId,
        name,
        type,
        progress,
        size,
        completed: false,
      }];
    });
  }, []);

  const isUploading = uploads.some(u => !u.completed);

  const totalProgress = uploads.length > 0
    ? Math.round(
        uploads.reduce((sum, upload) => {
          const weight = upload.size > 0 ? upload.size : 1000;
          return sum + (upload.progress * weight);
        }, 0) /
        uploads.reduce((sum, upload) => {
          const weight = upload.size > 0 ? upload.size : 1000;
          return sum + weight;
        }, 0)
      )
    : 0;

  return (
    <UploadContext.Provider
      value={{
        uploads,
        isUploading,
        totalProgress,
        startUpload,
        startLinkUpload,
        startNoteUpload,
        updateProgress,
        completeUpload,
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
