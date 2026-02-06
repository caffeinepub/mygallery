import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Home } from 'lucide-react';
import { useGetFolders, useMoveFilesToFolder, useBatchRemoveFromFolder } from '@/hooks/useQueries';
import { perfDiag } from '@/utils/performanceDiagnostics';

interface SendToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: string[];
  currentFolderId?: bigint;
  onComplete?: () => void;
}

export default function SendToFolderDialog({
  open,
  onOpenChange,
  fileIds,
  currentFolderId,
  onComplete,
}: SendToFolderDialogProps) {
  const { data: folders, isLoading } = useGetFolders();
  const moveToFolder = useMoveFilesToFolder();
  const batchRemoveFromFolder = useBatchRemoveFromFolder();

  const handleMoveToFolder = async (folderId: bigint) => {
    const operationId = `move-to-folder-${Date.now()}`;
    perfDiag.startTiming(operationId, 'Move to folder (UI)', { fileCount: fileIds.length });

    try {
      const bigintFileIds = fileIds.map(id => BigInt(id));
      await moveToFolder.mutateAsync({ fileIds: bigintFileIds, folderId });
      perfDiag.endTiming(operationId, { success: true });
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      perfDiag.endTiming(operationId, { success: false });
      console.error('Move to folder error:', error);
    }
  };

  const handleReturnToMain = async () => {
    const operationId = `return-to-main-${Date.now()}`;
    perfDiag.startTiming(operationId, 'Return to main collection (UI)', { fileCount: fileIds.length });

    try {
      const bigintFileIds = fileIds.map(id => BigInt(id));
      await batchRemoveFromFolder.mutateAsync(bigintFileIds);
      perfDiag.endTiming(operationId, { success: true });
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      perfDiag.endTiming(operationId, { success: false });
      console.error('Return to main error:', error);
    }
  };

  const isProcessing = moveToFolder.isPending || batchRemoveFromFolder.isPending;

  return (
    <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-2">
          {currentFolderId !== undefined && (
            <Card
              className={`transition-all ${
                isProcessing 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-md hover:border-primary'
              }`}
              onClick={isProcessing ? undefined : handleReturnToMain}
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
                  className={`transition-all ${
                    isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:shadow-md hover:border-primary'
                  }`}
                  onClick={isProcessing ? undefined : () => handleMoveToFolder(folder.id)}
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
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
