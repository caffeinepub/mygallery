import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { useGetFilesNotInFolder, useGetFilesInFolder, useDeleteFiles } from '@/hooks/useQueries';
import { useGetNotesNotInFolder, useGetNotesInFolder, useDeleteNotes } from '@/hooks/useNotesQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileImage, FileVideo, File as FileIcon, ArrowLeft, FileText, FileSpreadsheet, FolderInput, Download, Trash2, Check, Share2, Target, ExternalLink, StickyNote } from 'lucide-react';
import FullScreenViewer from './FullScreenViewer';
import NoteViewerDialog from './NoteViewerDialog';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { shouldOpenInViewer, shouldDownloadDirectly } from '@/utils/fileOpenRules';
import { downloadFile, openExternally, shareFile, downloadNoteAsText, shareNote } from '@/utils/externalOpen';
import type { FileMetadata, Folder, Note } from '@/backend';

interface GallerySectionProps {
  selectedFolder: Folder | null;
  onBackToMain: () => void;
  onBulkSelectionChange?: (isActive: boolean) => void;
}

type GalleryItem = 
  | { type: 'file'; data: FileMetadata }
  | { type: 'note'; data: Note };

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

const NoteCard = memo(({ 
  note, 
  onClick, 
  isSelected, 
  isSelectionMode,
  onLongPress 
}: { 
  note: Note; 
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
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <StickyNote className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div className={`absolute inset-0 transition-colors duration-150 ${
          isSelected ? 'bg-primary/20' : 'bg-black/0 group-hover:bg-black/10'
        }`} />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
            <Check className="h-4 w-4" />
          </div>
        )}
        {!isSelected && (
          <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1 shadow-md">
            <StickyNote className="h-3 w-3" />
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs truncate w-[100px]" title={note.title}>
        {note.title}
      </p>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectionMode === nextProps.isSelectionMode
  );
});

NoteCard.displayName = 'NoteCard';

