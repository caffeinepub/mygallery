import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Link as LinkIcon, StickyNote } from 'lucide-react';
import { useUploadFile, useCreateLink } from '@/hooks/useQueries';
import { useCreateNote } from '@/hooks/useNotesQueries';
import { useUpload } from '@/contexts/UploadContext';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fileBytesWorker } from '@/utils/fileBytesWorkerSingleton';

interface FileUploadSectionProps {
  showMenu?: boolean;
  onMenuChange?: (show: boolean) => void;
}

export default function FileUploadSection({ showMenu = false, onMenuChange }: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const uploadFile = useUploadFile();
  const createLink = useCreateLink();
  const createNote = useCreateNote();
  const { startUpload, updateProgress, completeUpload, startLinkUpload, startNoteUpload } = useUpload();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const batchId = startUpload(files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const itemId = `${batchId}-${i}`;

      try {
        updateProgress(batchId, itemId, 10);

        const bytes = await fileBytesWorker.readFileBytes(file, itemId);
        updateProgress(batchId, itemId, 50);

        // Create a new Uint8Array with a proper ArrayBuffer (not SharedArrayBuffer)
        const buffer = new ArrayBuffer(bytes.length);
        const standardBytes = new Uint8Array(buffer);
        standardBytes.set(bytes);
        
        const blob = ExternalBlob.fromBytes(standardBytes).withUploadProgress((percentage) => {
          const adjustedProgress = 50 + (percentage * 0.5);
          updateProgress(batchId, itemId, adjustedProgress);
        });

        const result = await uploadFile.mutateAsync({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: BigInt(file.size),
          blob,
          missionId: null,
        });

        completeUpload(itemId, result.id);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onMenuChange) {
      onMenuChange(false);
    }
  }, [startUpload, updateProgress, completeUpload, uploadFile, onMenuChange]);

  const handleLinkSubmit = useCallback(async () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const batchId = startLinkUpload(linkName);
    const itemId = `${batchId}-0`;

    try {
      updateProgress(batchId, itemId, 50);
      await createLink.mutateAsync({
        name: linkName,
        url: linkUrl,
        folderId: null,
        missionId: null,
      });
      updateProgress(batchId, itemId, 100);
      completeUpload(itemId);
      
      setLinkName('');
      setLinkUrl('');
      setLinkDialogOpen(false);
      toast.success('Link added');
    } catch (error) {
      console.error('Link creation error:', error);
      toast.error('Failed to add link');
    }
  }, [linkName, linkUrl, startLinkUpload, updateProgress, completeUpload, createLink]);

  const handleNoteSubmit = useCallback(async () => {
    if (!noteTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const batchId = startNoteUpload(noteTitle);
    const itemId = `${batchId}-0`;

    try {
      updateProgress(batchId, itemId, 50);
      await createNote.mutateAsync({
        title: noteTitle,
        body: noteBody,
        folderId: null,
        missionId: null,
      });
      updateProgress(batchId, itemId, 100);
      completeUpload(itemId);
      
      setNoteTitle('');
      setNoteBody('');
      setNoteDialogOpen(false);
      toast.success('Note created');
    } catch (error) {
      console.error('Note creation error:', error);
      toast.error('Failed to create note');
    }
  }, [noteTitle, noteBody, startNoteUpload, updateProgress, completeUpload, createNote]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = () => {
      if (onMenuChange) {
        onMenuChange(false);
      }
    };

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, onMenuChange]);

  return (
    <>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => onMenuChange && onMenuChange(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-32 z-40 flex flex-col gap-3 items-center">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                  if (onMenuChange) onMenuChange(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-floating-menu-item"
                style={{ animationDelay: '0ms' }}
              >
                <Upload className="h-5 w-5" />
                Upload files
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setLinkDialogOpen(true);
                  if (onMenuChange) onMenuChange(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-floating-menu-item"
                style={{ animationDelay: '50ms' }}
              >
                <LinkIcon className="h-5 w-5" />
                Add link
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteDialogOpen(true);
                  if (onMenuChange) onMenuChange(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-floating-menu-item"
                style={{ animationDelay: '100ms' }}
              >
                <StickyNote className="h-5 w-5" />
                Create note
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Save a link to a website or resource
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-name">Name</Label>
              <Input
                id="link-name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="My favorite website"
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLinkSubmit}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
            <DialogDescription>
              Write a quick note or reminder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div>
              <Label htmlFor="note-body">Content</Label>
              <Textarea
                id="note-body"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNoteSubmit}>
                Create Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
