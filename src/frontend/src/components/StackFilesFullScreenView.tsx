import { useState, useCallback, useMemo } from 'react';
import { X, Check, FolderInput, Target, Share2, Download, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStackedFiles } from '@/hooks/useStackedFiles';
import { useDeleteFiles } from '@/hooks/useQueries';
import { downloadFile, shareFile } from '@/utils/externalOpen';
import { toast } from 'sonner';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import FullScreenViewer from './FullScreenViewer';
import { shouldOpenInViewer, shouldDownloadDirectly } from '@/utils/fileOpenRules';
import type { FileMetadata } from '@/backend';
import { FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface StackFilesFullScreenViewProps {
  onClose: () => void;
}

export default function StackFilesFullScreenView({ onClose }: StackFilesFullScreenViewProps) {
  const { stackedFiles, removeFiles } = useStackedFiles();
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [sendToFolderOpen, setSendToFolderOpen] = useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const deleteFiles = useDeleteFiles();

  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  }, []);

  const handleFileClick = useCallback((file: FileMetadata, index: number) => {
    if (selectedFileIds.size > 0) {
      setSelectedFileIds(prev => {
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
        window.open(file.link, '_blank');
        return;
      }

      if (!file.blob) return;

      if (shouldDownloadDirectly(file)) {
        downloadFile(file.blob.getDirectURL(), file.name).catch(console.error);
      } else if (shouldOpenInViewer(file)) {
        setSelectedFileIndex(index);
        setViewerOpen(true);
      }
    }
  }, [selectedFileIds]);

  const handleLongPress = useCallback((fileId: string) => {
    setSelectedFileIds(new Set([fileId]));
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedFileIds.size === stackedFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(stackedFiles.map(f => f.id)));
    }
  }, [selectedFileIds, stackedFiles]);

  const handleDelete = useCallback(async () => {
    const fileIds = Array.from(selectedFileIds);
    try {
      await deleteFiles.mutateAsync(fileIds);
      removeFiles(fileIds);
      setSelectedFileIds(new Set());
      toast.success(`Deleted ${fileIds.length} file${fileIds.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete files');
    }
  }, [selectedFileIds, deleteFiles, removeFiles]);

  const handleDownload = useCallback(async () => {
    for (const fileId of selectedFileIds) {
      const file = stackedFiles.find(f => f.id === fileId);
      if (file?.blob) {
        try {
          await downloadFile(file.blob.getDirectURL(), file.name);
        } catch (error) {
          console.error('Download failed:', error);
        }
      }
    }
  }, [selectedFileIds, stackedFiles]);

  const handleShare = useCallback(async () => {
    const files = stackedFiles.filter(f => selectedFileIds.has(f.id));
    for (const file of files) {
      if (file.blob) {
        try {
          await shareFile(file.blob.getDirectURL(), file.name);
        } catch (error) {
          console.error('Share failed:', error);
        }
      }
    }
  }, [selectedFileIds, stackedFiles]);

  const handleSendToFolderComplete = useCallback(() => {
    const fileIds = Array.from(selectedFileIds);
    removeFiles(fileIds);
    setSelectedFileIds(new Set());
    setSendToFolderOpen(false);
  }, [selectedFileIds, removeFiles]);

  const handleMoveToMissionComplete = useCallback(() => {
    const fileIds = Array.from(selectedFileIds);
    removeFiles(fileIds);
    setSelectedFileIds(new Set());
    setMoveToMissionOpen(false);
  }, [selectedFileIds, removeFiles]);

  const allSelected = selectedFileIds.size === stackedFiles.length && stackedFiles.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">My Files</h2>
            <p className="text-xs text-muted-foreground">{stackedFiles.length} file{stackedFiles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {selectedFileIds.size === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSelectAll}
            className="gap-2"
          >
            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            {stackedFiles.map((file, index) => {
              const isSelected = selectedFileIds.has(file.id);
              const isLink = !!file.link;
              const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
              const isImage = !isLink && file.mimeType.startsWith('image/');
              const isVideo = !isLink && file.mimeType.startsWith('video/');

              return (
                <div
                  key={file.id}
                  className="group cursor-pointer relative select-none"
                  onClick={() => handleFileClick(file, index)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleLongPress(file.id);
                  }}
                >
                  <div className={`relative w-full aspect-square overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02] ${
                    isSelected ? 'ring-4 ring-primary shadow-lg scale-[1.02]' : ''
                  }`}>
                    {isLink ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                    ) : isImage && file.blob ? (
                      <img
                        src={file.blob.getDirectURL()}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
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
                  </div>
                  <p className="mt-1.5 text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {selectedFileIds.size > 0 && (
        <div className="border-t bg-card/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFileIds(new Set())}
            >
              Cancel
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedFileIds.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSendToFolderOpen(true)}
              title="Send to folder"
            >
              <FolderInput className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMoveToMissionOpen(true)}
              title="Send to mission"
            >
              <Target className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={Array.from(selectedFileIds)}
        onMoveComplete={handleSendToFolderComplete}
      />

      <MoveToMissionDialog
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        fileIds={Array.from(selectedFileIds)}
        onMoveComplete={handleMoveToMissionComplete}
      />

      {viewerOpen && (
        <FullScreenViewer
          files={stackedFiles}
          initialIndex={selectedFileIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </div>
  );
}
