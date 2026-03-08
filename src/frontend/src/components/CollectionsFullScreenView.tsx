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

  const handleTouchStart = () => {
    didLongPress.current = false;
    touchMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        didLongPress.current = true;
        onLongPress();
      }
    }, 500);
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
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
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: borderStyle,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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
            className="w-8 h-8 object-contain"
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
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          border: borderStyle,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Generic file thumbnail
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
        border: borderStyle,
        boxSizing: "border-box",
        flexShrink: 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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

  const handleTouchStart = () => {
    didLongPress.current = false;
    touchMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        didLongPress.current = true;
        onLongPress();
      }
    }, 500);
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
      onTap();
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
        border: selected ? "2px solid #3B82F6" : "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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

  // Dialog state
  const [showMoveToMission, setShowMoveToMission] = useState(false);
  const [showSendToFolder, setShowSendToFolder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Single-item action sheet state
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<CollectionItem | null>(null);
  const [showSingleItemSheet, setShowSingleItemSheet] = useState(false);
  // Single-item specific dialog state
  const [showSingleMoveToMission, setShowSingleMoveToMission] = useState(false);
  const [showSingleSendToFolder, setShowSingleSendToFolder] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);

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
    setSelectedFileIds(new Set(files.map((f) => f.id)));
    setSelectedNoteIds(new Set(notes.map((n) => n.id)));
  }, [files, notes]);

  // Tap: if in selection mode → toggle selection; otherwise → open action sheet
  const handleItemTap = useCallback(
    (item: CollectionItem) => {
      if (selectionMode) {
        if (item.kind === "file") toggleFileSelection(item.data.id);
        else toggleNoteSelection(item.data.id);
      } else {
        setSelectedSingleItem(item);
        setShowSingleItemSheet(true);
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
    const fileIds = Array.from(selectedFileIds).map((id) => BigInt(id));
    const noteIds = Array.from(selectedNoteIds).map((id) => BigInt(id));
    if (fileIds.length > 0) {
      await deleteFilesMutation.mutateAsync(fileIds);
    }
    if (noteIds.length > 0) {
      await deleteNotesMutation.mutateAsync(noteIds);
    }
    exitSelectionMode();
    setShowDeleteConfirm(false);
  }, [
    selectedFileIds,
    selectedNoteIds,
    deleteFilesMutation,
    deleteNotesMutation,
    exitSelectionMode,
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

  // Single-item action handlers
  const closeSingleItemSheet = useCallback(() => {
    setShowSingleItemSheet(false);
    setSelectedSingleItem(null);
  }, []);

  const handleSingleItemShare = useCallback(async () => {
    if (!selectedSingleItem) return;
    const name =
      selectedSingleItem.kind === "file"
        ? selectedSingleItem.data.name
        : selectedSingleItem.data.title;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared from Collections",
          text: name,
        });
      }
    } catch {
      // Share cancelled or not supported
    }
    closeSingleItemSheet();
  }, [selectedSingleItem, closeSingleItemSheet]);

  const handleSingleItemDeleteConfirm = useCallback(async () => {
    if (!selectedSingleItem) return;
    if (selectedSingleItem.kind === "file") {
      await deleteFilesMutation.mutateAsync([
        BigInt(selectedSingleItem.data.id),
      ]);
    } else {
      await deleteNotesMutation.mutateAsync([
        BigInt(selectedSingleItem.data.id),
      ]);
    }
    setShowSingleDeleteConfirm(false);
    closeSingleItemSheet();
  }, [
    selectedSingleItem,
    deleteFilesMutation,
    deleteNotesMutation,
    closeSingleItemSheet,
  ]);

  // Single-item IDs for dialogs
  const singleItemFileIds: string[] =
    selectedSingleItem?.kind === "file" ? [selectedSingleItem.data.id] : [];
  const singleItemNoteIds: bigint[] =
    selectedSingleItem?.kind === "note"
      ? [BigInt(selectedSingleItem.data.id)]
      : [];

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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-page-scale-in"
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

      {/* Inline upload progress bar */}
      {activeUploads.length > 0 && (
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
              Uploading {uploadLabel}
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
              Select All
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
            setShowSendToFolder(false);
            exitSelectionMode();
            queryClient.invalidateQueries({ queryKey: ["collections-files"] });
            queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
          }}
        />
      )}

      {/* ── Single-item action sheet ─────────────────────────────────────────── */}
      {showSingleItemSheet && selectedSingleItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={closeSingleItemSheet}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSingleItemSheet();
            }}
            role="presentation"
          />
          {/* Sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-[61] flex flex-col"
            style={{
              background: isDark ? "oklch(0.18 0.02 260)" : "oklch(0.99 0 0)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: "0 -4px 32px rgba(0,0,0,0.22)",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
            }}
            data-ocid="collections.item.sheet"
          >
            {/* Handle */}
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "oklch(0.75 0 0)",
                margin: "14px auto 10px",
              }}
            />
            {/* Item name */}
            <div
              className="px-5 pb-3"
              style={{
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <p
                className="font-semibold truncate"
                style={{ fontSize: 15, color: textColor }}
              >
                {selectedSingleItem.kind === "file"
                  ? selectedSingleItem.data.name
                  : selectedSingleItem.data.title || "Note"}
              </p>
            </div>
            {/* Actions */}
            <div className="flex flex-col px-4 pt-2 gap-1">
              {/* Send to Mission */}
              <button
                type="button"
                onClick={() => {
                  setShowSingleItemSheet(false);
                  setShowSingleMoveToMission(true);
                }}
                className="flex items-center gap-4 px-3 py-3.5 rounded-xl active:opacity-60"
                style={{ color: isDark ? "#A78BFA" : "#7C3AED", fontSize: 15 }}
                data-ocid="collections.item.mission.button"
              >
                <Target size={20} />
                <span>Send to Mission</span>
              </button>
              {/* Send to Folder */}
              <button
                type="button"
                onClick={() => {
                  setShowSingleItemSheet(false);
                  setShowSingleSendToFolder(true);
                }}
                className="flex items-center gap-4 px-3 py-3.5 rounded-xl active:opacity-60"
                style={{ color: isDark ? "#2DD4BF" : "#0D9488", fontSize: 15 }}
                data-ocid="collections.item.folder.button"
              >
                <FolderInput size={20} />
                <span>Send to Folder</span>
              </button>
              {/* Share */}
              <button
                type="button"
                onClick={handleSingleItemShare}
                className="flex items-center gap-4 px-3 py-3.5 rounded-xl active:opacity-60"
                style={{
                  color: isDark ? "oklch(0.75 0 0)" : "oklch(0.35 0 0)",
                  fontSize: 15,
                }}
                data-ocid="collections.item.share.button"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
              {/* Delete */}
              <button
                type="button"
                onClick={() => {
                  setShowSingleItemSheet(false);
                  setShowSingleDeleteConfirm(true);
                }}
                className="flex items-center gap-4 px-3 py-3.5 rounded-xl active:opacity-60"
                style={{ color: isDark ? "#F87171" : "#DC2626", fontSize: 15 }}
                data-ocid="collections.item.delete_button"
              >
                <Trash2 size={20} />
                <span>Delete</span>
              </button>
            </div>
            {/* Cancel */}
            <div className="px-4 pt-2">
              <button
                type="button"
                onClick={closeSingleItemSheet}
                className="w-full py-3.5 rounded-xl font-semibold active:opacity-70"
                style={{
                  background: isDark
                    ? "oklch(0.28 0.02 260)"
                    : "oklch(0.93 0 0)",
                  color: textColor,
                  fontSize: 15,
                }}
                data-ocid="collections.item.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Single-item delete confirmation */}
      {showSingleDeleteConfirm && selectedSingleItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 mx-6 flex flex-col gap-4"
            style={{
              background: isDark ? "oklch(0.2 0.02 260)" : "oklch(0.99 0 0)",
              maxWidth: 320,
              width: "100%",
            }}
            data-ocid="collections.item.delete.dialog"
          >
            <h2
              className="font-semibold text-center"
              style={{ fontSize: 17, color: textColor }}
            >
              Delete this item?
            </h2>
            <p
              className="text-center truncate px-2"
              style={{ fontSize: 14, color: subTextColor }}
            >
              {selectedSingleItem.kind === "file"
                ? selectedSingleItem.data.name
                : selectedSingleItem.data.title || "Note"}
            </p>
            <p
              className="text-center"
              style={{ fontSize: 13, color: subTextColor }}
            >
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSingleDeleteConfirm(false);
                  setSelectedSingleItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-medium active:opacity-70"
                style={{
                  background: isDark
                    ? "oklch(0.28 0.02 260)"
                    : "oklch(0.92 0 0)",
                  color: textColor,
                  fontSize: 15,
                }}
                data-ocid="collections.item.delete.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSingleItemDeleteConfirm}
                disabled={
                  deleteFilesMutation.isPending || deleteNotesMutation.isPending
                }
                className="flex-1 py-2.5 rounded-xl font-medium active:opacity-70 disabled:opacity-60"
                style={{
                  background: isDark ? "#DC2626" : "#EF4444",
                  color: "#fff",
                  fontSize: 15,
                }}
                data-ocid="collections.item.delete.confirm_button"
              >
                {deleteFilesMutation.isPending || deleteNotesMutation.isPending
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single-item: Move to Mission */}
      {showSingleMoveToMission && selectedSingleItem && (
        <MoveToMissionDialog
          open={showSingleMoveToMission}
          onOpenChange={setShowSingleMoveToMission}
          fileIds={singleItemFileIds}
          noteIds={singleItemNoteIds}
          onMoveComplete={() => {
            setShowSingleMoveToMission(false);
            setSelectedSingleItem(null);
            queryClient.invalidateQueries({ queryKey: ["collections-files"] });
            queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
          }}
        />
      )}

      {/* Single-item: Send to Folder */}
      {showSingleSendToFolder && selectedSingleItem && (
        <SendToFolderDialog
          open={showSingleSendToFolder}
          onOpenChange={setShowSingleSendToFolder}
          fileIds={singleItemFileIds}
          noteIds={singleItemNoteIds}
          onMoveComplete={() => {
            setShowSingleSendToFolder(false);
            setSelectedSingleItem(null);
            queryClient.invalidateQueries({ queryKey: ["collections-files"] });
            queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
          }}
        />
      )}
    </div>
  );
}
