import { useEffect, useRef } from 'react';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useUploadFile } from '@/hooks/useQueries';
import { useUpload } from '@/contexts/UploadContext';
import { persistedQueue } from '@/utils/persistedUploadQueue';
import { fileBytesWorker } from '@/utils/fileBytesWorkerSingleton';
import { ExternalBlob } from '@/backend';
import { createConcurrencyLimiter } from '@/utils/uploadConcurrency';

const uploadLimiter = createConcurrencyLimiter(3);

export default function UploadQueueRunner() {
  const { status } = useBackendActor();
  const { identity } = useInternetIdentity();
  const uploadFileMutation = useUploadFile();
  const { restoreItem, updateProgress, completeUpload } = useUpload();
  const hasRestoredRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Only restore once when actor is ready and user is authenticated
    if (status !== 'ready' || !identity || hasRestoredRef.current || isProcessingRef.current) {
      return;
    }

    hasRestoredRef.current = true;
    isProcessingRef.current = true;

    const restoreAndResume = async () => {
      try {
        const items = await persistedQueue.getAll();
        
        if (items.length === 0) {
          isProcessingRef.current = false;
          return;
        }

        console.log(`Resuming ${items.length} pending upload(s)...`);

        // Restore items to upload context with their last known progress
        items.forEach(item => {
          restoreItem(item.itemId, item.name, 'file', item.size, item.progress);
        });

        // Process uploads with controlled parallelism
        const uploadPromises = items.map(item =>
          uploadLimiter(async () => {
            try {
              // Create a proper ArrayBuffer copy
              const buffer = new ArrayBuffer(item.bytes.byteLength);
              const standardBytes = new Uint8Array(buffer);
              standardBytes.set(new Uint8Array(item.bytes.buffer || item.bytes));

              // Upload with progress tracking
              const blobWithProgress = ExternalBlob.fromBytes(standardBytes).withUploadProgress((progress) => {
                updateProgress(item.itemId.split('-').slice(0, -1).join('-'), item.itemId, progress);
                persistedQueue.updateProgress(item.itemId, progress).catch(() => {});
              });

              await uploadFileMutation.mutateAsync({
                name: item.name,
                mimeType: item.mimeType,
                size: BigInt(item.size),
                blob: blobWithProgress,
              });

              // Mark as completed in persisted queue (don't delete yet)
              await persistedQueue.markCompleted(item.itemId);
              
              // Remove from persisted queue after successful upload
              await persistedQueue.dequeue(item.itemId);
              
              completeUpload(item.itemId);
              
              return { success: true, itemId: item.itemId };
            } catch (error) {
              console.error(`Resume upload error for ${item.name}:`, error);
              completeUpload(item.itemId);
              return { success: false, itemId: item.itemId, error };
            }
          })
        );

        const results = await Promise.allSettled(uploadPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        
        console.log(`Resumed uploads: ${successCount}/${items.length} successful`);
      } catch (error) {
        console.error('Failed to restore uploads:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    restoreAndResume();
  }, [status, identity, uploadFileMutation, restoreItem, updateProgress, completeUpload]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fileBytesWorker.terminate();
    };
  }, []);

  return null;
}
