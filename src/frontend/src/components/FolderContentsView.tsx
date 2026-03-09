import type { FileMetadata, Folder as FolderType, Note } from "@/backend";
import { useGetNotesInFolder } from "@/hooks/useNotesQueries";
import { useGetFilesInFolder } from "@/hooks/useQueries";
import { ArrowLeft, FileText, Link as LinkIcon } from "lucide-react";
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
}: {
  file: FileMetadata;
  onTap: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const touchMoved = useRef(false);
  const touchStarted = useRef(false);

  const handleTouchStart = () => {
    touchMoved.current = false;
    touchStarted.current = true;
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
  };

  const handleTouchEnd = () => {
    if (!touchMoved.current && touchStarted.current) {
      onTap();
    }
    touchStarted.current = false;
  };

  const handleTouchCancel = () => {
    touchStarted.current = false;
  };

  const isLink = !!file.link;

  if (isLink) {
    const domain = getDomain(file.link!);
    const faviconUrl = domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      : null;
    return (
      <button
        type="button"
        className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: "1.5px solid transparent",
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClick={onTap}
      >
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
      </button>
    );
  }

  if (isImageMime(file.mimeType) && file.blob) {
    const url = file.blob.getDirectURL();
    return (
      <button
        type="button"
        className="overflow-hidden cursor-pointer"
        style={{
          width: 80,
          height: 80,
          borderRadius: 9,
          border: "1.5px solid transparent",
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClick={onTap}
      >
        <img
          src={url}
          alt={file.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
        border: "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
        padding: 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={onTap}
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
  );
}

function NoteThumbnailSimple({
  note,
  onTap,
}: {
  note: Note;
  onTap: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const touchMoved = useRef(false);
  const touchStarted = useRef(false);

  const handleTouchStart = () => {
    touchMoved.current = false;
    touchStarted.current = true;
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
  };

  const handleTouchEnd = () => {
    if (!touchMoved.current && touchStarted.current) {
      onTap();
    }
    touchStarted.current = false;
  };

  const handleTouchCancel = () => {
    touchStarted.current = false;
  };

  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
        border: "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
        padding: 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={onTap}
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
  const { data: files = [], isLoading: filesLoading } =
    useGetFilesInFolder(folderId);
  const { data: notes = [], isLoading: notesLoading } =
    useGetNotesInFolder(folderId);

  const isLoading = filesLoading || notesLoading;

  // Full-screen viewer state
  const [fullScreenFile, setFullScreenFile] = useState<FileMetadata | null>(
    null,
  );
  const [fullScreenNote, setFullScreenNote] = useState<Note | null>(null);

  const bg = isDark ? "oklch(0.13 0.02 260)" : "oklch(0.98 0.005 260)";
  const headerBg = isDark ? "oklch(0.16 0.02 260)" : "oklch(0.96 0.005 260)";
  const textColor = isDark ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)";
  const subTextColor = isDark ? "oklch(0.65 0 0)" : "oklch(0.45 0 0)";
  const borderColor = isDark ? "oklch(0.28 0.02 260)" : "oklch(0.88 0.005 260)";
  const tealColor = isDark ? "#2DD4BF" : "#0D9488";

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

  const handleFileTap = (file: FileMetadata) => {
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
    setFullScreenNote(note);
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
                    />
                  );
                }
                return (
                  <NoteThumbnailSimple
                    key={`note-${item.data.id}`}
                    note={item.data}
                    onTap={() => handleNoteTap(item.data)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
