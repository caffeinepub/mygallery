import { useEffect, useRef } from 'react';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useUploadFile } from '@/hooks/useQueries';
import { useUpload } from '@/contexts/UploadContext';
import { persistedQueue } from '@/utils/persistedUploadQueue';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';
import { createConcurrencyLimiter } from '@/utils/uploadConcurrency';

const uploadLimiter = createConcurrencyLimiter(3);

export default function UploadQueueRunner() {
  const { status } = useBackendActor();
  const { identity } = useInternetIdentity();
  const uploadFileMutation = useUploadFile();
  const { restoreItem, updateProgress, completeUpload } = useUpload();
  const isProcessingRef = useRef(false);
  const hasRestoredRef = useRef(false);

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
        const batchId = `resumed-${Date.now()}`;
        for (const item of items) {
          restoreItem({
            id: batchId,
            itemId: item.itemId,
            name: item.name,
            progress: item.progress,
            type: 'file',
            size: item.size,
            completed: false,
          });
        }

        // Process uploads with controlled parallelism
        const uploadPromises = items.map((item) =>
          uploadLimiter(async () => {
            try {
              const uint8Array = new Uint8Array(item.bytes);
              const blobWithProgress = ExternalBlob.fromBytes(uint8Array).withUploadProgress((progress) => {
                updateProgress(batchId, item.itemId, progress);
                persistedQueue.updateProgress(item.itemId, progress).catch(() => {});
              });

              await uploadFileMutation.mutateAsync({
                name: item.name,
                mimeType: item.mimeType,
                size: BigInt(item.size),
                blob: blobWithProgress,
              });

              // Remove from persisted queue on success
              await persistedQueue.dequeue(item.itemId).catch(() => {});
              completeUpload(item.itemId);
            } catch (error) {
              console.error(`Failed to resume upload for ${item.name}:`, error);
              // Keep in queue for retry on next app start
              throw error;
            }
          })
        );

        const results = await Promise.allSettled(uploadPromises);
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;

        if (successCount > 0) {
          toast.success(`Resumed and completed ${successCount} upload(s)`);
        }
      } catch (error) {
        console.error('Failed to restore upload queue:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    restoreAndResume();
  }, [status, identity, uploadFileMutation, restoreItem, updateProgress, completeUpload]);

  // This component has no UI
  return null;
}
