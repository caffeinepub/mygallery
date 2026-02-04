import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useUploadFiles } from '@/hooks/useQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { useUpload } from '@/contexts/UploadContext';
import { toast } from 'sonner';

export default function FileUploadSection() {
  const uploadFilesMutation = useUploadFiles();
  const { status } = useBackendActor();
  const { startUpload, updateProgress, completeUpload } = useUpload();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      if (status !== 'ready') {
        toast.error('Please wait for the application to initialize');
        return;
      }

      const fileArray = Array.from(files);
      const uploadId = startUpload(fileArray);

      try {
        await uploadFilesMutation.mutateAsync({
          files: fileArray,
          onProgress: (fileName, progress) => {
            updateProgress(uploadId, fileName, progress);
          },
        });

        completeUpload(uploadId);
        toast.success(`Successfully uploaded ${fileArray.length} file${fileArray.length > 1 ? 's' : ''}`);
      } catch (error) {
        completeUpload(uploadId);
        console.error('Upload error:', error);
        toast.error('Upload failed. Please try again.');
      }

      event.target.value = '';
    },
    [uploadFilesMutation, status, startUpload, updateProgress, completeUpload]
  );

  const isDisabled = status !== 'ready';

  return (
    <div className="mb-8">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-all ${
          isDisabled
            ? 'border-muted bg-muted/20 cursor-not-allowed opacity-50'
            : 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 cursor-pointer'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className={`w-12 h-12 mb-3 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
          <p className={`mb-2 text-sm ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
            <span className="font-semibold">
              {isDisabled ? 'Loading...' : 'Click to upload'}
            </span>
            {!isDisabled && ' or drag and drop'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isDisabled ? 'Please wait' : 'Images, videos, documents, and more'}
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          disabled={isDisabled}
        />
      </label>
    </div>
  );
}
