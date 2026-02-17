import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download, Trash2, FolderInput, Share2, ExternalLink, Target } from 'lucide-react';
import { useDeleteFile } from '@/hooks/useQueries';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import { getFileCategory } from '@/utils/filePreview';
import { openFileInSameTab, downloadFile } from '@/utils/externalOpen';
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

  const handleOpenExternally = () => {
    if (!currentFile || !currentFile.blob) return;
    openFileInSameTab(currentFile.blob.getDirectURL());
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

  if (!currentFile) return null;

  const fileCategory = getFileCategory(currentFile.mimeType);
  const fileUrl = currentFile.blob?.getDirectURL() || '';
  const canShare = 'share' in navigator;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95 border-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <h2 className="text-white text-lg font-medium truncate flex-1 pr-4">
                {currentFile.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 shrink-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {fileCategory === 'image' && currentFile.blob && (
                <img
                  src={fileUrl}
                  alt={currentFile.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {fileCategory === 'video' && currentFile.blob && (
                <video
                  src={fileUrl}
                  controls
                  className="max-w-full max-h-full"
                />
              )}

              {fileCategory === 'pdf' && currentFile.blob && (
                <div className="w-full h-full p-4">
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0 bg-white"
                    title={currentFile.name}
                  />
                </div>
              )}

              {fileCategory === 'office' && currentFile.blob && (
                <div className="w-full h-full p-4">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    className="w-full h-full border-0 bg-white"
                    title={currentFile.name}
                  />
                </div>
              )}

              {fileCategory === 'unsupported' && (
                <div className="text-white text-center space-y-4 p-8">
                  <p className="text-lg font-medium">Preview not available</p>
                  <p className="text-sm text-white/70">
                    This file type cannot be previewed
                  </p>
                  <div className="flex gap-3 justify-center pt-4">
                    <Button
                      onClick={handleOpenExternally}
                      variant="default"
                      className="bg-white text-black hover:bg-white/90"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in app
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-white text-white hover:bg-white/20"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Bottom action bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  onClick={handleOpenExternally}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in app
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {canShare && (
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                )}
                <Button
                  onClick={handleSendToFolder}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <FolderInput className="mr-2 h-4 w-4" />
                  Folder
                </Button>
                <Button
                  onClick={handleMoveToMission}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Mission
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-white/20"
                  disabled={deleteFile.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
              {files.length > 1 && (
                <div className="text-center text-white/70 text-sm mt-2">
                  {currentIndex + 1} / {files.length}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={[currentFile.id]}
        currentFolderId={currentFile.folderId}
        onMoveComplete={handleMoveComplete}
      />

      <MoveToMissionDialog
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        fileIds={[currentFile.id]}
        onMoveComplete={handleMoveComplete}
      />
    </>
  );
}
