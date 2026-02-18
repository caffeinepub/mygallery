import { useEffect, useState, useRef } from 'react';
import { useFileOrganizationStatus } from '@/hooks/useFileOrganizationStatus';
import { useUpload } from '@/contexts/UploadContext';
import { Badge } from '@/components/ui/badge';
import { FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';
import type { FileMetadata } from '@/backend';

interface LiveStackInboxProps {
  files: FileMetadata[];
}

export default function LiveStackInbox({ files }: LiveStackInboxProps) {
  const { unorganizedFileIds, unorganizedCount } = useFileOrganizationStatus();
  const { uploads } = useUpload();
  const [animatingFiles, setAnimatingFiles] = useState<Set<string>>(new Set());
  const previousUnorganizedRef = useRef<Set<string>>(new Set());

  // Detect newly uploaded files that just became unorganized
  useEffect(() => {
    const newlyUnorganized = Array.from(unorganizedFileIds).filter(
      id => !previousUnorganizedRef.current.has(id)
    );

    if (newlyUnorganized.length > 0) {
      // Check if these files just completed uploading
      const justCompleted = newlyUnorganized.filter(fileId => {
        const file = files.find(f => f.id === fileId);
        if (!file) return false;
        
        // Check if upload just completed (within last 2 seconds)
        const uploadAge = Date.now() - Number(file.createdAt / 1000000n);
        return uploadAge < 2000;
      });

      if (justCompleted.length > 0) {
        // Trigger slide animation for newly completed uploads
        setAnimatingFiles(prev => {
          const next = new Set(prev);
          justCompleted.forEach(id => next.add(id));
          return next;
        });

        // Remove animation state after animation completes
        setTimeout(() => {
          setAnimatingFiles(prev => {
            const next = new Set(prev);
            justCompleted.forEach(id => next.delete(id));
            return next;
          });
        }, 250);
      }
    }

    previousUnorganizedRef.current = new Set(unorganizedFileIds);
  }, [unorganizedFileIds, files]);

  if (unorganizedCount === 0) {
    return null;
  }

  // Get up to 3 unorganized files for the stack preview
  const unorganizedFiles = files
    .filter(f => unorganizedFileIds.has(f.id))
    .slice(0, 3);

  const getFileIcon = (file: FileMetadata) => {
    if (file.link) return ExternalLink;
    if (file.mimeType.startsWith('image/')) return FileImage;
    if (file.mimeType.startsWith('video/')) return FileVideo;
    if (file.mimeType === 'application/pdf') return FileText;
    if (file.mimeType.includes('word')) return FileText;
    if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) return FileSpreadsheet;
    return FileIcon;
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
      <div className="relative">
        {/* Stack of cards with diagonal offset */}
        <div className="relative w-16 h-20">
          {unorganizedFiles.map((file, index) => {
            const Icon = getFileIcon(file);
            const isImage = !file.link && file.mimeType.startsWith('image/') && file.blob;
            const offset = index * 4; // 4px diagonal offset

            return (
              <div
                key={file.id}
                className="absolute rounded-lg bg-card border border-border shadow-md overflow-hidden transition-all duration-200"
                style={{
                  width: '64px',
                  height: '80px',
                  left: `${offset}px`,
                  top: `${offset}px`,
                  zIndex: unorganizedFiles.length - index,
                  transform: animatingFiles.has(file.id) 
                    ? 'translateX(0) translateY(0)' 
                    : undefined,
                  transition: animatingFiles.has(file.id)
                    ? 'transform 250ms ease-out'
                    : undefined,
                }}
              >
                {isImage && file.blob ? (
                  <img
                    src={file.blob.getDirectURL()}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Badge with count */}
        <div className="absolute -top-2 -right-2 pointer-events-auto">
          <Badge 
            variant="default" 
            className="h-6 min-w-6 flex items-center justify-center px-1.5 text-xs font-semibold shadow-lg"
          >
            {unorganizedCount}
          </Badge>
        </div>
      </div>
    </div>
  );
}
