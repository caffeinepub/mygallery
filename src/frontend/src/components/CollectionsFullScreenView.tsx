import { useQueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  FolderInput,
  Link as LinkIcon,
  Share2,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { FileMetadata, Note } from "../backend";
import { SortDirection } from "../backend";
import { useUpload } from "../contexts/UploadContext";
import { useActor } from "../hooks/useActor";
import FullScreenViewer from "./FullScreenViewer";
import MoveToMissionDialog from "./MoveToMissionDialog";
import SendToFolderDialog from "./SendToFolderDialog";

interface CollectionsFullScreenViewProps {
  onClose: () => void;
  onUploadRequest?: () => void;
}

type CollectionItem =
  | { kind: "file"; data: FileMetadata }
  | { kind: "note"; data: Note };

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isLinkFile(file: FileMetadata): boolean {
  return !!file.link;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// ── Thumbnail components ──────────────────────────────────────────────────────

function FileThumbnail({
  file,
  selected,
  selectionMode,
  onTap,
  onLongPress,
}: {
  file: FileMetadata;
  selected: boolean;
  selectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const touchMoved = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    didLongPress.current = false;
    touchMoved.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        didLongPress.current = true;
        try {
          navigator.vibrate?.(50);
        } catch {}
        onLongPress();
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) {
      touchMoved.current = true;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
      e.preventDefault();
      onTap();
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const borderStyle = selected
    ? "2px solid #3B82F6"
    : "1.5px solid transparent";

  if (isLinkFile(file)) {
    const domain = getDomain(file.link!);
    const faviconUrl = domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      : null;
    return (
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        style={
          {
            width: 80,
            height: 80,
            borderRadius: 9,
            background: isDark
              ? "oklch(0.22 0.02 260)"
              : "oklch(0.93 0.01 260)",
            border: borderStyle,
            boxSizing: "border-box",
            flexShrink: 0,
            WebkitTouchCallout: "none",
            userSelect: "none",
          } as React.CSSProperties
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={selectionMode ? onTap : undefined}
        onKeyDown={
          selectionMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap();
                }
              }
            : undefined
        }
      >
        {selected && (
          <div className="absolute top-1 right-1 z-10">
            <CheckSquare size={16} color="#3B82F6" />
          </div>
        )}
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt={file.name}
            loading="lazy"
            draggable={false}
            className="w-8 h-8 object-contain"
            onContextMenu={(e) => e.preventDefault()}
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
      </div>
    );
  }

  if (isImageMime(file.mimeType) && file.blob) {
    const url = file.blob.getDirectURL();
    return (
      <div
        className="relative overflow-hidden cursor-pointer"
        style={
          {
            width: 80,
            height: 80,
            borderRadius: 9,
            border: borderStyle,
            boxSizing: "border-box",
            flexShrink: 0,
            WebkitTouchCallout: "none",
            userSelect: "none",
          } as React.CSSProperties
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={selectionMode ? onTap : undefined}
        onKeyDown={
          selectionMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap();
                }
              }
            : undefined
        }
      >
        {selected && (
          <div className="absolute top-1 right-1 z-10">
            <CheckSquare size={16} color="#3B82F6" />
          </div>
        )}
        <img
          src={url}
          alt={file.name}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
          style={{ pointerEvents: "none" }}
        />
      </div>
    );
  }

  // Generic file thumbnail
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={
        {
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: borderStyle,
          boxSizing: "border-box",
          flexShrink: 0,
          WebkitTouchCallout: "none",
          userSelect: "none",
        } as React.CSSProperties
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={selectionMode ? onTap : undefined}
      onKeyDown={
        selectionMode
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTap();
              }
            }
          : undefined
      }
    >
      {selected && (
        <div className="absolute top-1 right-1 z-10">
          <CheckSquare size={16} color="#3B82F6" />
        </div>
      )}
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
    </div>
  );
}

