import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { useGetFilesNotInFolder, useGetFilesInFolder, useDeleteFiles } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileImage, FileVideo, File as FileIcon, ArrowLeft, FileText, FileSpreadsheet, FolderInput, Download, Trash2, Check, Share2, Target, ExternalLink } from 'lucide-react';
import FullScreenViewer from './FullScreenViewer';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { shouldOpenInViewer, shouldDownloadDirectly } from '@/utils/fileOpenRules';
import { downloadFile, openExternally } from '@/utils/externalOpen';
import type { FileMetadata, Folder } from '@/backend';

interface GallerySectionProps {
  selectedFolder: Folder | null;
  onBackToMain: () => void;
}

const FileCard = memo(({ 
  file, 
  onClick, 
  isSelected, 
  isSelectionMode,
  onLongPress 
}: { 
  file: FileMetadata; 
  onClick: () => void;
  isSelected: boolean;
  isSelectionMode: boolean;
  onLongPress: () => void;
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const longPressTriggeredRef = useRef<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isLink = !!file.link;

  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  }, []);

  const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
  const isImage = !isLink && file.mimeType.startsWith('image/');
  const isVideo = !isLink && file.mimeType.startsWith('video/');

  const clearTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = Date.now();
    hasMovedRef.current = false;
    longPressTriggeredRef.current = false;
    
    clearTimer();
    longPressTimerRef.current = setTimeout(() => {
      if (!hasMovedRef.current) {
        longPressTriggeredRef.current = true;
        onLongPress();
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  }, [onLongPress, clearTimer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
    
    if (deltaX > 5 || deltaY > 5) {
      hasMovedRef.current = true;
      clearTimer();
    }
  }, [clearTimer]);

  const handleTouchEnd = useCallback(() => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    clearTimer();
    
    if (touchDuration < 500 && !hasMovedRef.current && !longPressTriggeredRef.current) {
      onClick();
    }
    
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
    longPressTriggeredRef.current = false;
  }, [onClick, clearTimer]);

  const handleTouchCancel = useCallback(() => {
    clearTimer();
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
    longPressTriggeredRef.current = false;
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <div
      className="group cursor-pointer relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`relative w-[100px] h-[100px] overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-4 ring-primary shadow-lg scale-[1.02]' : ''
      }`}>
        {isLink ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
        ) : isImage && file.blob ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="h-10 w-10 text-muted-foreground animate-pulse" />
              </div>
            )}
            <img
              src={file.blob.getDirectURL()}
              alt={file.name}
              className={`h-full w-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : isVideo && file.blob ? (
          <video src={file.blob.getDirectURL()} className="h-full w-full object-cover" preload="metadata" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className={`absolute inset-0 transition-colors duration-150 ${
          isSelected ? 'bg-primary/20' : 'bg-black/0 group-hover:bg-black/10'
        }`} />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
            <Check className="h-4 w-4" />
          </div>
        )}
        {isLink && !isSelected && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs truncate w-[100px]" title={file.name}>
        {file.name}
      </p>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.file.id === nextProps.file.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectionMode === nextProps.isSelectionMode
  );
});

FileCard.displayName = 'FileCard';

