import { useState } from 'react';
import { Folder, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useGetFolders,
  useCreateFolder,
  useRenameFolder,
  useDeleteFolder,
} from '@/hooks/useQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import type { Folder as FolderType } from '@/backend';
import { toast } from 'sonner';

interface FoldersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFolder: (folder: FolderType) => void;
}

export default function FoldersDialog({
  open,
  onOpenChange,
  onSelectFolder,
}: FoldersDialogProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<bigint | null>(null);
  const [editingName, setEditingName] = useState('');

  const { status } = useBackendActor();
  const { data: folders = [], isLoading } = useGetFolders();
  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const deleteFolderMutation = useDeleteFolder();

  const isActorReady = status === 'ready';

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await createFolderMutation.mutateAsync(newFolderName.trim());
      setNewFolderName('');
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleRenameFolder = async (folderId: bigint) => {
    if (!editingName.trim()) return;
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await renameFolderMutation.mutateAsync({ folderId, newName: editingName.trim() });
      setEditingFolderId(null);
      setEditingName('');
      toast.success('Folder renamed successfully');
    } catch (error) {
      console.error('Failed to rename folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folderId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folderId);
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const startEditing = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const cancelEditing = () => {
    setEditingFolderId(null);
    setEditingName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Folders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new folder */}
          <div className="flex gap-2">
            <Input
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              disabled={!isActorReady || createFolderMutation.isPending}
            />
            <Button
              onClick={handleCreateFolder}
              disabled={!isActorReady || !newFolderName.trim() || createFolderMutation.isPending}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Folders list */}
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Loading folders...
              </div>
            ) : !isActorReady ? (
              <div className="text-center text-muted-foreground py-8">
                Loading...
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No folders yet. Create one to get started!
              </div>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id.toString()}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {editingFolderId === folder.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameFolder(folder.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRenameFolder(folder.id)}
                          disabled={!editingName.trim() || renameFolderMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="flex-1 justify-start"
                          onClick={() => {
                            onSelectFolder(folder);
                            onOpenChange(false);
                          }}
                        >
                          <Folder className="h-4 w-4 mr-2" />
                          {folder.name}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(folder)}
                          disabled={!isActorReady}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteFolder(folder.id)}
                          disabled={!isActorReady || deleteFolderMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
