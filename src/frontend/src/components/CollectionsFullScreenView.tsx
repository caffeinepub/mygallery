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
} from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { FileMetadata, Note } from "../backend";
import { SortDirection } from "../backend";
import { useActor } from "../hooks/useActor";
import MoveToMissionDialog from "./MoveToMissionDialog";
import SendToFolderDialog from "./SendToFolderDialog";

interface CollectionsFullScreenViewProps {
  onClose: () => void;
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
}: CollectionsFullScreenViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

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

  const handleItemTap = useCallback(
    (item: CollectionItem) => {
      if (!selectionMode) return;
      if (item.kind === "file") toggleFileSelection(item.data.id);
      else toggleNoteSelection(item.data.id);
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
        >
          <ArrowLeft size={22} />
        </button>
        <h1
          className="flex-1 text-center font-semibold"
          style={{ fontSize: 18, color: textColor, marginRight: 30 }}
        >
          Collections
        </h1>
        {selectionMode && (
          <button
            type="button"
            onClick={exitSelectionMode}
            className="text-sm font-medium active:opacity-60"
            style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
          >
            Cancel
          </button>
        )}
      </div>

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
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
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
            >
              <Trash2 size={22} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 mx-6 flex flex-col gap-4"
            style={{
              background: isDark ? "oklch(0.2 0.02 260)" : "oklch(0.99 0 0)",
              maxWidth: 320,
              width: "100%",
            }}
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
    </div>
  );
}
