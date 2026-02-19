import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { useGetFilesNotInFolder, useGetFilesInFolder, useDeleteFiles } from '@/hooks/useQueries';
import { useGetNotesNotInFolder, useGetNotesInFolder, useDeleteNotes } from '@/hooks/useNotesQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileImage, FileVideo, File as FileIcon, ArrowLeft, FileText, FileSpreadsheet, FolderInput, Download, Trash2, Check, Share2, Target, ExternalLink, StickyNote, CheckSquare, Square } from 'lucide-react';
import FullScreenViewer from './FullScreenViewer';
import NoteViewerDialog from './NoteViewerDialog';
import SendToFolderDialog from './SendToFolderDialog';
import MoveToMissionDialog from './MoveToMissionDialog';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { shouldOpenInViewer, shouldDownloadDirectly } from '@/utils/fileOpenRules';
import { downloadFile, openExternally, shareFile, downloadNoteAsText, shareNote } from '@/utils/externalOpen';
import { toast } from 'sonner';
import type { FileMetadata, Folder, Note } from '@/backend';

interface GallerySectionProps {
  selectedFolder: Folder | null;
  onBackToMain: () => void;
  onBulkSelectionChange?: (isActive: boolean) => void;
  hideCollection?: boolean;
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

export default function GallerySection({ selectedFolder, onBackToMain, onBulkSelectionChange, hideCollection = false }: GallerySectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [noteViewerOpen, setNoteViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
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

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const fileItems: GalleryItem[] = (files || []).map(f => ({ type: 'file' as const, data: f }));
    const noteItems: GalleryItem[] = (notes || []).map(n => ({ type: 'note' as const, data: n }));
    return [...fileItems, ...noteItems];
  }, [files, notes]);

  const title = useMemo(() => selectedFolder ? selectedFolder.name : 'Collection', [selectedFolder]);
  const subtitle = useMemo(() => selectedFolder ? 'Files and notes in folder' : 'Your files and notes', [selectedFolder]);

  const allItemsSelected = useMemo(() => {
    if (galleryItems.length === 0) return false;
    return galleryItems.every(item => {
      const itemId = item.type === 'file' ? item.data.id : `note-${item.data.id}`;
      return selectedItems.has(itemId);
    });
  }, [galleryItems, selectedItems]);

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
        setSelectedNote(item.data);
        setNoteViewerOpen(true);
        return;
      }

      const file = item.data;

      if (file.link) {
        const opened = await openExternally(file.link);
        if (!opened) {
          setCurrentLinkUrl(file.link);
          setLinkFallbackOpen(true);
        }
        return;
      }

      if (!file.blob) return;

      if (shouldDownloadDirectly(file)) {
        try {
          await downloadFile(file.blob.getDirectURL(), file.name);
        } catch (error) {
          console.error('Download failed:', error);
        }
      } else if (shouldOpenInViewer(file)) {
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

  const handleToggleSelectAll = useCallback(() => {
    if (allItemsSelected) {
      setSelectedItems(new Set());
    } else {
      const allIds = galleryItems.map(item => 
        item.type === 'file' ? item.data.id : `note-${item.data.id}`
      );
      setSelectedItems(new Set(allIds));
    }
  }, [allItemsSelected, galleryItems]);

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

  const selectedFileIds = useMemo(() => {
    return Array.from(selectedItems).filter(id => !id.startsWith('note-'));
  }, [selectedItems]);

  const selectedNoteIds = useMemo(() => {
    return Array.from(selectedItems)
      .filter(id => id.startsWith('note-'))
      .map(id => BigInt(id.replace('note-', '')));
  }, [selectedItems]);

  const handleRetryOpenLink = useCallback(async () => {
    if (currentLinkUrl) {
      await openExternally(currentLinkUrl);
    }
  }, [currentLinkUrl]);

  const handleCopyLink = useCallback(async () => {
    if (currentLinkUrl) {
      await navigator.clipboard.writeText(currentLinkUrl);
    }
  }, [currentLinkUrl]);

  if (hideCollection && !selectedFolder) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-[100px] h-[100px] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {selectedFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackToMain}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            {!selectionMode && galleryItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSelectAll}
                className="gap-2"
              >
                {allItemsSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {allItemsSelected ? 'Deselect' : 'Select All'}
              </Button>
            )}
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No files or notes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {galleryItems.map((item, index) => {
                if (item.type === 'file') {
                  const isSelected = selectedItems.has(item.data.id);
                  return (
                    <FileCard
                      key={item.data.id}
                      file={item.data}
                      onClick={() => handleItemClick(index)}
                      isSelected={isSelected}
                      isSelectionMode={selectionMode}
                      onLongPress={() => handleLongPress(item.data.id)}
                    />
                  );
                } else {
                  const itemId = `note-${item.data.id}`;
                  const isSelected = selectedItems.has(itemId);
                  return (
                    <NoteCard
                      key={itemId}
                      note={item.data}
                      onClick={() => handleItemClick(index)}
                      isSelected={isSelected}
                      isSelectionMode={selectionMode}
                      onLongPress={() => handleLongPress(itemId)}
                    />
                  );
                }
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectionMode && selectedItems.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
            >
              Cancel
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSendToFolderOpen(true)}
              disabled={selectedItems.size === 0}
              title="Send to folder"
            >
              <FolderInput className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMoveToMissionOpen(true)}
              disabled={selectedItems.size === 0}
              title="Send to mission"
            >
              <Target className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareSelected}
              disabled={selectedItems.size === 0 || isSharing}
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadSelected}
              disabled={selectedItems.size === 0}
              title="Download"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteSelected}
              disabled={selectedItems.size === 0}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {viewerOpen && files && (
        <FullScreenViewer
          files={files}
          initialIndex={selectedIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {noteViewerOpen && selectedNote && (
        <NoteViewerDialog
          note={selectedNote}
          open={noteViewerOpen}
          onOpenChange={setNoteViewerOpen}
        />
      )}

      <SendToFolderDialog
        open={sendToFolderOpen}
        onOpenChange={setSendToFolderOpen}
        fileIds={selectedFileIds}
        noteIds={selectedNoteIds}
        onMoveComplete={() => {
          setSelectionMode(false);
          setSelectedItems(new Set());
        }}
      />

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

      <LinkOpenFallbackDialog
        open={linkFallbackOpen}
        onOpenChange={setLinkFallbackOpen}
        linkUrl={currentLinkUrl}
        onRetryOpen={handleRetryOpenLink}
        onCopyLink={handleCopyLink}
      />
    </>
  );
}
