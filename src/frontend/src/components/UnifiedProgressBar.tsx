import { useUpload } from '@/contexts/UploadContext';

export default function UnifiedProgressBar() {
  const { isUploading, totalProgress, uploads } = useUpload();

  // Only show when there are active (non-completed) uploads
  const activeUploads = uploads.filter(u => !u.completed);
  
  if (activeUploads.length === 0) return null;

  const fileCount = activeUploads.filter(u => u.type === 'file').length;
  const linkCount = activeUploads.filter(u => u.type === 'link').length;
  const noteCount = activeUploads.filter(u => u.type === 'note').length;

  let itemLabel = '';
  if (fileCount > 0) {
    itemLabel = `${fileCount} file${fileCount > 1 ? 's' : ''}`;
  }
  if (linkCount > 0) {
    itemLabel = itemLabel ? `${itemLabel}, ${linkCount} link${linkCount > 1 ? 's' : ''}` : `${linkCount} link${linkCount > 1 ? 's' : ''}`;
  }
  if (noteCount > 0) {
    itemLabel = itemLabel ? `${itemLabel}, ${noteCount} note${noteCount > 1 ? 's' : ''}` : `${noteCount} note${noteCount > 1 ? 's' : ''}`;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="max-w-[430px] mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Uploading {itemLabel}</span>
          <span className="font-medium">{totalProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
