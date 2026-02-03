import { useState, useMemo, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, FileType, Download, ExternalLink, FolderInput, Trash2 } from 'lucide-react';
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
import type { FileMetadata } from '@/backend';
import SendToFolderDialog from './SendToFolderDialog';
import { useDeleteFile } from '@/hooks/useQueries';
import { getFileCategory } from '@/utils/filePreview';

interface FilePreviewDialogProps {
  file: FileMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FilePreview = memo(({ file, fileCategory, fileUrl }: { file: FileMetadata; fileCategory: string; fileUrl: string }) => {
  if (fileCategory === 'image') {
    return (
      <img
        src={fileUrl}
        alt={file.name}
        className="h-auto w-full"
      />
    );
  }
  
  if (fileCategory === 'video') {
    return (
      <video
        src={fileUrl}
        controls
        className="h-auto w-full"
      />
    );
  }
  
  if (fileCategory === 'pdf') {
    return (
      <div className="w-full aspect-[3/4] sm:aspect-[4/3]">
        <iframe
          src={fileUrl}
          className="h-full w-full border-0"
          title={file.name}
        />
      </div>
    );
  }
  
  if (fileCategory === 'office') {
    return (
      <div className="w-full aspect-[3/4] sm:aspect-[4/3]">
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          className="h-full w-full border-0"
          title={file.name}
        />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-background p-4 mb-4">
        <FileType className="h-12 w-12 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium mb-2">Preview not available</p>
      <p className="text-sm text-muted-foreground text-center mb-6">
        This file type cannot be previewed directly
      </p>
    </div>
  );
});

FilePreview.displayName = 'FilePreview';

export default function FilePreviewDialog({ file, open, onOpenChange }: FilePreviewDialogProps) {
  const [showSendToFolder, setShowSendToFolder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteFileMutation = useDeleteFile();

  const formatDate = useMemo(() => (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);

  const handleOpenInNewTab = () => {
    window.open(file.blob.getDirectURL(), '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.blob.getDirectURL();
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await deleteFileMutation.mutateAsync(file.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const fileCategory = getFileCategory(file.mimeType);
  const fileUrl = file.blob.getDirectURL();
  const showPreviewActions = ['image', 'video', 'pdf', 'office'].includes(fileCategory);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-auto">
            <div className="overflow-hidden rounded-lg bg-muted">
              <FilePreview file={file} fileCategory={fileCategory} fileUrl={fileUrl} />
              
              {fileCategory === 'unsupported' && (
                <div className="flex gap-3 justify-center pb-8">
                  <Button onClick={handleOpenInNewTab} variant="default">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileType className="h-4 w-4" />
                <span>{file.mimeType}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(file.createdAt)}</span>
              </div>
              <div className="text-muted-foreground">
                Size: {(Number(file.size) / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              {showPreviewActions && (
                <>
                  <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                  </Button>
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => setShowSendToFolder(true)}
                variant="outline"
                size="sm"
              >
                <FolderInput className="mr-2 h-4 w-4" />
                Send to folder
              </Button>

              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                size="sm"
                disabled={deleteFileMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete file
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SendToFolderDialog
        open={showSendToFolder}
        onOpenChange={setShowSendToFolder}
        fileIds={[file.id]}
        currentFolderId={file.folderId}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the file "{file.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