function NoteThumbnail({
  note,
  selected,
  selectionMode,
  onTap,
  onLongPress,
}: {
  note: Note;
  selected: boolean;
  selectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const touchMoved = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    didLongPress.current = false;
    touchMoved.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        didLongPress.current = true;
        try {
          navigator.vibrate?.(50);
        } catch {}
        onLongPress();
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) {
      touchMoved.current = true;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
      e.preventDefault();
      onTap();
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={
        {
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
          border: selected ? "2px solid #3B82F6" : "1.5px solid transparent",
          boxSizing: "border-box",
          flexShrink: 0,
          WebkitTouchCallout: "none",
          userSelect: "none",
        } as React.CSSProperties
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={selectionMode ? onTap : undefined}
      onKeyDown={
        selectionMode
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTap();
              }
            }
          : undefined
      }
    >
      {selected && (
        <div className="absolute top-1 right-1 z-10">
          <CheckSquare size={16} color="#3B82F6" />
        </div>
      )}
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
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CollectionsFullScreenView({
  onClose,
  onUploadRequest,
}: CollectionsFullScreenViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Upload progress
  const { totalProgress, uploads } = useUpload();
  const activeUploads = uploads.filter((u) => !u.completed);

  // Fetch all root files
  const { data: filesData, isLoading: filesLoading } = useQuery<{
    files: FileMetadata[];
    hasMore: boolean;
  }>({
    queryKey: ["collections-files"],
    queryFn: async () => {
      if (!actor) return { files: [], hasMore: false };
      return actor.getPaginatedFiles(
        SortDirection.desc,
        BigInt(0),
        BigInt(500),
      );
    },
    enabled: !!actor && !actorFetching,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all root notes
  const { data: notesData, isLoading: notesLoading } = useQuery<{
    notes: Note[];
    hasMore: boolean;
  }>({
    queryKey: ["collections-notes"],
    queryFn: async () => {
      if (!actor) return { notes: [], hasMore: false };
      return actor.getPaginatedNotes(
        SortDirection.desc,
        BigInt(0),
        BigInt(500),
      );
    },
    enabled: !!actor && !actorFetching,
    staleTime: 2 * 60 * 1000,
  });

  // Delete mutations
  const deleteFilesMutation = useMutation({
    mutationFn: async (fileIds: bigint[]) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteFiles(fileIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections-files"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const deleteNotesMutation = useMutation({
    mutationFn: async (noteIds: bigint[]) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteNotes(noteIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Selection state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectionMode, setSelectionMode] = useState(false);

  // Full-screen viewer state
  const [fullScreenFile, setFullScreenFile] = useState<FileMetadata | null>(
    null,
  );
  const [fullScreenNote, setFullScreenNote] = useState<Note | null>(null);
  const [fullScreenLink, setFullScreenLink] = useState<FileMetadata | null>(
    null,
  );

  // Dialog state
  const [showMoveToMission, setShowMoveToMission] = useState(false);
  const [showSendToFolder, setShowSendToFolder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Build aggregated items list
  const files: FileMetadata[] = filesData?.files ?? [];
  const notes: Note[] = notesData?.notes ?? [];

  const allItems: CollectionItem[] = [
    ...files.map((f): CollectionItem => ({ kind: "file", data: f })),
    ...notes.map((n): CollectionItem => ({ kind: "note", data: n })),
  ];

  // Sort by createdAt descending
  allItems.sort((a, b) => {
    const aTime = Number(a.data.createdAt);
    const bTime = Number(b.data.createdAt);
    return bTime - aTime;
  });

  const totalSelected = selectedFileIds.size + selectedNoteIds.size;
  const isLoading = filesLoading || notesLoading;

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedFileIds(new Set());
    setSelectedNoteIds(new Set());
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleNoteSelection = useCallback((id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allFilesSelected = files.every((f) => selectedFileIds.has(f.id));
    const allNotesSelected = notes.every((n) => selectedNoteIds.has(n.id));
    const allSelected =
      allFilesSelected && allNotesSelected && files.length + notes.length > 0;
    if (allSelected) {
      setSelectedFileIds(new Set());
      setSelectedNoteIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
      setSelectedNoteIds(new Set(notes.map((n) => n.id)));
    }
  }, [files, notes, selectedFileIds, selectedNoteIds]);

  // Tap: if in selection mode → toggle selection; otherwise → open full screen
  const handleItemTap = useCallback(
    (item: CollectionItem) => {
      if (selectionMode) {
        if (item.kind === "file") toggleFileSelection(item.data.id);
        else toggleNoteSelection(item.data.id);
      } else {
        if (item.kind === "file") {
          if (item.data.link) {
            // Open link in full-screen viewer (not in browser directly)
            setFullScreenLink(item.data);
          } else {
            setFullScreenFile(item.data);
          }
        } else {
          setFullScreenNote(item.data);
        }
      }
    },
    [selectionMode, toggleFileSelection, toggleNoteSelection],
  );

  const handleItemLongPress = useCallback(
    (item: CollectionItem) => {
      if (!selectionMode) {
        enterSelectionMode();
      }
      if (item.kind === "file") toggleFileSelection(item.data.id);
      else toggleNoteSelection(item.data.id);
    },
    [
      selectionMode,
      enterSelectionMode,
      toggleFileSelection,
      toggleNoteSelection,
    ],
  );

  const handleDelete = useCallback(async () => {
    const fileIdsToDelete = Array.from(selectedFileIds);
    const noteIdsToDelete = Array.from(selectedNoteIds);
    const fileIdsBigint = fileIdsToDelete.map((id) => BigInt(id));
    const noteIdsBigint = noteIdsToDelete.map((id) => BigInt(id));

    // Optimistically remove from cache immediately
    queryClient.setQueryData<{ files: FileMetadata[]; hasMore: boolean }>(
      ["collections-files"],
      (old) =>
        old
          ? {
              ...old,
              files: old.files.filter((f) => !fileIdsToDelete.includes(f.id)),
            }
          : old,
    );
    queryClient.setQueryData<{ notes: Note[]; hasMore: boolean }>(
      ["collections-notes"],
      (old) =>
        old
          ? {
              ...old,
              notes: old.notes.filter((n) => !noteIdsToDelete.includes(n.id)),
            }
          : old,
    );

    exitSelectionMode();
    setShowDeleteConfirm(false);

    if (fileIdsBigint.length > 0) {
      await deleteFilesMutation.mutateAsync(fileIdsBigint);
    }
    if (noteIdsBigint.length > 0) {
      await deleteNotesMutation.mutateAsync(noteIdsBigint);
    }
  }, [
    selectedFileIds,
    selectedNoteIds,
    deleteFilesMutation,
    deleteNotesMutation,
    exitSelectionMode,
    queryClient,
  ]);

  const handleShare = useCallback(async () => {
    const selectedFiles = files.filter((f) => selectedFileIds.has(f.id));
    const selectedNotes = notes.filter((n) => selectedNoteIds.has(n.id));
    const names = [
      ...selectedFiles.map((f) => f.name),
      ...selectedNotes.map((n) => n.title),
    ].join(", ");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared from Collections",
          text: names,
        });
      }
    } catch {
      // Share cancelled or not supported
    }
    exitSelectionMode();
  }, [files, notes, selectedFileIds, selectedNoteIds, exitSelectionMode]);

  const bg = isDark ? "oklch(0.13 0.02 260)" : "oklch(0.98 0.005 260)";
  const headerBg = isDark ? "oklch(0.16 0.02 260)" : "oklch(0.96 0.005 260)";
  const textColor = isDark ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)";
  const subTextColor = isDark ? "oklch(0.65 0 0)" : "oklch(0.45 0 0)";
  const toolbarBg = isDark ? "oklch(0.18 0.02 260)" : "oklch(0.97 0.005 260)";
  const borderColor = isDark ? "oklch(0.28 0.02 260)" : "oklch(0.88 0.005 260)";
  const amberColor = isDark ? "#FBBF24" : "#D97706";

  // fileIds for dialogs must be string[] (as expected by MoveToMissionDialog / SendToFolderDialog)
  const selectedFileIdsArray: string[] = Array.from(selectedFileIds);
  // noteIds for dialogs must be bigint[]
  const selectedNoteIdsArray: bigint[] = Array.from(selectedNoteIds).map((id) =>
    BigInt(id),
  );

  // Progress bar label
  const fileCount = activeUploads.filter((u) => u.type === "file").length;
  const linkCount = activeUploads.filter((u) => u.type === "link").length;
  const noteCount = activeUploads.filter((u) => u.type === "note").length;
  let uploadLabel = "";
  if (fileCount > 0)
    uploadLabel = `${fileCount} file${fileCount > 1 ? "s" : ""}`;
  if (linkCount > 0)
    uploadLabel = uploadLabel
      ? `${uploadLabel}, ${linkCount} link${linkCount > 1 ? "s" : ""}`
      : `${linkCount} link${linkCount > 1 ? "s" : ""}`;
  if (noteCount > 0)
    uploadLabel = uploadLabel
      ? `${uploadLabel}, ${noteCount} note${noteCount > 1 ? "s" : ""}`
      : `${noteCount} note${noteCount > 1 ? "s" : ""}`;

  // Compute whether all items are currently selected (for toggle label)
  const allFilesSelected =
    files.length > 0 && files.every((f) => selectedFileIds.has(f.id));
  const allNotesSelected =
    notes.length > 0 && notes.every((n) => selectedNoteIds.has(n.id));
  const allItemsSelected =
    files.length + notes.length > 0 && allFilesSelected && allNotesSelected;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col animate-page-scale-in"
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
        data-transition-target="collections"
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60"
          style={{ color: textColor }}
          aria-label="Back"
          data-ocid="collections.close_button"
        >
          <ArrowLeft size={22} />
        </button>
        <h1
          className="flex-1 text-center font-semibold"
          style={{ fontSize: 18, color: textColor }}
        >
          Collections
        </h1>
        {selectionMode ? (
          <button
            type="button"
            onClick={exitSelectionMode}
            className="text-sm font-medium active:opacity-60"
            style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
            data-ocid="collections.cancel_button"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={onUploadRequest}
            className="flex items-center justify-center rounded-full p-2 -mr-2 active:opacity-60"
            style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
            aria-label="Upload"
            data-ocid="collections.upload_button"
          >
            <Upload size={20} />
          </button>
        )}
      </div>

      {/* Inline upload progress bar — shows totalProgress across all files in the batch */}
      {uploads.length > 0 && (
        <div
          className="shrink-0 px-4 py-2"
          style={{
            background: isDark
              ? "oklch(0.16 0.02 260)"
              : "oklch(0.97 0.005 260)",
            borderBottom: `1px solid ${borderColor}`,
          }}
          data-ocid="collections.upload.loading_state"
        >
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 12, color: subTextColor }}>
              {activeUploads.length > 0
                ? `Uploading ${uploadLabel}`
                : "Upload complete"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? "#FBBF24" : "#D97706",
              }}
            >
              {totalProgress}%
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: 3,
              background: isDark
                ? "oklch(0.28 0.02 260)"
                : "oklch(0.88 0.005 260)",
            }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${totalProgress}%`,
                background: isDark ? "#FBBF24" : "#D97706",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      )}

      {/* Item count */}
      {!isLoading && allItems.length > 0 && (
        <div className="px-4 py-2 shrink-0">
          <span style={{ fontSize: 13, color: subTextColor }}>
            {allItems.length} item{allItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Grid content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{
                borderColor: amberColor,
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : allItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 px-8"
            data-ocid="collections.empty_state"
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke={amberColor}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Empty collections"
            >
              <rect x="3" y="3" width="8" height="8" rx="1.5" ry="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" ry="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" ry="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" ry="1.5" />
            </svg>
            <p
              className="text-center font-medium"
              style={{ color: textColor, fontSize: 16 }}
            >
              No items yet
            </p>
            <p
              className="text-center"
              style={{ color: subTextColor, fontSize: 14 }}
            >
              Upload files, create notes, or add links to see them here.
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
                const isSelected = selectedFileIds.has(item.data.id);
                return (
                  <FileThumbnail
                    key={`file-${item.data.id}`}
                    file={item.data}
                    selected={isSelected}
                    selectionMode={selectionMode}
                    onTap={() => handleItemTap(item)}
                    onLongPress={() => handleItemLongPress(item)}
                  />
                );
              }
              const isSelected = selectedNoteIds.has(item.data.id);
              return (
                <NoteThumbnail
                  key={`note-${item.data.id}`}
                  note={item.data}
                  selected={isSelected}
                  selectionMode={selectionMode}
                  onTap={() => handleItemTap(item)}
                  onLongPress={() => handleItemLongPress(item)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Selection toolbar */}
      {selectionMode && (
        <div
          className="shrink-0 flex flex-col gap-2 px-4 py-3"
          style={{
            background: toolbarBg,
            borderTop: `1px solid ${borderColor}`,
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          }}
        >
          {/* Select all + count */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 active:opacity-60"
              style={{
                color: isDark ? "#60A5FA" : "#2563EB",
                fontSize: 14,
                fontWeight: 500,
              }}
              data-ocid="collections.select_all_button"
            >
              <CheckSquare size={16} />
              {allItemsSelected ? "Deselect All" : "Select All"}
            </button>
            <span style={{ fontSize: 13, color: subTextColor }}>
              {totalSelected} selected
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-around">
            <button
              type="button"
              onClick={() => setShowMoveToMission(true)}
              disabled={totalSelected === 0}
              className="flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30"
              style={{ color: isDark ? "#A78BFA" : "#7C3AED", fontSize: 11 }}
              data-ocid="collections.batch.mission.button"
            >
              <Target size={22} />
              <span>Mission</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSendToFolder(true)}
              disabled={totalSelected === 0}
              className="flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30"
              style={{ color: isDark ? "#2DD4BF" : "#0D9488", fontSize: 11 }}
              data-ocid="collections.batch.folder.button"
            >
              <FolderInput size={22} />
              <span>Folder</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={totalSelected === 0}
              className="flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30"
              style={{
                color: isDark ? "oklch(0.75 0 0)" : "oklch(0.45 0 0)",
                fontSize: 11,
              }}
              data-ocid="collections.batch.share.button"
            >
              <Share2 size={22} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={totalSelected === 0}
              className="flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30"
              style={{ color: isDark ? "#F87171" : "#DC2626", fontSize: 11 }}
              data-ocid="collections.batch.delete_button"
            >
              <Trash2 size={22} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation (batch) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 mx-6 flex flex-col gap-4"
            style={{
              background: isDark ? "oklch(0.2 0.02 260)" : "oklch(0.99 0 0)",
              maxWidth: 320,
              width: "100%",
            }}
            data-ocid="collections.delete.dialog"
          >
            <h2
              className="font-semibold text-center"
              style={{ fontSize: 17, color: textColor }}
            >
              Delete {totalSelected} item{totalSelected !== 1 ? "s" : ""}?
            </h2>
            <p
              className="text-center"
              style={{ fontSize: 14, color: subTextColor }}
            >
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-medium active:opacity-70"
                style={{
                  background: isDark
                    ? "oklch(0.28 0.02 260)"
                    : "oklch(0.92 0 0)",
                  color: textColor,
                  fontSize: 15,
                }}
                data-ocid="collections.delete.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  deleteFilesMutation.isPending || deleteNotesMutation.isPending
                }
                className="flex-1 py-2.5 rounded-xl font-medium active:opacity-70 disabled:opacity-60"
                style={{
                  background: isDark ? "#DC2626" : "#EF4444",
                  color: "#fff",
                  fontSize: 15,
                }}
                data-ocid="collections.delete.confirm_button"
              >
                {deleteFilesMutation.isPending || deleteNotesMutation.isPending
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Mission dialog — fileIds must be string[] */}
      {showMoveToMission && (
        <MoveToMissionDialog
          open={showMoveToMission}
          onOpenChange={setShowMoveToMission}
          fileIds={selectedFileIdsArray}
          noteIds={selectedNoteIdsArray}
          onMoveComplete={() => {
            const movedFileIds = selectedFileIdsArray;
            const movedNoteIds = selectedNoteIdsArray.map((id) =>
              id.toString(),
            );
            queryClient.setQueryData<{
              files: FileMetadata[];
              hasMore: boolean;
            }>(["collections-files"], (old) =>
              old
                ? {
                    ...old,
                    files: old.files.filter(
                      (f) => !movedFileIds.includes(f.id),
                    ),
                  }
                : old,
            );
            queryClient.setQueryData<{ notes: Note[]; hasMore: boolean }>(
              ["collections-notes"],
              (old) =>
                old
                  ? {
                      ...old,
                      notes: old.notes.filter(
                        (n) => !movedNoteIds.includes(n.id),
                      ),
                    }
                  : old,
            );
            setShowMoveToMission(false);
            exitSelectionMode();
            queryClient.invalidateQueries({ queryKey: ["collections-files"] });
            queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
          }}
        />
      )}

      {/* Send to Folder dialog — fileIds must be string[] */}
      {showSendToFolder && (
        <SendToFolderDialog
          open={showSendToFolder}
          onOpenChange={setShowSendToFolder}
          fileIds={selectedFileIdsArray}
          noteIds={selectedNoteIdsArray}
          onMoveComplete={() => {
            const movedFileIds = selectedFileIdsArray;
            const movedNoteIds = selectedNoteIdsArray.map((id) =>
              id.toString(),
            );
            queryClient.setQueryData<{
              files: FileMetadata[];
              hasMore: boolean;
            }>(["collections-files"], (old) =>
              old
                ? {
                    ...old,
                    files: old.files.filter(
                      (f) => !movedFileIds.includes(f.id),
                    ),
                  }
                : old,
            );
            queryClient.setQueryData<{ notes: Note[]; hasMore: boolean }>(
              ["collections-notes"],
              (old) =>
                old
                  ? {
                      ...old,
                      notes: old.notes.filter(
                        (n) => !movedNoteIds.includes(n.id),
                      ),
                    }
                  : old,
            );
            setShowSendToFolder(false);
            exitSelectionMode();
            queryClient.invalidateQueries({ queryKey: ["collections-files"] });
            queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
          }}
        />
      )}

      {/* Full-screen file viewer */}
      {fullScreenFile && (
        <FullScreenViewer
          files={files.filter((f) => !f.link)}
          initialIndex={files
            .filter((f) => !f.link)
            .findIndex((f) => f.id === fullScreenFile.id)}
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
              data-ocid="collections.note_viewer.close_button"
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

      {/* Full-screen link viewer */}
      {fullScreenLink && (
        <div
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: bg }}
        >
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
              onClick={() => setFullScreenLink(null)}
              className="flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60"
              style={{ color: textColor }}
              aria-label="Close"
              data-ocid="collections.link_viewer.close_button"
            >
              <ArrowLeft size={22} />
            </button>
            <h1
              className="flex-1 text-center font-semibold truncate px-2"
              style={{ fontSize: 17, color: textColor }}
            >
              {fullScreenLink.name}
            </h1>
            <div style={{ width: 38 }} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {getDomain(fullScreenLink.link!) && (
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomain(fullScreenLink.link!)}&sz=128`}
                alt=""
                className="w-16 h-16 object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <p
              className="text-center text-sm break-all"
              style={{ color: subTextColor, maxWidth: 300 }}
            >
              {fullScreenLink.link}
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  window.open(
                    fullScreenLink.link!,
                    "_blank",
                    "noopener,noreferrer",
                  );
                } catch {
                  // fallback
                }
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold active:opacity-70"
              style={{ background: "#2563EB", color: "#fff", fontSize: 16 }}
              data-ocid="collections.link_viewer.open_button"
            >
              <LinkIcon size={18} />
              Open Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
