import type { FileMetadata, Folder as FolderType, Note } from "@/backend";
import MoveToMissionDialog from "@/components/MoveToMissionDialog";
import SendToFolderDialog from "@/components/SendToFolderDialog";
import { useDeleteNotes, useGetNotesInFolder } from "@/hooks/useNotesQueries";
import { useDeleteFiles, useGetFilesInFolder } from "@/hooks/useQueries";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useRef, useState } from "react";
import FullScreenViewer from "./FullScreenViewer";

interface FolderContentsViewProps {
  folder: FolderType;
  onBack: () => void;
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// ── Item Thumbnail ────────────────────────────────────────────────────────────

function FileThumbnailSimple({
  file,
  onTap,
  onLongPress,
  selected,
  selectionMode,
}: {
  file: FileMetadata;
  onTap: () => void;
  onLongPress: () => void;
  selected: boolean;
  selectionMode: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const touchMoved = useRef(false);
  const touchStarted = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchMoved.current = false;
    touchStarted.current = true;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, 500);
    // Prevent context menu on long press
    (e.currentTarget as HTMLElement).style.webkitUserSelect = "none";
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!touchMoved.current && touchStarted.current && !didLongPress.current) {
      onTap();
    }
    touchStarted.current = false;
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStarted.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const isLink = !!file.link;
  const selectedBorder = selected ? "#7C3AED" : "transparent";

