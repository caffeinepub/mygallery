import { useState } from 'react';
import { FolderInput, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetFolders, useMoveFilesToFolder, useBatchRemoveFromFolder } from '@/hooks/useQueries';
import { useMoveNotesToFolder, useBatchRemoveNotesFromFolder } from '@/hooks/useNotesQueries';
import { toast } from 'sonner';
import type { Folder } from '@/backend';

interface SendToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds?: string[];
  noteIds?: bigint[];
  sourceFolderId?: bigint;
  onMoveComplete?: () => void;
}

export default function SendToFolderDialog({
  open,
  onOpenChange,
  fileIds = [],
  noteIds = [],
  sourceFolderId,
  onMoveComplete,
}: SendToFolderDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: folders, isLoading: isLoadingFolders } = useGetFolders();
  const moveFilesToFolderMutation = useMoveFilesToFolder();
  const moveNotesToFolderMutation = useMoveNotesToFolder();
  const batchRemoveFromFolderMutation = useBatchRemoveFromFolder();
  const batchRemoveNotesFromFolderMutation = useBatchRemoveNotesFromFolder();

  const handleFolderSelect = async (folder: Folder) => {
    setIsProcessing(true);

    try {
      if (fileIds.length > 0) {
        await moveFilesToFolderMutation.mutateAsync({
          fileIds,
          folderId: folder.id,
        });
      }

      if (noteIds.length > 0) {
        await moveNotesToFolderMutation.mutateAsync({
          noteIds,
          folderId: folder.id,
        });
      }

      const itemCount = fileIds.length + noteIds.length;
      toast.success(`Moved ${itemCount} item${itemCount > 1 ? 's' : ''} to ${folder.name}`);
      onOpenChange(false);
      onMoveComplete?.();
    } catch (error) {
      console.error('Move to folder failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move items';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnToMain = async () => {
    setIsProcessing(true);

    try {
      if (fileIds.length > 0) {
        await batchRemoveFromFolderMutation.mutateAsync({
          fileIds,
          sourceFolderId,
        });
      }

      if (noteIds.length > 0) {
        await batchRemoveNotesFromFolderMutation.mutateAsync({
          noteIds,
          sourceFolderId,
        });
      }

      const itemCount = fileIds.length + noteIds.length;
      toast.success(`Returned ${itemCount} item${itemCount > 1 ? 's' : ''} to main collection`);
      onOpenChange(false);
      onMoveComplete?.();
    } catch (error) {
      console.error('Return to main failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to return items';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5" />
            Send to Folder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sourceFolderId !== undefined && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleReturnToMain}
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Main Collection
            </Button>
          )}

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoadingFolders ? (
              <div className="text-center text-sm text-muted-foreground">
                Loading folders...
              </div>
            ) : !folders || folders.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">
                No folders available. Create a folder first.
              </div>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <Button
                    key={folder.id.toString()}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleFolderSelect(folder)}
                    disabled={isProcessing || folder.id === sourceFolderId}
                  >
                    <FolderInput className="mr-2 h-4 w-4" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
