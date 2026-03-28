import { z, u as useGetFilesInFolder, a as useGetNotesInFolder, r as reactExports, j as jsxRuntimeExports, L as Link, b as useBackendActor, c as useGetFolders, d as useCreateFolder, e as useRenameFolder, f as useDeleteFolder, B as Button, I as Input, g as ue } from "./index-DGJr_Eu_.js";
import { P as Plus, S as ScrollArea, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction, h as SwipeActionsRow } from "./SwipeActionsRow-CE9nX29O.js";
import { A as ArrowLeft, F as FullScreenViewer, a as FileText, b as Folder } from "./FullScreenViewer-DfBfuK7s.js";
function isImageMime(mimeType) {
  return mimeType.startsWith("image/");
}
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
function FileThumbnailSimple({
  file,
  onTap
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const touchMoved = reactExports.useRef(false);
  const touchStarted = reactExports.useRef(false);
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
    const domain = getDomain(file.link);
    const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "flex flex-col items-center justify-center overflow-hidden cursor-pointer",
        style: {
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: "1.5px solid transparent",
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0
        },
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
        onClick: onTap,
        children: [
          faviconUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: faviconUrl,
              alt: file.name,
              loading: "lazy",
              className: "w-8 h-8 object-contain",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 28, color: isDark ? "#60A5FA" : "#2563EB" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "mt-1 text-center px-1 truncate w-full",
              style: {
                fontSize: 9,
                color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
                lineHeight: 1.2
              },
              children: file.name
            }
          )
        ]
      }
    );
  }
  if (isImageMime(file.mimeType) && file.blob) {
    const url = file.blob.getDirectURL();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "overflow-hidden cursor-pointer",
        style: {
          width: 80,
          height: 80,
          borderRadius: 9,
          border: "1.5px solid transparent",
          boxSizing: "border-box",
          flexShrink: 0,
          padding: 0
        },
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
        onClick: onTap,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: url,
            alt: file.name,
            loading: "lazy",
            className: "w-full h-full object-cover"
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      className: "flex flex-col items-center justify-center overflow-hidden cursor-pointer",
      style: {
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
        border: "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
        padding: 0
      },
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onClick: onTap,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 28, color: isDark ? "#60A5FA" : "#2563EB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "mt-1 text-center px-1 truncate w-full",
            style: {
              fontSize: 9,
              color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
              lineHeight: 1.2
            },
            children: file.name
          }
        )
      ]
    }
  );
}
function NoteThumbnailSimple({
  note,
  onTap
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const touchMoved = reactExports.useRef(false);
  const touchStarted = reactExports.useRef(false);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      className: "flex flex-col items-center justify-center overflow-hidden cursor-pointer",
      style: {
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
        border: "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
        padding: 0
      },
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onClick: onTap,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 24, color: isDark ? "#4ADE80" : "#16A34A" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "mt-1 text-center px-1 truncate w-full",
            style: {
              fontSize: 9,
              color: isDark ? "oklch(0.7 0 0)" : "oklch(0.4 0 0)",
              lineHeight: 1.2
            },
            children: note.title || "Note"
          }
        )
      ]
    }
  );
}
function FolderContentsView({
  folder,
  onBack
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const folderId = folder.id;
  const { data: files = [], isLoading: filesLoading } = useGetFilesInFolder(folderId);
  const { data: notes = [], isLoading: notesLoading } = useGetNotesInFolder(folderId);
  const isLoading = filesLoading || notesLoading;
  const [fullScreenFile, setFullScreenFile] = reactExports.useState(
    null
  );
  const [fullScreenNote, setFullScreenNote] = reactExports.useState(null);
  const bg = isDark ? "oklch(0.13 0.02 260)" : "oklch(0.98 0.005 260)";
  const headerBg = isDark ? "oklch(0.16 0.02 260)" : "oklch(0.96 0.005 260)";
  const textColor = isDark ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)";
  const subTextColor = isDark ? "oklch(0.65 0 0)" : "oklch(0.45 0 0)";
  const borderColor = isDark ? "oklch(0.28 0.02 260)" : "oklch(0.88 0.005 260)";
  const tealColor = isDark ? "#2DD4BF" : "#0D9488";
  const allItems = [
    ...files.map((f) => ({ kind: "file", data: f })),
    ...notes.map((n) => ({ kind: "note", data: n }))
  ];
  allItems.sort((a, b) => {
    const aTime = Number(a.data.createdAt);
    const bTime = Number(b.data.createdAt);
    return bTime - aTime;
  });
  const nonLinkFiles = files.filter((f) => !f.link);
  const handleFileTap = (file) => {
    if (file.link) {
      try {
        window.open(file.link, "_blank", "noopener,noreferrer");
      } catch {
      }
    } else {
      setFullScreenFile(file);
    }
  };
  const handleNoteTap = (note) => {
    setFullScreenNote(note);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[60] flex flex-col",
        style: { background: bg },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center px-4 py-3 shrink-0",
              style: {
                background: headerBg,
                borderBottom: `1px solid ${borderColor}`,
                paddingTop: "max(12px, env(safe-area-inset-top))"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onBack,
                    className: "flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60",
                    style: { color: textColor },
                    "aria-label": "Back",
                    "data-ocid": "folder.contents.close_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 22 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h1",
                  {
                    className: "flex-1 text-center font-semibold truncate px-2",
                    style: { fontSize: 18, color: textColor },
                    children: folder.name
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 38 } })
              ]
            }
          ),
          !isLoading && allItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 13, color: subTextColor }, children: [
            allItems.length,
            " item",
            allItems.length !== 1 ? "s" : ""
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex-1 overflow-y-auto",
              style: { WebkitOverflowScrolling: "touch" },
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-8 h-8 rounded-full border-2 animate-spin",
                  style: {
                    borderColor: tealColor,
                    borderTopColor: "transparent"
                  }
                }
              ) }) : allItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center h-full gap-3 px-8",
                  "data-ocid": "folder.contents.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "svg",
                      {
                        width: "56",
                        height: "56",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: tealColor,
                        strokeWidth: "2.3",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        role: "img",
                        "aria-label": "Empty folder",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-center font-medium",
                        style: { color: textColor, fontSize: 16 },
                        children: "Empty folder"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-center",
                        style: { color: subTextColor, fontSize: 14 },
                        children: "No files or notes in this folder yet."
                      }
                    )
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 80px)",
                    gap: 10,
                    padding: "12px 16px",
                    justifyContent: "center"
                  },
                  children: allItems.map((item) => {
                    if (item.kind === "file") {
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(
                        FileThumbnailSimple,
                        {
                          file: item.data,
                          onTap: () => handleFileTap(item.data)
                        },
                        `file-${item.data.id}`
                      );
                    }
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      NoteThumbnailSimple,
                      {
                        note: item.data,
                        onTap: () => handleNoteTap(item.data)
                      },
                      `note-${item.data.id}`
                    );
                  })
                }
              )
            }
          )
        ]
      }
    ),
    fullScreenFile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FullScreenViewer,
      {
        files: nonLinkFiles,
        initialIndex: nonLinkFiles.findIndex(
          (f) => f.id === fullScreenFile.id
        ),
        open: !!fullScreenFile,
        onOpenChange: (open) => {
          if (!open) setFullScreenFile(null);
        }
      }
    ),
    fullScreenNote && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[80] flex flex-col",
        style: { background: bg },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center px-4 py-3 shrink-0",
              style: {
                background: headerBg,
                borderBottom: `1px solid ${borderColor}`,
                paddingTop: "max(12px, env(safe-area-inset-top))"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setFullScreenNote(null),
                    className: "flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60",
                    style: { color: textColor },
                    "aria-label": "Close",
                    "data-ocid": "folder.note_viewer.close_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 22 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h1",
                  {
                    className: "flex-1 text-center font-semibold truncate px-2",
                    style: { fontSize: 17, color: textColor },
                    children: fullScreenNote.title || "Note"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 38 } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex-1 overflow-y-auto px-5 py-4",
              style: { WebkitOverflowScrolling: "touch" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  style: {
                    color: textColor,
                    fontSize: 16,
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  },
                  children: fullScreenNote.body || ""
                }
              )
            }
          )
        ]
      }
    )
  ] });
}
function FoldersFullScreenView({
  onClose,
  onSelectFolder: _onSelectFolder
}) {
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  const [editingFolderId, setEditingFolderId] = reactExports.useState(null);
  const [editingName, setEditingName] = reactExports.useState("");
  const [openSwipeRowId, setOpenSwipeRowId] = reactExports.useState(null);
  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = reactExports.useState(null);
  const [openFolder, setOpenFolder] = reactExports.useState(null);
  const { status } = useBackendActor();
  const { data: folders = [], isLoading } = useGetFolders();
  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const deleteFolderMutation = useDeleteFolder();
  const isActorReady = status === "ready";
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    if (!isActorReady) {
      ue.error("Please wait for the application to initialize");
      return;
    }
    try {
      await createFolderMutation.mutateAsync(newFolderName.trim());
      setNewFolderName("");
      ue.success("Folder created successfully");
    } catch (error) {
      console.error("Failed to create folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create folder";
      ue.error(errorMessage);
    }
  };
  const handleRenameFolder = async (folderId) => {
    if (!editingName.trim()) return;
    if (!isActorReady) {
      ue.error("Please wait for the application to initialize");
      return;
    }
    try {
      await renameFolderMutation.mutateAsync({
        folderId,
        newName: editingName.trim()
      });
      setEditingFolderId(null);
      setEditingName("");
      setOpenSwipeRowId(null);
      ue.success("Folder renamed successfully");
    } catch (error) {
      console.error("Failed to rename folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to rename folder";
      ue.error(errorMessage);
    }
  };
  const handleOpenDeleteConfirm = (folderId) => {
    setOpenSwipeRowId(null);
    setDeleteConfirmFolderId(folderId);
  };
  const handleDeleteFolder = async (folderId) => {
    if (!isActorReady) {
      ue.error("Please wait for the application to initialize");
      return;
    }
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      setDeleteConfirmFolderId(null);
      setOpenSwipeRowId(null);
      ue.success("Folder deleted successfully");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete folder";
      ue.error(errorMessage);
    }
  };
  const startEditing = (folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setOpenSwipeRowId(null);
  };
  const cancelEditing = () => {
    setEditingFolderId(null);
    setEditingName("");
  };
  const handleFolderSelect = (folder) => {
    setOpenFolder(folder);
  };
  const renderFolderRow = (folder) => {
    const folderId = folder.id.toString();
    const isEditing = editingFolderId === folder.id;
    const folderContent = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: editingName,
          onChange: (e) => setEditingName(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") handleRenameFolder(folder.id);
            if (e.key === "Escape") cancelEditing();
          },
          className: "flex-1",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: () => handleRenameFolder(folder.id),
          disabled: !editingName.trim() || renameFolderMutation.isPending,
          children: "Save"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: cancelEditing, children: "Cancel" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "ghost",
        className: "flex-1 justify-start",
        onClick: () => handleFolderSelect(folder),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-4 w-4 mr-2" }),
          folder.name
        ]
      }
    ) });
    if (!isEditing) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwipeActionsRow,
        {
          onEdit: () => startEditing(folder),
          onDelete: () => handleOpenDeleteConfirm(folder.id),
          isOpen: openSwipeRowId === folderId,
          onOpenChange: (open) => {
            setOpenSwipeRowId(open ? folderId : null);
          },
          disabled: !isActorReady,
          children: folderContent
        },
        folderId
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: folderContent }, folderId);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-background flex flex-col animate-page-scale-in", children: [
      openFolder && /* @__PURE__ */ jsxRuntimeExports.jsx(
        FolderContentsView,
        {
          folder: openFolder,
          onBack: () => setOpenFolder(null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-4 p-4 border-b border-border",
          "data-transition-target": "folders",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: onClose,
                className: "shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold flex-1", children: "Folders" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "New folder name",
            value: newFolderName,
            onChange: (e) => setNewFolderName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handleCreateFolder();
            },
            disabled: !isActorReady || createFolderMutation.isPending,
            className: "flex-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleCreateFolder,
            disabled: !newFolderName.trim() || !isActorReady || createFolderMutation.isPending,
            size: "icon",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading folders..." }) : folders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No folders yet. Create one to get started!" }) : folders.map(renderFolderRow) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: deleteConfirmFolderId !== null,
        onOpenChange: (open) => !open && setDeleteConfirmFolderId(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Folder" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Are you sure you want to delete this folder? All files and notes in this folder will also be deleted. This action cannot be undone." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => deleteConfirmFolderId !== null && handleDeleteFolder(deleteConfirmFolderId),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: "OK"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  FoldersFullScreenView as default
};
