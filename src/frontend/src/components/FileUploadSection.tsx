import { useRef, useState, useCallback } from 'react';
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

export default function FileUploadSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
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
    setShowMenu(false);
  }, [startUpload, updateProgress, completeUpload, uploadFile]);

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

        <Button
          onClick={() => setShowMenu(!showMenu)}
          size="lg"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className={`h-6 w-6 transition-transform duration-200 ${showMenu ? 'rotate-45' : ''}`} />
        </Button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            />
            <div className="fixed bottom-36 right-4 z-40 flex flex-col gap-3">
              <Button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMenu(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-float-menu-item"
                style={{ animationDelay: '0ms' }}
              >
                <Upload className="h-5 w-5" />
                Upload files
              </Button>
              <Button
                onClick={() => {
                  setLinkDialogOpen(true);
                  setShowMenu(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-float-menu-item"
                style={{ animationDelay: '150ms' }}
              >
                <LinkIcon className="h-5 w-5" />
                Paste link
              </Button>
              <Button
                onClick={() => {
                  setNoteDialogOpen(true);
                  setShowMenu(false);
                }}
                size="lg"
                variant="secondary"
                className="h-12 gap-2 shadow-lg animate-float-menu-item"
                style={{ animationDelay: '300ms' }}
              >
                <StickyNote className="h-5 w-5" />
                Add note
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Save a link to your collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLinkSubmit}>Add Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Create a new note</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNoteSubmit}>Create Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
