import { memo } from 'react';
import { useUpload } from '@/contexts/UploadContext';
import { Progress } from '@/components/ui/progress';

const UnifiedProgressBar = memo(() => {
  const { isUploading, totalProgress, itemCount } = useUpload();

  if (!isUploading) return null;

  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Progress value={totalProgress} className="h-2" />
          </div>
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {totalProgress}% • {itemCount} item{itemCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
});

UnifiedProgressBar.displayName = 'UnifiedProgressBar';

export default UnifiedProgressBar;
