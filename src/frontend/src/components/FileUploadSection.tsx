import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useUploadFile, useCreateLink } from '@/hooks/useQueries';
import { useUpload } from '@/contexts/UploadContext';
import { ExternalBlob } from '@/backend';

interface FileUploadSectionProps {
  isActorInitializing?: boolean;
}

export default function FileUploadSection({ isActorInitializing = false }: FileUploadSectionProps) {
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadFile = useUploadFile();
  const createLink = useCreateLink();
  const { startUpload, startLinkUpload, updateProgress, completeUpload } = useUpload();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const uploadId = startUpload(fileArray);

    for (const file of fileArray) {
      try {
        updateProgress(uploadId, file.name, 0);
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);

        await uploadFile.mutateAsync({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: BigInt(file.size),
          blob,
          missionId: null,
        });
        
        updateProgress(uploadId, file.name, 100);
      } catch (error) {
        console.error('Upload failed:', error);
        updateProgress(uploadId, file.name, 100);
      }
    }

    completeUpload(uploadId);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFile, startUpload, updateProgress, completeUpload]);

  const handleCreateLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkUrl.trim()) return;

    const uploadId = startLinkUpload(linkName.trim());
    updateProgress(uploadId, linkName.trim(), 0);

    try {
      await createLink.mutateAsync({
        name: linkName.trim(),
        url: linkUrl.trim(),
        folderId: null,
        missionId: null,
      });
      
      setLinkName('');
      setLinkUrl('');
      updateProgress(uploadId, linkName.trim(), 100);
    } catch (error) {
      console.error('Link creation failed:', error);
      updateProgress(uploadId, linkName.trim(), 100);
    } finally {
      completeUpload(uploadId);
    }
  }, [linkName, linkUrl, createLink, startLinkUpload, updateProgress, completeUpload]);

  const isDisabled = isActorInitializing;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Files</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isDisabled}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
                className="gap-2"
              >
                {isDisabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
              </Button>
            </div>
          </div>

          {/* Link Creation */}
          <form onSubmit={handleCreateLink} className="space-y-2">
            <Label htmlFor="link-name">Add Link</Label>
            <div className="space-y-2">
              <Input
                id="link-name"
                type="text"
                placeholder="Link name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                disabled={isDisabled}
              />
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={isDisabled}
              />
              <Button
                type="submit"
                disabled={!linkName.trim() || !linkUrl.trim() || isDisabled}
                className="w-full gap-2"
              >
                {isDisabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Add Link
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
