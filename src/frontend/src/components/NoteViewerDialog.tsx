import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderInput, Target, Download, Share2, Trash2 } from 'lucide-react';
import { useDeleteNotes } from '@/hooks/useNotesQueries';
import { toast } from 'sonner';
import { downloadNoteAsText, shareNote } from '@/utils/externalOpen';
import type { Note } from '@/backend';

interface NoteViewerDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendToFolder?: () => void;
  onSendToMission?: () => void;
}

export default function NoteViewerDialog({
  note,
  open,
  onOpenChange,
  onSendToFolder,
  onSendToMission,
}: NoteViewerDialogProps) {
  const [isSharing, setIsSharing] = useState(false);
  const deleteNotes = useDeleteNotes();

  const handleDownload = () => {
    downloadNoteAsText(note.title, note.body);
    toast.success('Note downloaded');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shared = await shareNote(note.title, note.body);
      if (!shared) {
        toast.error('Sharing not supported on this device');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share note');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotes.mutateAsync([BigInt(note.id)]);
      toast.success('Note deleted');
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{note.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {note.body || <span className="text-muted-foreground italic">No content</span>}
          </div>
        </ScrollArea>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {onSendToFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendToFolder}
              className="flex-1"
            >
              <FolderInput className="mr-2 h-4 w-4" />
              Send to Folder
            </Button>
          )}
          {onSendToMission && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendToMission}
              className="flex-1"
            >
              <Target className="mr-2 h-4 w-4" />
              Send to Mission
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteNotes.isPending}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
