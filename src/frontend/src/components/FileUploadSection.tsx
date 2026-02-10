import { useCallback, useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Plus, FileText, Mic, MicOff } from 'lucide-react';
import { useUploadFile, useCreateLink } from '@/hooks/useQueries';
import { useCreateNote } from '@/hooks/useNotesQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { useUpload } from '@/contexts/UploadContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { perfDiag } from '@/utils/performanceDiagnostics';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { ExternalBlob } from '@/backend';

export default function FileUploadSection() {
  const uploadFileMutation = useUploadFile();
  const createLinkMutation = useCreateLink();
  const createNoteMutation = useCreateNote();
  const { status } = useBackendActor();
  const { startUpload, startLinkUpload, startNoteUpload, updateProgress, completeUpload } = useUpload();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    onTranscript: (transcript, isFinal) => {
      if (isFinal && transcript) {
        // Append final transcript to existing text with proper spacing
        setNoteBody((prev) => {
          if (!prev.trim()) {
            return transcript;
          }
          return `${prev} ${transcript}`;
        });
      }
    },
    onError: (error) => {
      toast.error(error);
    },
    // No lang parameter - use browser/OS default language
  });

  // Stop listening when note form is closed or submitted
  useEffect(() => {
    if (!showNoteForm && isListening) {
      stopListening();
    }
  }, [showNoteForm, isListening, stopListening]);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      if (status !== 'ready') {
        toast.error('Please wait for the application to initialize');
        return;
      }

      const fileArray = Array.from(files);
      const uploadId = startUpload(fileArray);

      const operationId = `upload-files-${Date.now()}`;
      perfDiag.startTiming(operationId, 'Upload files (UI)', { fileCount: fileArray.length });

      try {
        // Upload files sequentially with progress tracking
        for (const file of fileArray) {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const blob = ExternalBlob.fromBytes(uint8Array);

          await uploadFileMutation.mutateAsync({
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: BigInt(file.size),
            blob,
            onProgress: (progress) => {
              updateProgress(uploadId, file.name, progress);
            },
          });
        }

        perfDiag.endTiming(operationId, { success: true });
        completeUpload(uploadId);
        toast.success(`Successfully uploaded ${fileArray.length} file${fileArray.length > 1 ? 's' : ''}`);
      } catch (error) {
        perfDiag.endTiming(operationId, { success: false });
        completeUpload(uploadId);
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
        toast.error(errorMessage);
      }

      event.target.value = '';
    },
    [uploadFileMutation, status, startUpload, updateProgress, completeUpload]
  );

  const handleLinkSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (status !== 'ready') {
        toast.error('Please wait for the application to initialize');
        return;
      }

      if (!linkUrl.trim()) {
        toast.error('Please enter a URL');
        return;
      }

      if (!validateUrl(linkUrl)) {
        toast.error('Please enter a valid http:// or https:// URL');
        return;
      }

      const displayName = linkName.trim() || new URL(linkUrl).hostname;
      
      // Start tracked link upload
      const uploadId = startLinkUpload(displayName);
      let currentProgress = 0;

      try {
        // Simulate progress during the backend call
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 15, 90);
          updateProgress(uploadId, displayName, currentProgress);
        }, 200);

        await createLinkMutation.mutateAsync({
          name: displayName,
          url: linkUrl,
        });

        clearInterval(progressInterval);
        
        // Complete to 100% before clearing
        updateProgress(uploadId, displayName, 100);
        
        // Small delay to show 100% before clearing
        setTimeout(() => {
          completeUpload(uploadId);
        }, 300);

        toast.success('Link added successfully');
        setLinkUrl('');
        setLinkName('');
        setShowLinkForm(false);
      } catch (error) {
        completeUpload(uploadId);
        console.error('Create link error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add link. Please try again.';
        toast.error(errorMessage);
      }
    },
    [linkUrl, linkName, status, createLinkMutation, startLinkUpload, updateProgress, completeUpload]
  );

  const handleNoteSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Stop listening before submitting
      if (isListening) {
        stopListening();
      }

      if (status !== 'ready') {
        toast.error('Please wait for the application to initialize');
        return;
      }

      if (!noteTitle.trim()) {
        toast.error('Please enter a title');
        return;
      }

      const displayTitle = noteTitle.trim();
      
      // Start tracked note upload
      const uploadId = startNoteUpload(displayTitle);
      let currentProgress = 0;
      let progressInterval: NodeJS.Timeout | null = null;

      try {
        // Simulate progress during the backend call
        progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 15, 90);
          updateProgress(uploadId, displayTitle, currentProgress);
        }, 200);

        await createNoteMutation.mutateAsync({
          title: displayTitle,
          body: noteBody.trim(),
        });

        clearInterval(progressInterval);
        progressInterval = null;
        
        // Complete to 100% before clearing
        updateProgress(uploadId, displayTitle, 100);
        
        // Small delay to show 100% before clearing
        setTimeout(() => {
          completeUpload(uploadId);
        }, 300);

        toast.success('Note added successfully');
        setNoteTitle('');
        setNoteBody('');
        setShowNoteForm(false);
      } catch (error) {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        completeUpload(uploadId);
        console.error('Create note error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add note. Please try again.';
        toast.error(errorMessage);
      }
    },
    [noteTitle, noteBody, status, createNoteMutation, startNoteUpload, updateProgress, completeUpload, isListening, stopListening]
  );

  const handleCancelNote = () => {
    if (isListening) {
      stopListening();
    }
    setShowNoteForm(false);
    setNoteTitle('');
    setNoteBody('');
  };

  const toggleDictation = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isDisabled = status !== 'ready';

  const triggerFileInput = () => {
    if (!isDisabled) {
      document.getElementById('file-upload')?.click();
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      {!showLinkForm && !showNoteForm ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isDisabled}>
            <button
              aria-label="Upload"
              disabled={isDisabled}
              className={`p-0 bg-transparent border-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 rounded-full ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Plus className="w-10 h-10 text-sky-400" strokeWidth={2.5} />
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                disabled={isDisabled}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLinkForm(true)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Paste Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNoteForm(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Add Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : showLinkForm ? (
        <form onSubmit={handleLinkSubmit} className="space-y-4 p-6 border-2 border-dashed rounded-lg border-primary/30 bg-primary/5 w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Add Link
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowLinkForm(false);
                setLinkUrl('');
                setLinkName('');
              }}
              disabled={isDisabled || createLinkMutation.isPending}
            >
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={isDisabled || createLinkMutation.isPending}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-name">Name (optional)</Label>
            <Input
              id="link-name"
              type="text"
              placeholder="My favorite website"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              disabled={isDisabled || createLinkMutation.isPending}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled || createLinkMutation.isPending}
            className="w-full"
          >
            {createLinkMutation.isPending ? 'Adding...' : 'Add Link'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleNoteSubmit} className="space-y-4 p-6 border-2 border-dashed rounded-lg border-primary/30 bg-primary/5 w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add Note
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelNote}
              disabled={isDisabled || createNoteMutation.isPending}
            >
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-title">Title *</Label>
            <Input
              id="note-title"
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              disabled={isDisabled || createNoteMutation.isPending}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note-body">Body</Label>
              {isSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleDictation}
                  disabled={isDisabled || createNoteMutation.isPending}
                  className="h-8 px-2"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      Dictate
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="note-body"
              placeholder="Note content"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              disabled={isDisabled || createNoteMutation.isPending}
              className="w-full min-h-[120px]"
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled || createNoteMutation.isPending}
            className="w-full"
          >
            {createNoteMutation.isPending ? 'Adding...' : 'Save Note'}
          </Button>
        </form>
      )}
    </div>
  );
}
