import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Save, Trash2, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useListNotes, useCreateNote, useGetNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotesQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { toast } from 'sonner';
import { formatNotesTime } from '@/utils/notesTime';
import type { Note } from '@/backend';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';
import SwipeActionsRow from './SwipeActionsRow';

interface NotesFullScreenViewProps {
  onClose: () => void;
}

export default function NotesFullScreenView({ onClose }: NotesFullScreenViewProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<bigint | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<bigint | null>(null);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);

  const { status } = useBackendActor();
  const { data: notesList = [], isLoading: isLoadingList } = useListNotes();
  const { data: selectedNote, isLoading: isLoadingNote } = useGetNote(selectedNoteId);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const isCoarsePointer = useIsCoarsePointer();

  const isActorReady = status === 'ready';

  // Load selected note content when note data changes (only on initial load or note switch)
  useEffect(() => {
    if (selectedNote && !isCreating) {
      // Only update if we're switching to a different note or loading for the first time
      if (selectedNoteId && (!noteTitle || !noteContent || selectedNote.id !== selectedNoteId)) {
        setNoteContent(selectedNote.content);
        setNoteTitle(selectedNote.title);
      }
    }
  }, [selectedNote, isCreating, selectedNoteId]);

  const handleCreateNote = async () => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    if (!noteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    try {
      const newNoteId = await createNoteMutation.mutateAsync({
        title: noteTitle.trim(),
        content: noteContent,
      });
      
      // Keep editor open with the newly created note selected
      setIsCreating(false);
      setSelectedNoteId(newNoteId);
      // Keep mobile editor visible
      setShowMobileEditor(true);
      
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleSaveNote = async () => {
    if (!isActorReady || !selectedNoteId) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await updateNoteMutation.mutateAsync({
        noteId: selectedNoteId,
        title: noteTitle,
        content: noteContent,
      });
      
      // Keep the note selected and editor open after saving
      // Do NOT clear selection or editor state
      
      toast.success('Note saved successfully');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteNoteMutation.mutateAsync(noteId);
      
      // Clear editor state if the deleted note was selected
      if (selectedNoteId?.toString() === noteId.toString()) {
        setSelectedNoteId(null);
        setNoteContent('');
        setNoteTitle('');
        setShowMobileEditor(false);
      }
      
      setDeleteConfirmNoteId(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      // Error is already logged by the mutation hook with diagnostics
      // The optimistic update will be rolled back automatically
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      toast.error(errorMessage);
      // Keep the dialog open so user can retry or cancel
    }
  };

  const handleSelectNote = (noteId: bigint) => {
    // Close any open swipe row
    setOpenSwipeRowId(null);
    // Exit create mode
    setIsCreating(false);
    // Select the note (this will trigger the useEffect to load content)
    setSelectedNoteId(noteId);
    // Show editor on mobile
    setShowMobileEditor(true);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setSelectedNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    // Show editor on mobile
    setShowMobileEditor(true);
  };

  const handleBackToList = () => {
    // Return to list view on mobile without clearing draft
    setShowMobileEditor(false);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setSelectedNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setShowMobileEditor(false);
  };

  const handleOpenDeleteConfirm = (noteId: bigint) => {
    // Close any open swipe row
    setOpenSwipeRowId(null);
    setDeleteConfirmNoteId(noteId);
  };

  const hasContentChanges = selectedNote && (selectedNote.content !== noteContent || selectedNote.title !== noteTitle);
  const isEditing = isCreating || selectedNoteId !== null;

  const renderNoteRow = (note: Note) => {
    const noteId = note.id.toString();

    const noteContent = (
      <div
        className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
          selectedNoteId?.toString() === note.id.toString()
            ? 'bg-notes-bg border border-notes-accent'
            : 'hover:bg-muted'
        }`}
        onClick={() => handleSelectNote(note.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {note.title || 'Untitled Note'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNotesTime(new Date(Number(note.updatedAt) / 1000000))}
            </p>
          </div>
          {!isCoarsePointer && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteConfirm(note.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    );

    if (isCoarsePointer) {
      return (
        <SwipeActionsRow
          key={noteId}
          onEdit={() => handleSelectNote(note.id)}
          onDelete={() => handleOpenDeleteConfirm(note.id)}
          isOpen={openSwipeRowId === noteId}
          onOpenChange={(open) => {
            setOpenSwipeRowId(open ? noteId : null);
          }}
          disabled={!isActorReady}
        >
          {noteContent}
        </SwipeActionsRow>
      );
    }

    return <div key={noteId}>{noteContent}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-notes-bg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-notes-accent" />
              <h1 className="text-2xl font-bold">Notes</h1>
            </div>
          </div>
          <Button
            onClick={handleStartCreating}
            disabled={!isActorReady || isCreating}
            className="bg-notes-accent hover:bg-notes-accent-hover text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List Sidebar - Left Side - Hidden on mobile when editor is shown */}
        <div className={`w-full md:w-80 border-r bg-muted/20 flex flex-col ${showMobileEditor ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Your Notes ({notesList.length})
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoadingList ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-notes-accent border-r-transparent"></div>
                </div>
              ) : notesList.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notes yet. Create your first note!
                </div>
              ) : (
                notesList.map((note) => renderNoteRow(note))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Note Editor - Right Side - Full screen on mobile when shown */}
        <div className={`flex-1 flex flex-col ${showMobileEditor ? 'flex' : 'hidden md:flex'}`}>
          {isEditing ? (
            <div className="flex-1 flex flex-col">
              {/* Note Header */}
              <div className="border-b p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {/* Mobile back button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="md:hidden hover:bg-notes-bg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    disabled={!isActorReady}
                    className="text-xl font-bold border-0 focus-visible:ring-1 shadow-none px-0"
                    autoFocus={isCreating}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    disabled={!isActorReady}
                    title="Close editor"
                    className="hidden md:flex"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {selectedNote && !isCreating && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatNotesTime(new Date(Number(selectedNote.updatedAt) / 1000000))}
                  </p>
                )}
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4 flex flex-col">
                {isLoadingNote && !isCreating ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-notes-accent border-r-transparent"></div>
                      <p className="text-muted-foreground mt-2">Loading note...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder="Start writing your note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      disabled={!isActorReady}
                      className="flex-1 resize-none font-mono text-sm border-0 focus-visible:ring-0 shadow-none"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      {isCreating ? (
                        <Button
                          onClick={handleCreateNote}
                          disabled={!isActorReady || !noteTitle.trim() || createNoteMutation.isPending}
                          className="bg-notes-accent hover:bg-notes-accent-hover text-white"
                        >
                          {createNoteMutation.isPending ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Note
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSaveNote}
                          disabled={!isActorReady || !hasContentChanges || updateNoteMutation.isPending}
                          className="bg-notes-accent hover:bg-notes-accent-hover text-white"
                        >
                          {updateNoteMutation.isPending ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">No Note Selected</h2>
                  <p className="text-muted-foreground">
                    Select a note from the list or create a new one
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmNoteId !== null} onOpenChange={(open) => !open && setDeleteConfirmNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteNoteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmNoteId && handleDeleteNote(deleteConfirmNoteId)}
              disabled={deleteNoteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteNoteMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
