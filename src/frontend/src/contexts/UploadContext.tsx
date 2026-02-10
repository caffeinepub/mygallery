import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface UploadProgress {
  [key: string]: number;
}

interface UploadContextType {
  isUploading: boolean;
  totalProgress: number;
  itemCount: number;
  startUpload: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const rafIdRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());

  // Coalesce progress updates using requestAnimationFrame
  const scheduleProgressUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      
      if (pendingUpdatesRef.current.size === 0) return;

      setUploadProgress((prev) => {
        const next = { ...prev };
        pendingUpdatesRef.current.forEach((progress, id) => {
          next[id] = progress;
        });
        pendingUpdatesRef.current.clear();
        return next;
      });
    });
  }, []);

  const startUpload = useCallback((id: string) => {
    pendingUpdatesRef.current.set(id, 0);
    scheduleProgressUpdate();
  }, [scheduleProgressUpdate]);

  const updateProgress = useCallback((id: string, progress: number) => {
    pendingUpdatesRef.current.set(id, progress);
    scheduleProgressUpdate();
  }, [scheduleProgressUpdate]);

  const completeUpload = useCallback((id: string) => {
    pendingUpdatesRef.current.delete(id);
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const itemCount = Object.keys(uploadProgress).length;
  const isUploading = itemCount > 0;
  
  const totalProgress = isUploading
    ? Math.round(Object.values(uploadProgress).reduce((sum, p) => sum + p, 0) / itemCount)
    : 0;

  return (
    <UploadContext.Provider
      value={{
        isUploading,
        totalProgress,
        itemCount,
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
