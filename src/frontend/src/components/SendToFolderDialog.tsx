import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Home } from 'lucide-react';
import { useGetFolders, useMoveFilesToFolder, useRemoveFromFolder } from '@/hooks/useQueries';

interface SendToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: string[];
  currentFolderId?: bigint;
  onMoveComplete?: () => void;
}

export default function SendToFolderDialog({
  open,
  onOpenChange,
  fileIds,
  currentFolderId,
  onMoveComplete,
}: SendToFolderDialogProps) {
  const { data: folders, isLoading } = useGetFolders();
  const moveToFolder = useMoveFilesToFolder();
  const removeFromFolder = useRemoveFromFolder();

  const handleMoveToFolder = async (folderId: bigint) => {
    try {
      await moveToFolder.mutateAsync({ fileIds, folderId });
      onOpenChange(false);
      onMoveComplete?.();
    } catch (error) {
      console.error('Move to folder error:', error);
    }
  };

  const handleReturnToMain = async () => {
    try {
      for (const fileId of fileIds) {
        await removeFromFolder.mutateAsync(fileId);
      }
      onOpenChange(false);
      onMoveComplete?.();
    } catch (error) {
      console.error('Return to main error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-2">
          {currentFolderId !== undefined && (
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
              onClick={handleReturnToMain}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Main Collection</p>
                    <p className="text-xs text-muted-foreground">Return to main collection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading folders...</div>
          ) : !folders || folders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No folders</p>
              </CardContent>
            </Card>
          ) : (
            folders
              .filter((folder) => folder.id !== currentFolderId)
              .map((folder) => (
                <Card
                  key={folder.id.toString()}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                  onClick={() => handleMoveToFolder(folder.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{folder.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
