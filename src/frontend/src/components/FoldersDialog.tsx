import { useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import SwipeActionsRow from './SwipeActionsRow';

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
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = useState<bigint | null>(null);

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      toast.error(errorMessage);
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
      setOpenSwipeRowId(null);
      toast.success('Folder renamed successfully');
    } catch (error) {
      console.error('Failed to rename folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename folder';
      toast.error(errorMessage);
    }
  };

  const handleOpenDeleteConfirm = (folderId: bigint) => {
    setOpenSwipeRowId(null);
    setDeleteConfirmFolderId(folderId);
  };

  const handleDeleteFolder = async (folderId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folderId);
      setDeleteConfirmFolderId(null);
      setOpenSwipeRowId(null);
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
      toast.error(errorMessage);
    }
  };

  const startEditing = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setOpenSwipeRowId(null);
  };

  const cancelEditing = () => {
    setEditingFolderId(null);
    setEditingName('');
  };

  const renderFolderRow = (folder: FolderType) => {
    const folderId = folder.id.toString();
    const isEditing = editingFolderId === folder.id;

    const folderContent = (
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        {isEditing ? (
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
        )}
      </div>
    );

    if (!isEditing) {
      return (
        <SwipeActionsRow
          key={folderId}
          onEdit={() => startEditing(folder)}
          onDelete={() => handleOpenDeleteConfirm(folder.id)}
          isOpen={openSwipeRowId === folderId}
          onOpenChange={(open) => {
            setOpenSwipeRowId(open ? folderId : null);
          }}
          disabled={!isActorReady}
        >
          {folderContent}
        </SwipeActionsRow>
      );
    }

    return <div key={folderId}>{folderContent}</div>;
  };

  return (
    <>
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
                  {folders.map((folder) => renderFolderRow(folder))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmFolderId !== null} onOpenChange={(open) => !open && setDeleteConfirmFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and all files inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFolderMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmFolderId !== null && handleDeleteFolder(deleteConfirmFolderId)}
              disabled={deleteFolderMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteFolderMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Deleting...
                </>
              ) : (
                'OK'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