export default function GallerySection({ selectedFolder, onBackToMain }: GallerySectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sendToFolderOpen, setSendToFolderOpen] = useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const mainGalleryQuery = useGetFilesNotInFolder();
  const folderGalleryQuery = useGetFilesInFolder(selectedFolder?.id ?? null);
  const deleteFiles = useDeleteFiles();

  const { data: files, isLoading, error } = selectedFolder ? folderGalleryQuery : mainGalleryQuery;

  const title = useMemo(() => selectedFolder ? selectedFolder.name : 'Collection', [selectedFolder]);
  const subtitle = useMemo(() => selectedFolder ? 'Files in folder' : 'Your files', [selectedFolder]);

  const handleFileClick = useCallback(async (index: number) => {
    if (selectionMode) {
      const file = files?.[index];
      if (file) {
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          if (newSet.has(file.id)) {
            newSet.delete(file.id);
          } else {
            newSet.add(file.id);
          }
          return newSet;
        });
      }
    } else {
      const file = files?.[index];
      if (!file) return;

      // Handle link items
      if (file.link) {
        const opened = await openExternally(file.link);
        if (!opened) {
          setCurrentLinkUrl(file.link);
          setLinkFallbackOpen(true);
        }
        return;
      }

      // Handle file items
      if (!file.blob) return;

      // Check if file should download directly (unsupported types)
      if (shouldDownloadDirectly(file)) {
        try {
          await downloadFile(file.blob.getDirectURL(), file.name);
        } catch (error) {
          console.error('Download failed:', error);
        }
      } else if (shouldOpenInViewer(file)) {
        // Open in-app viewer for PDFs, images, videos, and Office docs
        setSelectedIndex(index);
        setViewerOpen(true);
      }
    }
  }, [selectionMode, files]);

  const handleLongPress = useCallback((fileId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedFiles(new Set([fileId]));
    }
  }, [selectionMode]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedFiles(new Set());
  }, []);

  const handleSendToFolder = useCallback(() => {
    setSendToFolderOpen(true);
  }, []);

  const handleMoveToMission = useCallback(() => {
    setMoveToMissionOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!files || selectedFiles.size === 0) return;

    const selectedFileObjects = files.filter(f => selectedFiles.has(f.id));

    if (!navigator.share) {
      console.log('Web Share API not supported');
      return;
    }

    setIsSharing(true);
    try {
      const filePromises = selectedFileObjects
        .filter(f => f.blob) // Only share files with blobs, not links
        .map(async (file) => {
          const response = await fetch(file.blob!.getDirectURL());
          const blob = await response.blob();
          return new File([blob], file.name, { type: file.mimeType });
        });

      const filesToShare = await Promise.all(filePromises);

      await navigator.share({
        title: selectedFiles.size === 1 ? selectedFileObjects[0].name : `${selectedFiles.size} files`,
        text: `Sharing ${selectedFiles.size} ${selectedFiles.size === 1 ? 'file' : 'files'}`,
        files: filesToShare,
      });

      exitSelectionMode();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing files:', error);
      }
    } finally {
      setIsSharing(false);
    }
  }, [files, selectedFiles, exitSelectionMode]);

  const handleDownload = useCallback(async () => {
    if (!files) return;
    
    const selectedFileObjects = files.filter(f => selectedFiles.has(f.id));
    
    for (const file of selectedFileObjects) {
      if (file.blob) {
        try {
          await downloadFile(file.blob.getDirectURL(), file.name);
        } catch (error) {
          console.error('Download failed for', file.name, error);
        }
      }
    }
    
    exitSelectionMode();
  }, [files, selectedFiles, exitSelectionMode]);

  const handleDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      await deleteFiles.mutateAsync(Array.from(selectedFiles));
      exitSelectionMode();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [selectedFiles, deleteFiles, exitSelectionMode]);

  const handleMoveComplete = useCallback(() => {
    exitSelectionMode();
  }, [exitSelectionMode]);

  const handleRetryOpenLink = useCallback(async () => {
    if (currentLinkUrl) {
      await openExternally(currentLinkUrl);
    }
  }, [currentLinkUrl]);

  const handleCopyLink = useCallback(async () => {
    if (currentLinkUrl && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentLinkUrl);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  }, [currentLinkUrl]);

  useEffect(() => {
    if (selectionMode && selectedFiles.size === 0) {
      exitSelectionMode();
    }
  }, [selectionMode, selectedFiles.size, exitSelectionMode]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-6">
          {selectedFolder && (
            <Button variant="ghost" onClick={onBackToMain} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to collection
            </Button>
          )}
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="w-[100px] h-[100px] rounded-lg" />
              <Skeleton className="mt-1.5 h-3 w-[100px]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="mb-6">
          {selectedFolder && (
            <Button variant="ghost" onClick={onBackToMain} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to collection
            </Button>
          )}
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4">
              <FileIcon className="h-8 w-8 text-destructive" />
            </div>
            <p className="mt-4 text-lg font-medium">Error loading files</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again later</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!files || files.length === 0) {
    return (
      <section>
        <div className="mb-6">
          {selectedFolder && (
            <Button variant="ghost" onClick={onBackToMain} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to collection
            </Button>
          )}
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium">No files</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedFolder ? 'This folder is empty' : 'Upload files to see them here'}
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Filter out link items for the viewer (only show files with blobs)
  const viewableFiles = files.filter(f => f.blob);

  return (
    <section className="relative pb-32">
      <div className="mb-6">
        {selectedFolder && (
          <Button variant="ghost" onClick={onBackToMain} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to collection
          </Button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
            <p className="mt-1 text-muted-foreground">
              {selectionMode 
                ? `${selectedFiles.size} selected of ${files.length}`
                : `${files.length} ${files.length === 1 ? 'item' : 'items'}`
              }
            </p>
          </div>
          {selectionMode && (
            <Button variant="outline" onClick={exitSelectionMode}>Cancel</Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <FileCard
            key={file.id}
            file={file}
            onClick={() => handleFileClick(index)}
            isSelected={selectedFiles.has(file.id)}
            isSelectionMode={selectionMode}
            onLongPress={() => handleLongPress(file.id)}
          />
        ))}
      </div>

      {selectionMode && selectedFiles.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-40">
          <div className="max-w-[430px] mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={handleSendToFolder}
                className="flex-1 min-w-[100px] max-w-[140px] h-9 text-xs font-medium"
              >
                <FolderInput className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Folder</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleMoveToMission}
                className="flex-1 min-w-[100px] max-w-[140px] h-9 text-xs font-medium"
              >
                <Target className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Mission</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1 min-w-[100px] max-w-[140px] h-9 text-xs font-medium"
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Share</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="flex-1 min-w-[100px] max-w-[140px] h-9 text-xs font-medium"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Download</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFiles.isPending}
                className="flex-1 min-w-[100px] max-w-[140px] h-9 text-xs font-medium"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <FullScreenViewer
        files={viewableFiles}
        initialIndex={selectedIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={Array.from(selectedFiles)}
        onMoveComplete={handleMoveComplete}
      />

      <MoveToMissionDialog
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        fileIds={Array.from(selectedFiles)}
        onMoveComplete={handleMoveComplete}
      />

      <LinkOpenFallbackDialog
        open={linkFallbackOpen}
        onOpenChange={setLinkFallbackOpen}
        linkUrl={currentLinkUrl}
        onRetryOpen={handleRetryOpenLink}
        onCopyLink={handleCopyLink}
      />
    </section>
  );
}
