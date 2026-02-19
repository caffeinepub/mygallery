import { memo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useStackedFiles } from '@/hooks/useStackedFiles';
import type { FileMetadata } from '@/backend';

interface FloatingFileStackProps {
  onOpenStack: () => void;
  newlyUploadedFiles: FileMetadata[];
}

const FloatingFileStack = memo(({ onOpenStack, newlyUploadedFiles }: FloatingFileStackProps) => {
  const { stackedFiles, addFiles } = useStackedFiles();
  const [animatingFiles, setAnimatingFiles] = useState<FileMetadata[]>([]);

  // Handle newly uploaded files animation
  useEffect(() => {
    if (newlyUploadedFiles.length > 0) {
      // Wait 2-3 seconds before animating to stack
      const timer = setTimeout(() => {
        setAnimatingFiles(newlyUploadedFiles);
        
        // Complete animation and add to stack after slide animation
        setTimeout(() => {
          addFiles(newlyUploadedFiles);
          setAnimatingFiles([]);
        }, 600); // Match animation duration
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [newlyUploadedFiles, addFiles]);

  const totalFiles = stackedFiles.length;

  if (totalFiles === 0 && animatingFiles.length === 0) {
    return null;
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  };

  const displayFiles = stackedFiles.slice(0, 3);

  return (
    <div
      className="fixed right-4 z-40 cursor-pointer transition-transform hover:scale-105 active:scale-95"
      style={{ bottom: '140px' }}
      onClick={onOpenStack}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenStack();
        }
      }}
    >
      <div className="relative">
        {/* Stacked cards with diagonal offset */}
        {displayFiles.map((file, index) => {
          const isLink = !!file.link;
          const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
          const isImage = !isLink && file.mimeType.startsWith('image/');
          const offset = index * 4;

          return (
            <div
              key={file.id}
              className="absolute w-16 h-16 rounded-lg bg-card border-2 border-border shadow-lg overflow-hidden"
              style={{
                transform: `translate(${offset}px, ${offset}px)`,
                zIndex: 3 - index,
              }}
            >
              {isImage && file.blob ? (
                <img
                  src={file.blob.getDirectURL()}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}

        {/* Placeholder for stack depth */}
        <div className="w-16 h-16" style={{ marginRight: `${(displayFiles.length - 1) * 4}px`, marginBottom: `${(displayFiles.length - 1) * 4}px` }} />

        {/* Badge with count */}
        <Badge
          className="absolute -top-2 -right-2 z-50 bg-primary text-primary-foreground shadow-md min-w-[24px] h-6 flex items-center justify-center px-2"
        >
          {totalFiles}
        </Badge>
      </div>
    </div>
  );
});

FloatingFileStack.displayName = 'FloatingFileStack';

export default FloatingFileStack;
