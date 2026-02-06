import { useCallback, useState, useRef } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { useUploadFiles, useCreateLink } from '@/hooks/useQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { useUpload } from '@/contexts/UploadContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FileUploadSection() {
  const uploadFilesMutation = useUploadFiles();
  const createLinkMutation = useCreateLink();
  const { status } = useBackendActor();
  const { startUpload, startLinkUpload, updateProgress, completeUpload } = useUpload();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

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
        const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
        toast.error(errorMessage);
      }

      event.target.value = '';
    },
    [uploadFilesMutation, status, startUpload, updateProgress, completeUpload]
  );

  const handleLinkSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (status !== 'ready') {
        toast.error('Please wait for the application to initialize');
        return;
      }

      if (!linkUrl.trim()) {
        toast.error('Please enter a URL');
        return;
      }

      if (!validateUrl(linkUrl)) {
        toast.error('Please enter a valid http:// or https:// URL');
        return;
      }

      const displayName = linkName.trim() || new URL(linkUrl).hostname;
      
      // Start tracked link upload
      const uploadId = startLinkUpload(displayName);
      let currentProgress = 0;

      try {
        // Simulate progress during the backend call
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 15, 90);
          updateProgress(uploadId, displayName, currentProgress);
        }, 200);

        await createLinkMutation.mutateAsync({
          name: displayName,
          url: linkUrl,
        });

        clearInterval(progressInterval);
        
        // Complete to 100% before clearing
        updateProgress(uploadId, displayName, 100);
        
        // Small delay to show 100% before clearing
        setTimeout(() => {
          completeUpload(uploadId);
        }, 300);

        toast.success('Link added successfully');
        setLinkUrl('');
        setLinkName('');
        setShowLinkForm(false);
      } catch (error) {
        completeUpload(uploadId);
        console.error('Create link error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add link. Please try again.';
        toast.error(errorMessage);
      }
    },
    [linkUrl, linkName, status, createLinkMutation, startLinkUpload, updateProgress, completeUpload]
  );

  const isDisabled = status !== 'ready';

  const triggerFileInput = () => {
    if (!isDisabled) {
      document.getElementById('file-upload')?.click();
    }
  };

  return (
    <div className="mb-8">
      {!showLinkForm ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isDisabled}>
            <div
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
                  {!isDisabled && ' or paste link'}
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
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLinkForm(true)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Paste Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <form onSubmit={handleLinkSubmit} className="space-y-4 p-6 border-2 border-dashed rounded-lg border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Add Link
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowLinkForm(false);
                setLinkUrl('');
                setLinkName('');
              }}
              disabled={isDisabled || createLinkMutation.isPending}
            >
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={isDisabled || createLinkMutation.isPending}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-name">Name (optional)</Label>
            <Input
              id="link-name"
              type="text"
              placeholder="My favorite website"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              disabled={isDisabled || createLinkMutation.isPending}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled || createLinkMutation.isPending}
            className="w-full"
          >
            {createLinkMutation.isPending ? 'Adding...' : 'Add Link'}
          </Button>
        </form>
      )}
    </div>
  );
}