  if (isLink) {
    const domain = getDomain(file.link!);
    const faviconUrl = domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      : null;
    return (
      <div
        className="relative"
        style={{ width: 80, height: 80, flexShrink: 0 }}
      >
        <button
          type="button"
          className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{
            width: 80,
            height: 80,
            borderRadius: 9,
            background: isDark
              ? "oklch(0.22 0.02 260)"
              : "oklch(0.93 0.01 260)",
            border: `1.5px solid ${selectedBorder}`,
            boxSizing: "border-box",
            flexShrink: 0,
            padding: 0,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onContextMenu={handleContextMenu}
          onClick={selectionMode ? onTap : undefined}
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt={file.name}
              loading="lazy"
              className="w-8 h-8 object-contain"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <LinkIcon size={28} color={isDark ? "#60A5FA" : "#2563EB"} />
          )}
          <span
            className="mt-1 text-center px-1 truncate w-full"
            style={{
              fontSize: 9,
              color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
              lineHeight: 1.2,
            }}
          >
            {file.name}
          </span>
        </button>
        {selected && (
          <div className="absolute top-1 right-1 pointer-events-none">
            <CheckCircle2 size={18} color="#7C3AED" fill="white" />
          </div>
        )}
      </div>
    );
  }

  if (isImageMime(file.mimeType) && file.blob) {
    const url = file.blob.getDirectURL();
    return (
      <div
        className="relative"
        style={{ width: 80, height: 80, flexShrink: 0 }}
      >
        <button
          type="button"
          className="overflow-hidden cursor-pointer"
          style={{
            width: 80,
            height: 80,
            borderRadius: 9,
            border: `1.5px solid ${selectedBorder}`,
            boxSizing: "border-box",
            flexShrink: 0,
            padding: 0,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onContextMenu={handleContextMenu}
          onClick={selectionMode ? onTap : undefined}
        >
          <img
            src={url}
            alt={file.name}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover"
          />
        </button>
        {selected && (
          <div className="absolute top-1 right-1 pointer-events-none">
            <CheckCircle2 size={18} color="#7C3AED" fill="white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: 80, height: 80, flexShrink: 0 }}>
      <button
        type="button"
        className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: `1.5px solid ${selectedBorder}`,
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={handleContextMenu}
        onClick={selectionMode ? onTap : undefined}
      >
        <FileText size={28} color={isDark ? "#60A5FA" : "#2563EB"} />
        <span
          className="mt-1 text-center px-1 truncate w-full"
          style={{
            fontSize: 9,
            color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
            lineHeight: 1.2,
          }}
        >
          {file.name}
        </span>
      </button>
      {selected && (
        <div className="absolute top-1 right-1 pointer-events-none">
          <CheckCircle2 size={18} color="#7C3AED" fill="white" />
        </div>
      )}
    </div>
  );
}

function NoteThumbnailSimple({
  note,
  onTap,
  onLongPress,
  selected,
  selectionMode,
}: {
  note: Note;
  onTap: () => void;
  onLongPress: () => void;
  selected: boolean;
  selectionMode: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const touchMoved = useRef(false);
  const touchStarted = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleTouchStart = () => {
    touchMoved.current = false;
    touchStarted.current = true;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, 500);
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!touchMoved.current && touchStarted.current && !didLongPress.current) {
      onTap();
    }
    touchStarted.current = false;
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStarted.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const selectedBorder = selected ? "#7C3AED" : "transparent";

  return (
    <div className="relative" style={{ width: 80, height: 80, flexShrink: 0 }}>
      <button
        type="button"
        className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
          border: `1.5px solid ${selectedBorder}`,
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={handleContextMenu}
        onClick={selectionMode ? onTap : undefined}
      >
        <FileText size={24} color={isDark ? "#4ADE80" : "#16A34A"} />
        <span
          className="mt-1 text-center px-1 truncate w-full"
          style={{
            fontSize: 9,
            color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
            lineHeight: 1.2,
          }}
        >
          {note.title || "Note"}
        </span>
      </button>
      {selected && (
        <div className="absolute top-1 right-1 pointer-events-none">
          <CheckCircle2 size={18} color="#7C3AED" fill="white" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FolderContentsView({
  folder,
  onBack,
}: FolderContentsViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const folderId = folder.id;
  const {
    data: files = [],
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useGetFilesInFolder(folderId);
  const {
    data: notes = [],
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useGetNotesInFolder(folderId);

  const isLoading = filesLoading || notesLoading;

  // Full-screen viewer state
  const [fullScreenFile, setFullScreenFile] = useState<FileMetadata | null>(
    null,
  );
  const [fullScreenNote, setFullScreenNote] = useState<Note | null>(null);

  // Batch selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set(),
  );

  // Dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);

  // Mutations
  const deleteFilesMutation = useDeleteFiles();
  const deleteNotesMutation = useDeleteNotes();

  const bg = isDark ? "oklch(0.13 0.02 260)" : "oklch(0.98 0.005 260)";
  const headerBg = isDark ? "oklch(0.16 0.02 260)" : "oklch(0.96 0.005 260)";
  const textColor = isDark ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)";
  const subTextColor = isDark ? "oklch(0.65 0 0)" : "oklch(0.45 0 0)";
  const borderColor = isDark ? "oklch(0.28 0.02 260)" : "oklch(0.88 0.005 260)";
  const tealColor = isDark ? "#2DD4BF" : "#0D9488";
  const toolbarBg = isDark ? "oklch(0.14 0.02 260)" : "#ffffff";
  const toolbarBorder = isDark
    ? "oklch(0.28 0.02 260)"
    : "oklch(0.88 0.005 260)";

  // Build sorted combined items
  type FolderItem =
    | { kind: "file"; data: FileMetadata }
    | { kind: "note"; data: Note };

  const allItems: FolderItem[] = [
    ...files.map((f): FolderItem => ({ kind: "file", data: f })),
    ...notes.map((n): FolderItem => ({ kind: "note", data: n })),
  ];
  allItems.sort((a, b) => {
    const aTime = Number(a.data.createdAt);
    const bTime = Number(b.data.createdAt);
    return bTime - aTime;
  });

  const nonLinkFiles = files.filter((f) => !f.link);

  const totalSelected = selectedFileIds.size + selectedNoteIds.size;
  const allSelected = allItems.length > 0 && totalSelected === allItems.length;

  const handleFileTap = (file: FileMetadata) => {
    if (selectionMode) {
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        if (next.has(file.id)) {
          next.delete(file.id);
        } else {
          next.add(file.id);
        }
        return next;
      });
      return;
    }
    if (file.link) {
      try {
        window.open(file.link, "_blank", "noopener,noreferrer");
      } catch {
        // fallback
      }
    } else {
      setFullScreenFile(file);
    }
  };

  const handleNoteTap = (note: Note) => {
    if (selectionMode) {
      setSelectedNoteIds((prev) => {
        const next = new Set(prev);
        if (next.has(note.id)) {
          next.delete(note.id);
        } else {
          next.add(note.id);
        }
        return next;
      });
      return;
    }
    setFullScreenNote(note);
  };

  const handleFileLongPress = (file: FileMetadata) => {
    setSelectionMode(true);
    setSelectedFileIds(new Set([file.id]));
    setSelectedNoteIds(new Set());
  };

  const handleNoteLongPress = (note: Note) => {
    setSelectionMode(true);
    setSelectedNoteIds(new Set([note.id]));
    setSelectedFileIds(new Set());
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFileIds(new Set());
      setSelectedNoteIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
      setSelectedNoteIds(new Set(notes.map((n) => n.id)));
    }
  };

  const handleCancel = () => {
    setSelectionMode(false);
    setSelectedFileIds(new Set());
    setSelectedNoteIds(new Set());
  };

  const handleDelete = async () => {
    const fileIds = Array.from(selectedFileIds);
    const noteIds = Array.from(selectedNoteIds).map((id) => BigInt(id));
    await Promise.all([
      fileIds.length > 0
        ? deleteFilesMutation.mutateAsync(fileIds)
        : Promise.resolve(),
      noteIds.length > 0
        ? deleteNotesMutation.mutateAsync(noteIds)
        : Promise.resolve(),
    ]);
    handleCancel();
    refetchFiles();
    refetchNotes();
  };

  const handleShare = async () => {
    const count = totalSelected;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${count} item(s) from MYL` });
      } catch {
        // cancelled
      }
    }
  };

  const handleMoveComplete = () => {
    handleCancel();
    refetchFiles();
    refetchNotes();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ background: bg }}
      >
        {/* Header */}
        <div
          className="flex items-center px-4 py-3 shrink-0"
          style={{
            background: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            paddingTop: "max(12px, env(safe-area-inset-top))",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60"
            style={{ color: textColor }}
            aria-label="Back"
            data-ocid="folder.contents.close_button"
          >
            <ArrowLeft size={22} />
          </button>
          <h1
            className="flex-1 text-center font-semibold truncate px-2"
            style={{ fontSize: 18, color: textColor }}
          >
            {folder.name}
          </h1>
          <div style={{ width: 38 }} />
        </div>

        {/* Item count */}
        {!isLoading && allItems.length > 0 && (
          <div className="px-4 py-2 shrink-0">
            <span style={{ fontSize: 13, color: subTextColor }}>
              {selectionMode
                ? `${totalSelected} selected`
                : `${allItems.length} item${allItems.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}

        {/* Grid content */}
        <div
          className="flex-1 overflow-y-auto"
          style={
            {
              WebkitOverflowScrolling: "touch",
              paddingBottom: selectionMode ? 80 : 0,
            } as React.CSSProperties
          }
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{
                  borderColor: tealColor,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : allItems.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-3 px-8"
              data-ocid="folder.contents.empty_state"
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tealColor}
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="Empty folder"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p
                className="text-center font-medium"
                style={{ color: textColor, fontSize: 16 }}
              >
                Empty folder
              </p>
              <p
                className="text-center"
                style={{ color: subTextColor, fontSize: 14 }}
              >
                No files or notes in this folder yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 80px)",
                gap: 10,
                padding: "12px 16px",
                justifyContent: "center",
              }}
            >
              {allItems.map((item) => {
                if (item.kind === "file") {
                  return (
                    <FileThumbnailSimple
                      key={`file-${item.data.id}`}
                      file={item.data}
                      onTap={() => handleFileTap(item.data)}
                      onLongPress={() => handleFileLongPress(item.data)}
                      selected={selectedFileIds.has(item.data.id)}
                      selectionMode={selectionMode}
                    />
                  );
                }
                return (
                  <NoteThumbnailSimple
                    key={`note-${item.data.id}`}
                    note={item.data}
                    onTap={() => handleNoteTap(item.data)}
                    onLongPress={() => handleNoteLongPress(item.data)}
                    selected={selectedNoteIds.has(item.data.id)}
                    selectionMode={selectionMode}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Batch selection toolbar */}
      {selectionMode && (
        <div
          className="fixed left-0 right-0 z-[70] flex flex-col"
          style={{
            bottom: 80,
            background: toolbarBg,
            borderTop: `1px solid ${toolbarBorder}`,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Select All / Count row */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: `1px solid ${toolbarBorder}` }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              style={{ fontSize: 13, color: "#7C3AED", fontWeight: 600 }}
              data-ocid="folder.select_all.button"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <span style={{ fontSize: 13, color: subTextColor }}>
              {totalSelected} selected
            </span>
            <button
              type="button"
              onClick={handleCancel}
              style={{ fontSize: 13, color: subTextColor }}
              data-ocid="folder.selection.cancel_button"
            >
              Cancel
            </button>
          </div>
          {/* Action buttons row */}
          <div className="flex items-center justify-around px-4 py-2">
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={() => setMissionDialogOpen(true)}
              className="flex flex-col items-center gap-1 opacity-100 disabled:opacity-40"
              data-ocid="folder.selection.mission_button"
            >
              <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>
                Mission
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={() => setFolderDialogOpen(true)}
              className="flex flex-col items-center gap-1 opacity-100 disabled:opacity-40"
              data-ocid="folder.selection.folder_button"
            >
              <span style={{ fontSize: 11, color: "#0D9488", fontWeight: 600 }}>
                Folder
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={handleShare}
              className="flex flex-col items-center gap-1 opacity-100 disabled:opacity-40"
              data-ocid="folder.selection.share_button"
            >
              <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>
                Share
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={handleDelete}
              className="flex flex-col items-center gap-1 opacity-100 disabled:opacity-40"
              data-ocid="folder.selection.delete_button"
            >
              <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
                Delete
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Full-screen file viewer */}
      {fullScreenFile && (
        <FullScreenViewer
          files={nonLinkFiles}
          initialIndex={nonLinkFiles.findIndex(
            (f) => f.id === fullScreenFile.id,
          )}
          open={!!fullScreenFile}
          onOpenChange={(open) => {
            if (!open) setFullScreenFile(null);
          }}
        />
      )}

      {/* Full-screen note viewer */}
      {fullScreenNote && (
        <div
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: bg }}
        >
          {/* Header */}
          <div
            className="flex items-center px-4 py-3 shrink-0"
            style={{
              background: headerBg,
              borderBottom: `1px solid ${borderColor}`,
              paddingTop: "max(12px, env(safe-area-inset-top))",
            }}
          >
            <button
              type="button"
              onClick={() => setFullScreenNote(null)}
              className="flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60"
              style={{ color: textColor }}
              aria-label="Close"
              data-ocid="folder.note_viewer.close_button"
            >
              <ArrowLeft size={22} />
            </button>
            <h1
              className="flex-1 text-center font-semibold truncate px-2"
              style={{ fontSize: 17, color: textColor }}
            >
              {fullScreenNote.title || "Note"}
            </h1>
            <div style={{ width: 38 }} />
          </div>
          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-5 py-4"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            <p
              style={{
                color: textColor,
                fontSize: 16,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {fullScreenNote.body || ""}
            </p>
          </div>
        </div>
      )}

      {/* Send to Folder dialog */}
      <SendToFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        fileIds={Array.from(selectedFileIds)}
        noteIds={Array.from(selectedNoteIds).map((id) => BigInt(id))}
        currentFolderId={folder.id}
        onMoveComplete={handleMoveComplete}
      />

      {/* Move to Mission dialog */}
      <MoveToMissionDialog
        open={missionDialogOpen}
        onOpenChange={setMissionDialogOpen}
        fileIds={Array.from(selectedFileIds)}
        noteIds={Array.from(selectedNoteIds).map((id) => BigInt(id))}
        onMoveComplete={handleMoveComplete}
      />
    </>
  );
}
