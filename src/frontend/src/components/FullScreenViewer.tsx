import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download, Trash2, FolderInput, Share2, ExternalLink, Target } from 'lucide-react';
import { useDeleteFile } from '@/hooks/useQueries';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import ExternalOpenFallbackDialog from './ExternalOpenFallbackDialog';
import { getFileCategory } from '@/utils/filePreview';
import { openExternally, downloadFile } from '@/utils/externalOpen';
import type { FileMetadata } from '@/backend';

interface FullScreenViewerProps {
  files: FileMetadata[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FullScreenViewer({ files, initialIndex, open, onOpenChange }: FullScreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [sendToFolderOpen, setSendToFolderOpen] = useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [fallbackDialogOpen, setFallbackDialogOpen] = useState(false);
  const deleteFile = useDeleteFile();

  const currentFile = files[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  }, [files.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  }, [files.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handleDownload = async () => {
    if (!currentFile || !currentFile.blob) return;

    try {
      await downloadFile(currentFile.blob.getDirectURL(), currentFile.name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentFile) return;

    try {
      await deleteFile.mutateAsync(currentFile.id);
      if (files.length === 1) {
        onOpenChange(false);
      } else {
        if (currentIndex >= files.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleShare = async () => {
    if (!currentFile || !currentFile.blob) return;

    if (!navigator.share) {
      console.log('Web Share API not supported');
      return;
    }

    try {
      const response = await fetch(currentFile.blob.getDirectURL());
      const blob = await response.blob();
      const file = new File([blob], currentFile.name, { type: currentFile.mimeType });

      await navigator.share({
        title: currentFile.name,
        files: [file],
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing file:', error);
      }
    }
  };

  const handleSendToFolder = () => {
    setSendToFolderOpen(true);
  };

  const handleMoveToMission = () => {
    setMoveToMissionOpen(true);
  };

  const handleOpenExternally = async () => {
    if (!currentFile || !currentFile.blob) return;
    const success = await openExternally(currentFile.blob.getDirectURL());
    if (!success) {
      setFallbackDialogOpen(true);
    }
  };

  const handleFallbackDownload = async () => {
    if (!currentFile || !currentFile.blob) return;
    try {
      await downloadFile(currentFile.blob.getDirectURL(), currentFile.name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleFallbackRetry = async () => {
    if (!currentFile || !currentFile.blob) return;
    await openExternally(currentFile.blob.getDirectURL());
  };

  const handleMoveComplete = () => {
    if (files.length === 1) {
      onOpenChange(false);
    } else {
      if (currentIndex >= files.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrevious, handleNext, onOpenChange]);

  if (!currentFile || !currentFile.blob) return null;

  const fileCategory = getFileCategory(currentFile.mimeType);
  const isImage = fileCategory === 'image';
  const isVideo = fileCategory === 'video';
  const isPDF = fileCategory === 'pdf';
  const isOffice = fileCategory === 'office';
  const isUnsupported = fileCategory === 'unsupported';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95 border-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
              {isImage && (
                <img
                  src={currentFile.blob.getDirectURL()}
                  alt={currentFile.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {isVideo && (
                <video
                  src={currentFile.blob.getDirectURL()}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              )}
              {isPDF && (
                <iframe
                  src={currentFile.blob.getDirectURL()}
                  className="w-full h-full border-0"
                  title={currentFile.name}
                />
              )}
              {isOffice && (
                <div className="w-full h-full flex flex-col">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFile.blob.getDirectURL())}`}
                    className="w-full h-full border-0"
                    title={currentFile.name}
                  />
                </div>
              )}
              {isUnsupported && (
                <div className="text-center text-white px-4">
                  <p className="text-lg mb-6">{currentFile.name}</p>
                  <p className="text-sm text-white/70 mb-6">This file type cannot be previewed</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleDownload} variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 flex-shrink-0">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
                  <Button
                    variant="secondary"
                    onClick={handleSendToFolder}
                    className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                  >
                    <FolderInput className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Folder</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleMoveToMission}
                    className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                  >
                    <Target className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Mission</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleShare}
                    className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                  >
                    <Share2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Share</span>
                  </Button>
                  {isOffice && (
                    <Button
                      variant="secondary"
                      onClick={handleOpenExternally}
                      className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">New Tab</span>
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={handleDownload}
                    className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Download</span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteFile.isPending}
                    className="flex-1 min-w-[100px] max-w-[160px] h-9 sm:h-10 text-xs sm:text-sm font-medium"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Delete</span>
                  </Button>
                </div>
                <div className="text-center mt-2 sm:mt-3">
                  <p className="text-xs sm:text-sm text-white/70">
                    {currentIndex + 1} of {files.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={[currentFile.id]}
        sourceFolderId={currentFile.folderId ?? undefined}
        onMoveComplete={handleMoveComplete}
      />

      <MoveToMissionDialog
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        fileIds={[currentFile.id]}
        onMoveComplete={handleMoveComplete}
      />

      {currentFile && currentFile.blob && (
        <ExternalOpenFallbackDialog
          open={fallbackDialogOpen}
          onOpenChange={setFallbackDialogOpen}
          fileName={currentFile.name}
          fileUrl={currentFile.blob.getDirectURL()}
          onRetryOpen={handleFallbackRetry}
          onDownload={handleFallbackDownload}
        />
      )}
    </>
  );
}
