import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { useGetFilesNotInFolder, useGetFilesInFolder, useDeleteFiles } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileImage, FileVideo, File as FileIcon, ArrowLeft, FileText, FileSpreadsheet, FolderInput, Download, Trash2, Check, Share2, Target, ExternalLink } from 'lucide-react';
import FullScreenViewer from './FullScreenViewer';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import { shouldOpenInViewer, shouldDownloadDirectly } from '@/utils/fileOpenRules';
import { downloadFile, openExternally } from '@/utils/externalOpen';
import type { FileMetadata, Folder } from '@/backend';

interface GallerySectionProps {
  selectedFolder: Folder | null;
  onBackToMain: () => void;
  onBulkSelectionChange?: (isActive: boolean) => void;
  isActorInitializing?: boolean;
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

export default function GallerySection({ selectedFolder, onBackToMain, onBulkSelectionChange, isActorInitializing = false }: GallerySectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sendToFolderOpen, setSendToFolderOpen] = useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const mainGalleryQuery = useGetFilesNotInFolder();
  const folderGalleryQuery = useGetFilesInFolder(selectedFolder?.id ?? null);
  const deleteFiles = useDeleteFiles();

  const { data: files, isLoading, isFetching, error } = selectedFolder ? folderGalleryQuery : mainGalleryQuery;

  // Show skeleton placeholders during actor initialization
  const showPlaceholder = isActorInitializing && !files;
  const showEmptyState = !isActorInitializing && !isLoading && !isFetching && (!files || files.length === 0);

  useEffect(() => {
    onBulkSelectionChange?.(selectionMode && selectedFiles.size > 0);
  }, [selectionMode, selectedFiles.size, onBulkSelectionChange]);

  const handleFileClick = useCallback((index: number) => {
    const file = files?.[index];
    if (!file) return;

    if (selectionMode) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(file.id)) {
          newSet.delete(file.id);
        } else {
          newSet.add(file.id);
        }
        return newSet;
      });
    } else {
      if (file.link) {
        openExternally(file.link);
      } else if (shouldOpenInViewer(file)) {
        setSelectedIndex(index);
        setViewerOpen(true);
      } else if (shouldDownloadDirectly(file)) {
        if (file.blob) {
          downloadFile(file.blob.getDirectURL(), file.name);
        }
      }
    }
  }, [files, selectionMode]);

  const handleLongPress = useCallback((index: number) => {
    const file = files?.[index];
    if (!file) return;

    if (!selectionMode) {
      setSelectionMode(true);
    }
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.add(file.id);
      return newSet;
    });
  }, [files, selectionMode]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedFiles(new Set());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedFiles.size === 0) return;

    const fileIds = Array.from(selectedFiles).map(id => BigInt(id));
    try {
      await deleteFiles.mutateAsync(fileIds);
      setSelectionMode(false);
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Failed to delete files:', error);
    }
  }, [selectedFiles, deleteFiles]);

  const handleMoveToFolder = useCallback(() => {
    if (selectedFiles.size === 0) return;
    setSendToFolderOpen(true);
  }, [selectedFiles]);

  const handleMoveToMission = useCallback(() => {
    if (selectedFiles.size === 0) return;
    setMoveToMissionOpen(true);
  }, [selectedFiles]);

  const handleShare = useCallback(async () => {
    if (selectedFiles.size === 0 || !files) return;

    const selectedFileObjects = files.filter(f => selectedFiles.has(f.id));
    
    if (selectedFileObjects.length === 1) {
      const file = selectedFileObjects[0];
      if (file.link) {
        if (navigator.share) {
          try {
            setIsSharing(true);
            await navigator.share({
              title: file.name,
              url: file.link,
            });
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Share failed:', error);
            }
          } finally {
            setIsSharing(false);
          }
        } else {
          await navigator.clipboard.writeText(file.link);
          alert('Link copied to clipboard!');
        }
      } else if (file.blob) {
        const url = file.blob.getDirectURL();
        if (navigator.share) {
          try {
            setIsSharing(true);
            await navigator.share({
              title: file.name,
              url: url,
            });
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Share failed:', error);
            }
          } finally {
            setIsSharing(false);
          }
        } else {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      const urls = selectedFileObjects
        .map(f => f.link || (f.blob ? f.blob.getDirectURL() : null))
        .filter(Boolean)
        .join('\n');
      
      if (navigator.share) {
        try {
          setIsSharing(true);
          await navigator.share({
            title: `${selectedFileObjects.length} items`,
            text: urls,
          });
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
          }
        } finally {
          setIsSharing(false);
        }
      } else {
        await navigator.clipboard.writeText(urls);
        alert('Links copied to clipboard!');
      }
    }
  }, [selectedFiles, files]);

  const handleSendToFolderComplete = useCallback(() => {
    setSelectionMode(false);
    setSelectedFiles(new Set());
    setSendToFolderOpen(false);
  }, []);

  const handleMoveToMissionComplete = useCallback(() => {
    setSelectionMode(false);
    setSelectedFiles(new Set());
    setMoveToMissionOpen(false);
  }, []);

  const selectedFileIds = useMemo(() => Array.from(selectedFiles), [selectedFiles]);

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-destructive">Failed to load files. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6">
        <CardContent className="pt-6">
          {selectedFolder && (
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToMain}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="text-lg font-semibold">{selectedFolder.name}</h2>
            </div>
          )}

          {showPlaceholder ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-[100px] h-[100px] rounded-lg" />
                  <Skeleton className="w-[100px] h-3" />
                </div>
              ))}
            </div>
          ) : showEmptyState ? (
            <div className="text-center py-12">
              <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {selectedFolder ? 'No files in this folder yet' : 'No files yet. Upload your first file!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {files?.map((file, index) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() => handleFileClick(index)}
                  isSelected={selectedFiles.has(file.id)}
                  isSelectionMode={selectionMode}
                  onLongPress={() => handleLongPress(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectionMode && selectedFiles.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 bg-background border-t shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {selectedFiles.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
                className="gap-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {!selectedFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMoveToFolder}
                  className="gap-1"
                >
                  <FolderInput className="h-4 w-4" />
                  Folder
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveToMission}
                className="gap-1"
              >
                <Target className="h-4 w-4" />
                Mission
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleteFiles.isPending}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSelection}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {files && files.length > 0 && (
        <FullScreenViewer
          files={files}
          initialIndex={selectedIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      <SendToFolderDialog
        fileIds={selectedFileIds}
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        onComplete={handleSendToFolderComplete}
      />

      <MoveToMissionDialog
        fileIds={selectedFileIds}
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        onComplete={handleMoveToMissionComplete}
      />
    </>
  );
}