export default function GallerySection({ selectedFolder, onBackToMain, onBulkSelectionChange }: GallerySectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [noteViewerOpen, setNoteViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sendToFolderOpen, setSendToFolderOpen] = useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const mainFilesQuery = useGetFilesNotInFolder();
  const folderFilesQuery = useGetFilesInFolder(selectedFolder?.id ?? null);
  const mainNotesQuery = useGetNotesNotInFolder();
  const folderNotesQuery = useGetNotesInFolder(selectedFolder?.id ?? null);
  const deleteFiles = useDeleteFiles();
  const deleteNotes = useDeleteNotes();

  const { data: files, isLoading: isLoadingFiles } = selectedFolder ? folderFilesQuery : mainFilesQuery;
  const { data: notes, isLoading: isLoadingNotes } = selectedFolder ? folderNotesQuery : mainNotesQuery;

  const isLoading = isLoadingFiles || isLoadingNotes;

  // Combine files and notes into a single gallery items array
  const galleryItems = useMemo<GalleryItem[]>(() => {
    const fileItems: GalleryItem[] = (files || []).map(f => ({ type: 'file' as const, data: f }));
    const noteItems: GalleryItem[] = (notes || []).map(n => ({ type: 'note' as const, data: n }));
    return [...fileItems, ...noteItems];
  }, [files, notes]);

  const title = useMemo(() => selectedFolder ? selectedFolder.name : 'Collection', [selectedFolder]);
  const subtitle = useMemo(() => selectedFolder ? 'Files and notes in folder' : 'Your files and notes', [selectedFolder]);

  // Notify parent when bulk selection state changes
  useEffect(() => {
    const isBulkActive = selectionMode && selectedItems.size > 0;
    onBulkSelectionChange?.(isBulkActive);
  }, [selectionMode, selectedItems.size, onBulkSelectionChange]);

  const handleItemClick = useCallback(async (index: number) => {
    if (selectionMode) {
      const item = galleryItems[index];
      if (item) {
        const itemId = item.type === 'file' ? item.data.id : `note-${item.data.id}`;
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      }
    } else {
      const item = galleryItems[index];
      if (!item) return;

      if (item.type === 'note') {
        setSelectedNoteId(item.data.id);
        setNoteViewerOpen(true);
        return;
      }

      const file = item.data;

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
        const fileIndex = files?.findIndex(f => f.id === file.id) ?? 0;
        setSelectedIndex(fileIndex);
        setViewerOpen(true);
      }
    }
  }, [selectionMode, galleryItems, files]);

  const handleLongPress = useCallback((itemId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedItems(new Set([itemId]));
    }
  }, [selectionMode]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    const fileIds: string[] = [];
    const noteIds: bigint[] = [];

    selectedItems.forEach(itemId => {
      if (itemId.startsWith('note-')) {
        noteIds.push(BigInt(itemId.replace('note-', '')));
      } else {
        fileIds.push(itemId);
      }
    });

    try {
      if (fileIds.length > 0) {
        await deleteFiles.mutateAsync(fileIds);
      }
      if (noteIds.length > 0) {
        await deleteNotes.mutateAsync(noteIds);
      }
      setSelectionMode(false);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Delete error:', error);
    }
  }, [selectedItems, deleteFiles, deleteNotes]);

  const handleDownloadSelected = useCallback(async () => {
    for (const itemId of selectedItems) {
      if (itemId.startsWith('note-')) {
        const note = notes?.find(n => n.id === itemId.replace('note-', ''));
        if (note) {
          downloadNoteAsText(note.title, note.body);
        }
      } else {
        const file = files?.find(f => f.id === itemId);
        if (file?.blob) {
          try {
            await downloadFile(file.blob.getDirectURL(), file.name);
          } catch (error) {
            console.error('Download failed:', error);
          }
        }
      }
    }
  }, [selectedItems, files, notes]);

  const handleShareSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    setIsSharing(true);
    try {
      for (const itemId of selectedItems) {
        if (itemId.startsWith('note-')) {
          const note = notes?.find(n => n.id === itemId.replace('note-', ''));
          if (note) {
            await shareNote(note.title, note.body);
          }
        } else {
          const file = files?.find(f => f.id === itemId);
          if (file?.blob) {
            await shareFile(file.blob.getDirectURL(), file.name);
          }
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  }, [selectedItems, files, notes]);

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return notes?.find(n => n.id === selectedNoteId) ?? null;
  }, [selectedNoteId, notes]);

  const selectedFileIds = useMemo(() => {
    return Array.from(selectedItems).filter(id => !id.startsWith('note-'));
  }, [selectedItems]);

  const selectedNoteIds = useMemo(() => {
    return Array.from(selectedItems)
      .filter(id => id.startsWith('note-'))
      .map(id => BigInt(id.replace('note-', '')));
  }, [selectedItems]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-[100px] h-[100px] rounded-lg" />
              <Skeleton className="w-[100px] h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedFolder && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToMain}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>

        {galleryItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No items yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {galleryItems.map((item, index) => {
              const itemId = item.type === 'file' ? item.data.id : `note-${item.data.id}`;
              const isSelected = selectedItems.has(itemId);

              return item.type === 'file' ? (
                <FileCard
                  key={itemId}
                  file={item.data}
                  onClick={() => handleItemClick(index)}
                  isSelected={isSelected}
                  isSelectionMode={selectionMode}
                  onLongPress={() => handleLongPress(itemId)}
                />
              ) : (
                <NoteCard
                  key={itemId}
                  note={item.data}
                  onClick={() => handleItemClick(index)}
                  isSelected={isSelected}
                  isSelectionMode={selectionMode}
                  onLongPress={() => handleLongPress(itemId)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectionMode && selectedItems.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  {selectedItems.size} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSelection}
                >
                  Cancel
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSendToFolderOpen(true)}
                  className="flex flex-col h-auto py-2 px-1"
                >
                  <FolderInput className="h-5 w-5 mb-1" />
                  <span className="text-xs">Folder</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoveToMissionOpen(true)}
                  className="flex flex-col h-auto py-2 px-1"
                >
                  <Target className="h-5 w-5 mb-1" />
                  <span className="text-xs">Mission</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSelected}
                  className="flex flex-col h-auto py-2 px-1"
                >
                  <Download className="h-5 w-5 mb-1" />
                  <span className="text-xs">Download</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareSelected}
                  disabled={isSharing}
                  className="flex flex-col h-auto py-2 px-1"
                >
                  <Share2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Share</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={deleteFiles.isPending || deleteNotes.isPending}
                  className="flex flex-col h-auto py-2 px-1"
                >
                  <Trash2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Screen Viewer */}
      {viewerOpen && files && files.length > 0 && (
        <FullScreenViewer
          files={files.filter(f => f.blob)}
          initialIndex={selectedIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Note Viewer Dialog */}
      {noteViewerOpen && selectedNote && (
        <NoteViewerDialog
          note={selectedNote}
          open={noteViewerOpen}
          onOpenChange={setNoteViewerOpen}
          onSendToFolder={() => {
            setNoteViewerOpen(false);
            setSelectionMode(true);
            setSelectedItems(new Set([`note-${selectedNote.id}`]));
            setSendToFolderOpen(true);
          }}
          onSendToMission={() => {
            setNoteViewerOpen(false);
            setSelectionMode(true);
            setSelectedItems(new Set([`note-${selectedNote.id}`]));
            setMoveToMissionOpen(true);
          }}
        />
      )}

      {/* Send to Folder Dialog */}
      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={selectedFileIds}
        noteIds={selectedNoteIds}
        currentFolderId={selectedFolder?.id}
        onMoveComplete={() => {
          setSelectionMode(false);
          setSelectedItems(new Set());
        }}
      />

      {/* Move to Mission Dialog */}
      <MoveToMissionDialog
        open={moveToMissionOpen}
        onOpenChange={setMoveToMissionOpen}
        fileIds={selectedFileIds}
        noteIds={selectedNoteIds}
        onMoveComplete={() => {
          setSelectionMode(false);
          setSelectedItems(new Set());
        }}
      />

      {/* Link Fallback Dialog */}
      <LinkOpenFallbackDialog
        open={linkFallbackOpen}
        onOpenChange={setLinkFallbackOpen}
        linkUrl={currentLinkUrl}
        onRetryOpen={() => openExternally(currentLinkUrl)}
        onCopyLink={async () => {
          if (currentLinkUrl && navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(currentLinkUrl);
            } catch (error) {
              console.error('Failed to copy link:', error);
            }
          }
        }}
      />
    </>
  );
}
