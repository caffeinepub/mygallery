import { h as createLucideIcon, a8 as useInternetIdentity, H as useQueryClient, a9 as useQuery, r as reactExports, aa as createActorWithConfig, ab as getSecretParameter, z, ac as useUpload, ad as useMutation, j as jsxRuntimeExports, ae as Upload, L as Link, af as SortDirection } from "./index-DGJr_Eu_.js";
import { A as ArrowLeft, T as Target, c as FolderInput, S as Share2, d as Trash2, M as MoveToMissionDialog, f as SendToFolderDialog, F as FullScreenViewer, a as FileText } from "./FullScreenViewer-DfBfuK7s.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode);
const ACTOR_QUERY_KEY = "actor";
function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig();
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
function isImageMime(mimeType) {
  return mimeType.startsWith("image/");
}
function isLinkFile(file) {
  return !!file.link;
}
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
function FileThumbnail({
  file,
  selected,
  selectionMode,
  onTap,
  onLongPress
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const longPressTimer = reactExports.useRef(null);
  const didLongPress = reactExports.useRef(false);
  const touchMoved = reactExports.useRef(false);
  const touchStartX = reactExports.useRef(0);
  const touchStartY = reactExports.useRef(0);
  const handleTouchStart = (e) => {
    e.preventDefault();
    didLongPress.current = false;
    touchMoved.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      var _a;
      if (!touchMoved.current) {
        didLongPress.current = true;
        try {
          (_a = navigator.vibrate) == null ? void 0 : _a.call(navigator, 50);
        } catch {
        }
        onLongPress();
      }
    }, 500);
  };
  const handleTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) {
      touchMoved.current = true;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };
  const handleTouchEnd = (e) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
      e.preventDefault();
      onTap();
    }
  };
  const handleTouchCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  const borderStyle = selected ? "2px solid #3B82F6" : "1.5px solid transparent";
  if (isLinkFile(file)) {
    const domain = getDomain(file.link);
    const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative flex flex-col items-center justify-center overflow-hidden cursor-pointer",
        style: {
          width: 80,
          height: 80,
          borderRadius: 9,
          background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
          border: borderStyle,
          boxSizing: "border-box",
          flexShrink: 0,
          WebkitTouchCallout: "none",
          userSelect: "none"
        },
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
        onContextMenu: (e) => e.preventDefault(),
        onClick: selectionMode ? onTap : void 0,
        onKeyDown: selectionMode ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTap();
          }
        } : void 0,
        children: [
          selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 16, color: "#3B82F6" }) }),
          faviconUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: faviconUrl,
              alt: file.name,
              loading: "lazy",
              draggable: false,
              className: "w-8 h-8 object-contain",
              onContextMenu: (e) => e.preventDefault(),
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative overflow-hidden cursor-pointer",
        style: {
          width: 80,
          height: 80,
          borderRadius: 9,
          border: borderStyle,
          boxSizing: "border-box",
          flexShrink: 0,
          WebkitTouchCallout: "none",
          userSelect: "none"
        },
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
        onContextMenu: (e) => e.preventDefault(),
        onClick: selectionMode ? onTap : void 0,
        onKeyDown: selectionMode ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTap();
          }
        } : void 0,
        children: [
          selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 16, color: "#3B82F6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: url,
              alt: file.name,
              loading: "lazy",
              draggable: false,
              className: "w-full h-full object-cover",
              onContextMenu: (e) => e.preventDefault(),
              style: { pointerEvents: "none" }
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex flex-col items-center justify-center overflow-hidden cursor-pointer",
      style: {
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.22 0.02 260)" : "oklch(0.93 0.01 260)",
        border: borderStyle,
        boxSizing: "border-box",
        flexShrink: 0,
        WebkitTouchCallout: "none",
        userSelect: "none"
      },
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onContextMenu: (e) => e.preventDefault(),
      onClick: selectionMode ? onTap : void 0,
      onKeyDown: selectionMode ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      } : void 0,
      children: [
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 16, color: "#3B82F6" }) }),
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
function NoteThumbnail({
  note,
  selected,
  selectionMode,
  onTap,
  onLongPress
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const longPressTimer = reactExports.useRef(null);
  const didLongPress = reactExports.useRef(false);
  const touchMoved = reactExports.useRef(false);
  const touchStartX = reactExports.useRef(0);
  const touchStartY = reactExports.useRef(0);
  const handleTouchStart = (e) => {
    e.preventDefault();
    didLongPress.current = false;
    touchMoved.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      var _a;
      if (!touchMoved.current) {
        didLongPress.current = true;
        try {
          (_a = navigator.vibrate) == null ? void 0 : _a.call(navigator, 50);
        } catch {
        }
        onLongPress();
      }
    }, 500);
  };
  const handleTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) {
      touchMoved.current = true;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };
  const handleTouchEnd = (e) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current && !touchMoved.current) {
      e.preventDefault();
      onTap();
    }
  };
  const handleTouchCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex flex-col items-center justify-center overflow-hidden cursor-pointer",
      style: {
        width: 80,
        height: 80,
        borderRadius: 9,
        background: isDark ? "oklch(0.24 0.03 150)" : "oklch(0.94 0.02 150)",
        border: selected ? "2px solid #3B82F6" : "1.5px solid transparent",
        boxSizing: "border-box",
        flexShrink: 0,
        WebkitTouchCallout: "none",
        userSelect: "none"
      },
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onContextMenu: (e) => e.preventDefault(),
      onClick: selectionMode ? onTap : void 0,
      onKeyDown: selectionMode ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      } : void 0,
      children: [
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 16, color: "#3B82F6" }) }),
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
function CollectionsFullScreenView({
  onClose,
  onUploadRequest
}) {
  const { resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const { totalProgress, uploads } = useUpload();
  const activeUploads = uploads.filter((u) => !u.completed);
  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ["collections-files"],
    queryFn: async () => {
      if (!actor) return { files: [], hasMore: false };
      return actor.getPaginatedFiles(
        SortDirection.desc,
        BigInt(0),
        BigInt(500)
      );
    },
    enabled: !!actor && !actorFetching,
    staleTime: 2 * 60 * 1e3
  });
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ["collections-notes"],
    queryFn: async () => {
      if (!actor) return { notes: [], hasMore: false };
      return actor.getPaginatedNotes(
        SortDirection.desc,
        BigInt(0),
        BigInt(500)
      );
    },
    enabled: !!actor && !actorFetching,
    staleTime: 2 * 60 * 1e3
  });
  const deleteFilesMutation = useMutation({
    mutationFn: async (fileIds) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteFiles(fileIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections-files"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    }
  });
  const deleteNotesMutation = useMutation({
    mutationFn: async (noteIds) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteNotes(noteIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });
  const [selectedFileIds, setSelectedFileIds] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [selectedNoteIds, setSelectedNoteIds] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [selectionMode, setSelectionMode] = reactExports.useState(false);
  const [fullScreenFile, setFullScreenFile] = reactExports.useState(
    null
  );
  const [fullScreenNote, setFullScreenNote] = reactExports.useState(null);
  const [fullScreenLink, setFullScreenLink] = reactExports.useState(
    null
  );
  const [showMoveToMission, setShowMoveToMission] = reactExports.useState(false);
  const [showSendToFolder, setShowSendToFolder] = reactExports.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = reactExports.useState(false);
  const files = (filesData == null ? void 0 : filesData.files) ?? [];
  const notes = (notesData == null ? void 0 : notesData.notes) ?? [];
  const allItems = [
    ...files.map((f) => ({ kind: "file", data: f })),
    ...notes.map((n) => ({ kind: "note", data: n }))
  ];
  allItems.sort((a, b) => {
    const aTime = Number(a.data.createdAt);
    const bTime = Number(b.data.createdAt);
    return bTime - aTime;
  });
  const totalSelected = selectedFileIds.size + selectedNoteIds.size;
  const isLoading = filesLoading || notesLoading;
  const enterSelectionMode = reactExports.useCallback(() => {
    setSelectionMode(true);
  }, []);
  const exitSelectionMode = reactExports.useCallback(() => {
    setSelectionMode(false);
    setSelectedFileIds(/* @__PURE__ */ new Set());
    setSelectedNoteIds(/* @__PURE__ */ new Set());
  }, []);
  const toggleFileSelection = reactExports.useCallback((id) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleNoteSelection = reactExports.useCallback((id) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const handleSelectAll = reactExports.useCallback(() => {
    const allFilesSelected2 = files.every((f) => selectedFileIds.has(f.id));
    const allNotesSelected2 = notes.every((n) => selectedNoteIds.has(n.id));
    const allSelected = allFilesSelected2 && allNotesSelected2 && files.length + notes.length > 0;
    if (allSelected) {
      setSelectedFileIds(/* @__PURE__ */ new Set());
      setSelectedNoteIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
      setSelectedNoteIds(new Set(notes.map((n) => n.id)));
    }
  }, [files, notes, selectedFileIds, selectedNoteIds]);
  const handleItemTap = reactExports.useCallback(
    (item) => {
      if (selectionMode) {
        if (item.kind === "file") toggleFileSelection(item.data.id);
        else toggleNoteSelection(item.data.id);
      } else {
        if (item.kind === "file") {
          if (item.data.link) {
            setFullScreenLink(item.data);
          } else {
            setFullScreenFile(item.data);
          }
        } else {
          setFullScreenNote(item.data);
        }
      }
    },
    [selectionMode, toggleFileSelection, toggleNoteSelection]
  );
  const handleItemLongPress = reactExports.useCallback(
    (item) => {
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
      toggleNoteSelection
    ]
  );
  const handleDelete = reactExports.useCallback(async () => {
    const fileIdsToDelete = Array.from(selectedFileIds);
    const noteIdsToDelete = Array.from(selectedNoteIds);
    const fileIdsBigint = fileIdsToDelete.map((id) => BigInt(id));
    const noteIdsBigint = noteIdsToDelete.map((id) => BigInt(id));
    queryClient.setQueryData(
      ["collections-files"],
      (old) => old ? {
        ...old,
        files: old.files.filter((f) => !fileIdsToDelete.includes(f.id))
      } : old
    );
    queryClient.setQueryData(
      ["collections-notes"],
      (old) => old ? {
        ...old,
        notes: old.notes.filter((n) => !noteIdsToDelete.includes(n.id))
      } : old
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
    queryClient
  ]);
  const handleShare = reactExports.useCallback(async () => {
    const selectedFiles = files.filter((f) => selectedFileIds.has(f.id));
    const selectedNotes = notes.filter((n) => selectedNoteIds.has(n.id));
    const names = [
      ...selectedFiles.map((f) => f.name),
      ...selectedNotes.map((n) => n.title)
    ].join(", ");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared from Collections",
          text: names
        });
      }
    } catch {
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
  const selectedFileIdsArray = Array.from(selectedFileIds);
  const selectedNoteIdsArray = Array.from(selectedNoteIds).map(
    (id) => BigInt(id)
  );
  const fileCount = activeUploads.filter((u) => u.type === "file").length;
  const linkCount = activeUploads.filter((u) => u.type === "link").length;
  const noteCount = activeUploads.filter((u) => u.type === "note").length;
  let uploadLabel = "";
  if (fileCount > 0)
    uploadLabel = `${fileCount} file${fileCount > 1 ? "s" : ""}`;
  if (linkCount > 0)
    uploadLabel = uploadLabel ? `${uploadLabel}, ${linkCount} link${linkCount > 1 ? "s" : ""}` : `${linkCount} link${linkCount > 1 ? "s" : ""}`;
  if (noteCount > 0)
    uploadLabel = uploadLabel ? `${uploadLabel}, ${noteCount} note${noteCount > 1 ? "s" : ""}` : `${noteCount} note${noteCount > 1 ? "s" : ""}`;
  const allFilesSelected = files.length > 0 && files.every((f) => selectedFileIds.has(f.id));
  const allNotesSelected = notes.length > 0 && notes.every((n) => selectedNoteIds.has(n.id));
  const allItemsSelected = files.length + notes.length > 0 && allFilesSelected && allNotesSelected;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[60] flex flex-col animate-page-scale-in",
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
            "data-transition-target": "collections",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  className: "flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60",
                  style: { color: textColor },
                  "aria-label": "Back",
                  "data-ocid": "collections.close_button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 22 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  className: "flex-1 text-center font-semibold",
                  style: { fontSize: 18, color: textColor },
                  children: "Collections"
                }
              ),
              selectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: exitSelectionMode,
                  className: "text-sm font-medium active:opacity-60",
                  style: { color: isDark ? "#60A5FA" : "#2563EB" },
                  "data-ocid": "collections.cancel_button",
                  children: "Cancel"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: onUploadRequest,
                  className: "flex items-center justify-center rounded-full p-2 -mr-2 active:opacity-60",
                  style: { color: isDark ? "#60A5FA" : "#2563EB" },
                  "aria-label": "Upload",
                  "data-ocid": "collections.upload_button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 20 })
                }
              )
            ]
          }
        ),
        uploads.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "shrink-0 px-4 py-2",
            style: {
              background: isDark ? "oklch(0.16 0.02 260)" : "oklch(0.97 0.005 260)",
              borderBottom: `1px solid ${borderColor}`
            },
            "data-ocid": "collections.upload.loading_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: subTextColor }, children: activeUploads.length > 0 ? `Uploading ${uploadLabel}` : "Upload complete" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    style: {
                      fontSize: 12,
                      fontWeight: 600,
                      color: isDark ? "#FBBF24" : "#D97706"
                    },
                    children: [
                      totalProgress,
                      "%"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-full rounded-full overflow-hidden",
                  style: {
                    height: 3,
                    background: isDark ? "oklch(0.28 0.02 260)" : "oklch(0.88 0.005 260)"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-full transition-all duration-300 ease-out",
                      style: {
                        width: `${totalProgress}%`,
                        background: isDark ? "#FBBF24" : "#D97706",
                        borderRadius: 999
                      }
                    }
                  )
                }
              )
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
                  borderColor: amberColor,
                  borderTopColor: "transparent"
                }
              }
            ) }) : allItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex flex-col items-center justify-center h-full gap-3 px-8",
                "data-ocid": "collections.empty_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "svg",
                    {
                      width: "56",
                      height: "56",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: amberColor,
                      strokeWidth: "2.3",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      role: "img",
                      "aria-label": "Empty collections",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1.5", ry: "1.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1.5", ry: "1.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1.5", ry: "1.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1.5", ry: "1.5" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-center font-medium",
                      style: { color: textColor, fontSize: 16 },
                      children: "No items yet"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-center",
                      style: { color: subTextColor, fontSize: 14 },
                      children: "Upload files, create notes, or add links to see them here."
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
                    const isSelected2 = selectedFileIds.has(item.data.id);
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      FileThumbnail,
                      {
                        file: item.data,
                        selected: isSelected2,
                        selectionMode,
                        onTap: () => handleItemTap(item),
                        onLongPress: () => handleItemLongPress(item)
                      },
                      `file-${item.data.id}`
                    );
                  }
                  const isSelected = selectedNoteIds.has(item.data.id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    NoteThumbnail,
                    {
                      note: item.data,
                      selected: isSelected,
                      selectionMode,
                      onTap: () => handleItemTap(item),
                      onLongPress: () => handleItemLongPress(item)
                    },
                    `note-${item.data.id}`
                  );
                })
              }
            )
          }
        ),
        selectionMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "shrink-0 flex flex-col gap-2 px-4 py-3",
            style: {
              background: toolbarBg,
              borderTop: `1px solid ${borderColor}`,
              paddingBottom: "max(12px, env(safe-area-inset-bottom))"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: handleSelectAll,
                    className: "flex items-center gap-1.5 active:opacity-60",
                    style: {
                      color: isDark ? "#60A5FA" : "#2563EB",
                      fontSize: 14,
                      fontWeight: 500
                    },
                    "data-ocid": "collections.select_all_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 16 }),
                      allItemsSelected ? "Deselect All" : "Select All"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 13, color: subTextColor }, children: [
                  totalSelected,
                  " selected"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowMoveToMission(true),
                    disabled: totalSelected === 0,
                    className: "flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30",
                    style: { color: isDark ? "#A78BFA" : "#7C3AED", fontSize: 11 },
                    "data-ocid": "collections.batch.mission.button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 22 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mission" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowSendToFolder(true),
                    disabled: totalSelected === 0,
                    className: "flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30",
                    style: { color: isDark ? "#2DD4BF" : "#0D9488", fontSize: 11 },
                    "data-ocid": "collections.batch.folder.button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FolderInput, { size: 22 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Folder" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: handleShare,
                    disabled: totalSelected === 0,
                    className: "flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30",
                    style: {
                      color: isDark ? "oklch(0.75 0 0)" : "oklch(0.45 0 0)",
                      fontSize: 11
                    },
                    "data-ocid": "collections.batch.share.button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 22 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowDeleteConfirm(true),
                    disabled: totalSelected === 0,
                    className: "flex flex-col items-center gap-1 active:opacity-60 disabled:opacity-30",
                    style: { color: isDark ? "#F87171" : "#DC2626", fontSize: 11 },
                    "data-ocid": "collections.batch.delete_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 22 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delete" })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        showDeleteConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-2xl p-6 mx-6 flex flex-col gap-4",
            style: {
              background: isDark ? "oklch(0.2 0.02 260)" : "oklch(0.99 0 0)",
              maxWidth: 320,
              width: "100%"
            },
            "data-ocid": "collections.delete.dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "h2",
                {
                  className: "font-semibold text-center",
                  style: { fontSize: 17, color: textColor },
                  children: [
                    "Delete ",
                    totalSelected,
                    " item",
                    totalSelected !== 1 ? "s" : "",
                    "?"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-center",
                  style: { fontSize: 14, color: subTextColor },
                  children: "This action cannot be undone."
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowDeleteConfirm(false),
                    className: "flex-1 py-2.5 rounded-xl font-medium active:opacity-70",
                    style: {
                      background: isDark ? "oklch(0.28 0.02 260)" : "oklch(0.92 0 0)",
                      color: textColor,
                      fontSize: 15
                    },
                    "data-ocid": "collections.delete.cancel_button",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleDelete,
                    disabled: deleteFilesMutation.isPending || deleteNotesMutation.isPending,
                    className: "flex-1 py-2.5 rounded-xl font-medium active:opacity-70 disabled:opacity-60",
                    style: {
                      background: isDark ? "#DC2626" : "#EF4444",
                      color: "#fff",
                      fontSize: 15
                    },
                    "data-ocid": "collections.delete.confirm_button",
                    children: deleteFilesMutation.isPending || deleteNotesMutation.isPending ? "Deleting…" : "Delete"
                  }
                )
              ] })
            ]
          }
        ) }),
        showMoveToMission && /* @__PURE__ */ jsxRuntimeExports.jsx(
          MoveToMissionDialog,
          {
            open: showMoveToMission,
            onOpenChange: setShowMoveToMission,
            fileIds: selectedFileIdsArray,
            noteIds: selectedNoteIdsArray,
            onMoveComplete: () => {
              const movedFileIds = selectedFileIdsArray;
              const movedNoteIds = selectedNoteIdsArray.map(
                (id) => id.toString()
              );
              queryClient.setQueryData(
                ["collections-files"],
                (old) => old ? {
                  ...old,
                  files: old.files.filter(
                    (f) => !movedFileIds.includes(f.id)
                  )
                } : old
              );
              queryClient.setQueryData(
                ["collections-notes"],
                (old) => old ? {
                  ...old,
                  notes: old.notes.filter(
                    (n) => !movedNoteIds.includes(n.id)
                  )
                } : old
              );
              setShowMoveToMission(false);
              exitSelectionMode();
              queryClient.invalidateQueries({ queryKey: ["collections-files"] });
              queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
            }
          }
        ),
        showSendToFolder && /* @__PURE__ */ jsxRuntimeExports.jsx(
          SendToFolderDialog,
          {
            open: showSendToFolder,
            onOpenChange: setShowSendToFolder,
            fileIds: selectedFileIdsArray,
            noteIds: selectedNoteIdsArray,
            onMoveComplete: () => {
              const movedFileIds = selectedFileIdsArray;
              const movedNoteIds = selectedNoteIdsArray.map(
                (id) => id.toString()
              );
              queryClient.setQueryData(
                ["collections-files"],
                (old) => old ? {
                  ...old,
                  files: old.files.filter(
                    (f) => !movedFileIds.includes(f.id)
                  )
                } : old
              );
              queryClient.setQueryData(
                ["collections-notes"],
                (old) => old ? {
                  ...old,
                  notes: old.notes.filter(
                    (n) => !movedNoteIds.includes(n.id)
                  )
                } : old
              );
              setShowSendToFolder(false);
              exitSelectionMode();
              queryClient.invalidateQueries({ queryKey: ["collections-files"] });
              queryClient.invalidateQueries({ queryKey: ["collections-notes"] });
            }
          }
        ),
        fullScreenFile && /* @__PURE__ */ jsxRuntimeExports.jsx(
          FullScreenViewer,
          {
            files: files.filter((f) => !f.link),
            initialIndex: files.filter((f) => !f.link).findIndex((f) => f.id === fullScreenFile.id),
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
                        "data-ocid": "collections.note_viewer.close_button",
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
        ),
        fullScreenLink && /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
                        onClick: () => setFullScreenLink(null),
                        className: "flex items-center justify-center rounded-full p-2 -ml-2 active:opacity-60",
                        style: { color: textColor },
                        "aria-label": "Close",
                        "data-ocid": "collections.link_viewer.close_button",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 22 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "h1",
                      {
                        className: "flex-1 text-center font-semibold truncate px-2",
                        style: { fontSize: 17, color: textColor },
                        children: fullScreenLink.name
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 38 } })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-6 px-6", children: [
                getDomain(fullScreenLink.link) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: `https://www.google.com/s2/favicons?domain=${getDomain(fullScreenLink.link)}&sz=128`,
                    alt: "",
                    className: "w-16 h-16 object-contain rounded-xl",
                    onError: (e) => {
                      e.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-center text-sm break-all",
                    style: { color: subTextColor, maxWidth: 300 },
                    children: fullScreenLink.link
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      try {
                        window.open(
                          fullScreenLink.link,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } catch {
                      }
                    },
                    className: "flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold active:opacity-70",
                    style: { background: "#2563EB", color: "#fff", fontSize: 16 },
                    "data-ocid": "collections.link_viewer.open_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 18 }),
                      "Open Link"
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
export {
  CollectionsFullScreenView as default
};
