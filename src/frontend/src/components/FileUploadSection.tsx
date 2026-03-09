import { ExternalBlob } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/contexts/UploadContext";
import { useCreateNote } from "@/hooks/useNotesQueries";
import { useCreateLink, useUploadFile } from "@/hooks/useQueries";
import { fileBytesWorker } from "@/utils/fileBytesWorkerSingleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link as LinkIcon, StickyNote, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadSectionProps {
  showMenu?: boolean;
  onMenuChange?: (show: boolean) => void;
  /** Called when an upload action completes (files selected / link saved / note saved) */
  onActionSelected?: () => void;
}

export default function FileUploadSection({
  showMenu = false,
  onMenuChange,
  onActionSelected,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // panelVisible drives the CSS animation (slide-in / slide-out)
  // panelMounted keeps the DOM alive during slide-out
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  // Open: mount first, then trigger the slide-in on next frame
  useEffect(() => {
    if (showMenu) {
      setPanelMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelVisible(true));
      });
    } else {
      // Slide out, then unmount after animation
      setPanelVisible(false);
      const timer = setTimeout(() => setPanelMounted(false), 320);
      return () => clearTimeout(timer);
    }
  }, [showMenu]);

  // Close the panel: slide out, then tell parent after animation
  const closePanel = useCallback(() => {
    setPanelVisible(false);
    setTimeout(() => {
      if (onMenuChange) onMenuChange(false);
    }, 300);
  }, [onMenuChange]);

  const queryClient = useQueryClient();
  const uploadFile = useUploadFile();
  const createLink = useCreateLink();
  const createNote = useCreateNote();
  const {
    startUpload,
    updateProgress,
    completeUpload,
    startLinkUpload,
    startNoteUpload,
  } = useUpload();

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Navigate to Collections first, then upload in background
      if (onActionSelected) onActionSelected();

      const batchId = startUpload(files);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const itemId = `${batchId}-${i}`;

        try {
          updateProgress(batchId, itemId, 10);

          const bytes = await fileBytesWorker.readFileBytes(file, itemId);
          updateProgress(batchId, itemId, 50);

          const buffer = new ArrayBuffer(bytes.length);
          const standardBytes = new Uint8Array(buffer);
          standardBytes.set(bytes);

          const blob = ExternalBlob.fromBytes(standardBytes).withUploadProgress(
            (percentage) => {
              const adjustedProgress = 50 + percentage * 0.5;
              updateProgress(batchId, itemId, adjustedProgress);
            },
          );

          const result = await uploadFile.mutateAsync({
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            size: BigInt(file.size),
            blob,
            missionId: null,
          });

          completeUpload(itemId, result.id);
          queryClient.invalidateQueries({ queryKey: ["collections-files"] });
          queryClient.invalidateQueries({ queryKey: ["files"] });
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      startUpload,
      updateProgress,
      completeUpload,
      uploadFile,
      onActionSelected,
      queryClient,
    ],
  );

  const handleUploadFilesClick = useCallback(() => {
    closePanel();
    // Trigger file picker after panel closes
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 320);
  }, [closePanel]);

  const handlePasteLinkClick = useCallback(() => {
    closePanel();
    setTimeout(() => {
      setLinkDialogOpen(true);
    }, 320);
  }, [closePanel]);

  const handleAddNoteClick = useCallback(() => {
    closePanel();
    setTimeout(() => {
      setNoteDialogOpen(true);
    }, 320);
  }, [closePanel]);

  const handleLinkSubmit = useCallback(async () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      toast.error("Please fill in all fields");
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
      queryClient.invalidateQueries({ queryKey: ["collections-files"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });

      setLinkName("");
      setLinkUrl("");
      setLinkDialogOpen(false);
      // Navigate to Collections after link saved
      if (onActionSelected) onActionSelected();
    } catch (error) {
      console.error("Link creation error:", error);
      toast.error("Failed to add link");
    }
  }, [
    linkName,
    linkUrl,
    startLinkUpload,
    updateProgress,
    completeUpload,
    createLink,
    onActionSelected,
    queryClient,
  ]);

  const handleNoteSubmit = useCallback(async () => {
    if (!noteTitle.trim()) {
      toast.error("Please enter a title");
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
      queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      setNoteTitle("");
      setNoteBody("");
      setNoteDialogOpen(false);
      // Navigate to Collections after note saved
      if (onActionSelected) onActionSelected();
    } catch (error) {
      console.error("Note creation error:", error);
      toast.error("Failed to create note");
    }
  }, [
    noteTitle,
    noteBody,
    startNoteUpload,
    updateProgress,
    completeUpload,
    createNote,
    onActionSelected,
    queryClient,
  ]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />

      {/* ── Bottom Action Panel ─────────────────────────────────────────────── */}
      {panelMounted && (
        <>
          {/* Blur backdrop — tap to close */}
          <div
            className="fixed inset-0 z-40"
            style={{
              backdropFilter: panelVisible ? "blur(6px)" : "blur(0px)",
              backgroundColor: panelVisible
                ? "rgba(0,0,0,0.35)"
                : "rgba(0,0,0,0)",
              transition:
                "backdrop-filter 300ms ease, background-color 300ms ease",
            }}
            onClick={closePanel}
            onKeyDown={(e) => {
              if (e.key === "Escape") closePanel();
            }}
            role="presentation"
          />

          {/* Panel — slides up from bottom */}
          <div
            data-ocid="upload.panel"
            className="fixed left-0 right-0 bottom-0 z-50"
            style={{
              height: "40vh",
              background: "var(--background, #fff)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
              transform: panelVisible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
              display: "flex",
              flexDirection: "column",
              padding: "16px 0 12px",
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "oklch(0.75 0 0)",
                margin: "0 auto 16px",
                flexShrink: 0,
              }}
            />

            {/* Close button */}
            <button
              type="button"
              data-ocid="upload.panel.close_button"
              onClick={closePanel}
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "oklch(0.55 0 0)",
              }}
            >
              <X size={20} />
            </button>

            {/* Action buttons */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 8,
                padding: "0 20px",
              }}
            >
              {/* Upload Files */}
              <button
                type="button"
                data-ocid="upload.upload_button"
                onClick={handleUploadFilesClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  border: "1px solid oklch(0.90 0 0)",
                  background: "oklch(0.97 0 0)",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "inherit",
                  width: "100%",
                  textAlign: "left",
                  opacity: panelVisible ? 1 : 0,
                  transform: panelVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(12px) scale(0.96)",
                  transition:
                    "opacity 220ms ease 60ms, transform 220ms ease 60ms",
                }}
              >
                <Upload size={22} color="#2563EB" />
                Upload Files
              </button>

              {/* Paste Link */}
              <button
                type="button"
                data-ocid="upload.paste_link_button"
                onClick={handlePasteLinkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  border: "1px solid oklch(0.90 0 0)",
                  background: "oklch(0.97 0 0)",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "inherit",
                  width: "100%",
                  textAlign: "left",
                  opacity: panelVisible ? 1 : 0,
                  transform: panelVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(12px) scale(0.96)",
                  transition:
                    "opacity 220ms ease 130ms, transform 220ms ease 130ms",
                }}
              >
                <LinkIcon size={22} color="#0D9488" />
                Paste Link
              </button>

              {/* Add Note */}
              <button
                type="button"
                data-ocid="upload.add_note_button"
                onClick={handleAddNoteClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  border: "1px solid oklch(0.90 0 0)",
                  background: "oklch(0.97 0 0)",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "inherit",
                  width: "100%",
                  textAlign: "left",
                  opacity: panelVisible ? 1 : 0,
                  transform: panelVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(12px) scale(0.96)",
                  transition:
                    "opacity 220ms ease 200ms, transform 220ms ease 200ms",
                }}
              >
                <StickyNote size={22} color="#7C3AED" />
                Add Note
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Link Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paste Link</DialogTitle>
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
              <Button
                variant="outline"
                onClick={() => setLinkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleLinkSubmit}>Add Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Note Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
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
              <Button
                variant="outline"
                onClick={() => setNoteDialogOpen(false)}
              >
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
