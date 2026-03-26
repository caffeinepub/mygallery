import { h as createLucideIcon, T as useListMissions, ag as useMoveFilesToMission, ah as useMoveNotesToMission, j as jsxRuntimeExports, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, ai as Card, aj as CardContent, B as Button, g as ue, c as useGetFolders, ak as useMoveFilesToFolder, al as useBatchRemoveFromFolder, am as useMoveNotesToFolder, an as useBatchRemoveNotesFromFolder, ao as perfDiag, r as reactExports, ap as useDeleteFile, X } from "./index-CGa9ZUh4.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$a = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$a);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$9);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$8);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$7);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  [
    "path",
    {
      d: "M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1",
      key: "fm4g5t"
    }
  ],
  ["path", { d: "M2 13h10", key: "pgb2dq" }],
  ["path", { d: "m9 16 3-3-3-3", key: "6m91ic" }]
];
const FolderInput = createLucideIcon("folder-input", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Target = createLucideIcon("target", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
function openExternally(url) {
  return new Promise((resolve) => {
    try {
      let resolved = false;
      let visibilityChanged = false;
      let blurOccurred = false;
      const handleVisibilityChange = () => {
        if (document.hidden) {
          visibilityChanged = true;
        }
      };
      const handleBlur = () => {
        blurOccurred = true;
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("pagehide", handleVisibilityChange);
      const cleanup = () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("pagehide", handleVisibilityChange);
      };
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        setTimeout(() => {
          cleanup();
          if (!resolved) {
            resolved = true;
            resolve(visibilityChanged || blurOccurred);
          }
        }, 150);
      } else {
        setTimeout(() => {
          cleanup();
          if (!resolved) {
            resolved = true;
            resolve(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to open external window:", error);
      resolve(false);
    }
  });
}
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
function downloadNoteAsText(title, body) {
  const content = `${title}

${body}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
async function shareNote(title, body) {
  if (!navigator.share) {
    return false;
  }
  try {
    await navigator.share({
      title,
      text: body
    });
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      return true;
    }
    console.error("Share failed:", error);
    return false;
  }
}
function getFileCategory(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword" || mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel" || mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || mimeType === "application/vnd.ms-powerpoint") {
    return "office";
  }
  return "unsupported";
}
function MoveToMissionDialog({
  open,
  onOpenChange,
  fileIds,
  noteIds = [],
  onMoveComplete
}) {
  const { data: missions, isLoading } = useListMissions();
  const moveFilesToMission = useMoveFilesToMission();
  const moveNotesToMission = useMoveNotesToMission();
  const handleMoveToMission = async (missionId) => {
    try {
      if (fileIds.length > 0) {
        await moveFilesToMission.mutateAsync({ fileIds, missionId });
      }
      if (noteIds.length > 0) {
        await moveNotesToMission.mutateAsync({ noteIds, missionId });
      }
      const totalCount = fileIds.length + noteIds.length;
      ue.success(
        `Moved ${totalCount} ${totalCount === 1 ? "item" : "items"} to mission`
      );
      onOpenChange(false);
      onMoveComplete == null ? void 0 : onMoveComplete();
    } catch (error) {
      console.error("Move to mission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to move items to mission";
      ue.error(errorMessage);
    }
  };
  const isProcessing = moveFilesToMission.isPending || moveNotesToMission.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (newOpen) => {
        if (!newOpen && isProcessing) {
          return;
        }
        onOpenChange(newOpen);
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[70vh] flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Move to mission" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading missions..." }) : !missions || missions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-muted p-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-8 w-8 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No missions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Create a mission first" })
        ] }) }) : missions.map((mission) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `cursor-pointer transition-all hover:shadow-md hover:border-missions-accent ${isProcessing ? "opacity-50 pointer-events-none" : ""}`,
            onClick: () => !isProcessing && handleMoveToMission(mission.id),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-missions-accent/10 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-missions-accent" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: mission.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  mission.tasks.length,
                  " ",
                  mission.tasks.length === 1 ? "task" : "tasks"
                ] })
              ] })
            ] }) })
          },
          mission.id.toString()
        )) }),
        isProcessing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent" }),
          "Moving items..."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => onOpenChange(false),
            className: "w-full",
            disabled: isProcessing,
            children: "Cancel"
          }
        ) })
      ] })
    }
  );
}
function SendToFolderDialog({
  open,
  onOpenChange,
  fileIds,
  noteIds = [],
  currentFolderId,
  onMoveComplete
}) {
  const { data: folders, isLoading } = useGetFolders();
  const moveFilesToFolder = useMoveFilesToFolder();
  const batchRemoveFromFolder = useBatchRemoveFromFolder();
  const moveNotesToFolder = useMoveNotesToFolder();
  const batchRemoveNotesFromFolder = useBatchRemoveNotesFromFolder();
  const handleMoveToFolder = async (folderId) => {
    const operationId = `move-to-folder-${Date.now()}`;
    perfDiag.startTiming(operationId, "Move to folder (UI)", {
      fileCount: fileIds.length,
      noteCount: noteIds.length
    });
    try {
      if (fileIds.length > 0) {
        await moveFilesToFolder.mutateAsync({ fileIds, folderId });
      }
      if (noteIds.length > 0) {
        await moveNotesToFolder.mutateAsync({ noteIds, folderId });
      }
      perfDiag.endTiming(operationId, { success: true });
      onOpenChange(false);
      onMoveComplete == null ? void 0 : onMoveComplete();
    } catch (error) {
      perfDiag.endTiming(operationId, { success: false });
      console.error("Move to folder error:", error);
    }
  };
  const handleReturnToMain = async () => {
    const operationId = `return-to-main-${Date.now()}`;
    perfDiag.startTiming(operationId, "Return to main collection (UI)", {
      fileCount: fileIds.length,
      noteCount: noteIds.length
    });
    try {
      if (fileIds.length > 0) {
        await batchRemoveFromFolder.mutateAsync({
          fileIds,
          sourceFolderId: currentFolderId
        });
      }
      if (noteIds.length > 0) {
        await batchRemoveNotesFromFolder.mutateAsync({ noteIds });
      }
      perfDiag.endTiming(operationId, { success: true });
      onOpenChange(false);
      onMoveComplete == null ? void 0 : onMoveComplete();
    } catch (error) {
      perfDiag.endTiming(operationId, { success: false });
      console.error("Return to main error:", error);
    }
  };
  const isProcessing = moveFilesToFolder.isPending || batchRemoveFromFolder.isPending || moveNotesToFolder.isPending || batchRemoveNotesFromFolder.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: isProcessing ? void 0 : onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[70vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Move to Folder" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto space-y-2", children: [
      currentFolderId !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: `transition-all ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-primary"}`,
          onClick: isProcessing ? void 0 : handleReturnToMain,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/10 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Main Collection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Return to main collection" })
            ] })
          ] }) })
        }
      ),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading folders..." }) : !folders || folders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-muted p-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-8 w-8 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No folders" })
      ] }) }) : folders.filter((folder) => folder.id !== currentFolderId).map((folder) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: `transition-all ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-primary"}`,
          onClick: isProcessing ? void 0 : () => handleMoveToFolder(folder.id),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/10 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: folder.name }) })
          ] }) })
        },
        folder.id.toString()
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        onClick: () => onOpenChange(false),
        className: "w-full",
        disabled: isProcessing,
        children: "Cancel"
      }
    ) })
  ] }) });
}
function FullScreenViewer({
  files,
  initialIndex,
  open,
  onOpenChange
}) {
  var _a;
  const [currentIndex, setCurrentIndex] = reactExports.useState(initialIndex);
  const [sendToFolderOpen, setSendToFolderOpen] = reactExports.useState(false);
  const [moveToMissionOpen, setMoveToMissionOpen] = reactExports.useState(false);
  const [touchStart, setTouchStart] = reactExports.useState(null);
  const [touchEnd, setTouchEnd] = reactExports.useState(null);
  const deleteFile = useDeleteFile();
  const currentFile = files[currentIndex];
  reactExports.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  const handlePrevious = reactExports.useCallback(() => {
    setCurrentIndex((prev) => prev > 0 ? prev - 1 : files.length - 1);
  }, [files.length]);
  const handleNext = reactExports.useCallback(() => {
    setCurrentIndex((prev) => prev < files.length - 1 ? prev + 1 : 0);
  }, [files.length]);
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };
  const handleDownload = async () => {
    if (!currentFile || !currentFile.blob) return;
    try {
      await downloadFile(currentFile.blob.getDirectURL(), currentFile.name);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const handleDelete = async () => {
    if (!currentFile) return;
    try {
      await deleteFile.mutateAsync(currentFile.id);
      if (files.length === 1) {
        onOpenChange(false);
      } else {
        if (currentIndex >= files.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
  const handleShare = async () => {
    if (!currentFile || !currentFile.blob) return;
    if (!navigator.share) {
      console.log("Web Share API not supported");
      return;
    }
    try {
      const response = await fetch(currentFile.blob.getDirectURL());
      const blob = await response.blob();
      const file = new File([blob], currentFile.name, {
        type: currentFile.mimeType
      });
      await navigator.share({
        title: currentFile.name,
        files: [file]
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing file:", error);
      }
    }
  };
  const handleSendToFolder = () => {
    setSendToFolderOpen(true);
  };
  const handleMoveToMission = () => {
    setMoveToMissionOpen(true);
  };
  const handleMoveComplete = () => {
    if (files.length === 1) {
      onOpenChange(false);
    } else {
      if (currentIndex >= files.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };
  reactExports.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrevious, handleNext, onOpenChange]);
  if (!currentFile) return null;
  const fileCategory = getFileCategory(currentFile.mimeType);
  const fileUrl = ((_a = currentFile.blob) == null ? void 0 : _a.getDirectURL()) || "";
  const canShare = "share" in navigator;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContent,
      {
        className: "max-w-full max-h-full w-screen h-screen p-0 bg-black/95 border-0",
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-white text-lg font-medium truncate flex-1 pr-4", children: currentFile.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => onOpenChange(false),
                className: "text-white hover:bg-white/20 shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center justify-center overflow-hidden", children: [
            fileCategory === "image" && currentFile.blob && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: fileUrl,
                alt: currentFile.name,
                className: "max-w-full max-h-full object-contain"
              }
            ),
            fileCategory === "video" && currentFile.blob && /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: fileUrl, controls: true, className: "max-w-full max-h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" }) }),
            fileCategory === "pdf" && currentFile.blob && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "iframe",
              {
                src: fileUrl,
                className: "w-full h-full border-0 bg-white",
                title: currentFile.name
              }
            ) }),
            fileCategory === "office" && currentFile.blob && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "iframe",
              {
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`,
                className: "w-full h-full border-0 bg-white",
                title: currentFile.name
              }
            ) }),
            fileCategory === "unsupported" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white text-center space-y-4 p-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium", children: "Preview not available" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/70", children: "This file type cannot be previewed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 justify-center pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleDownload,
                  variant: "default",
                  className: "bg-white text-black hover:bg-white/90",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
                    "Download"
                  ]
                }
              ) })
            ] })
          ] }),
          files.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: handlePrevious,
                className: "absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-8 w-8" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: handleNext,
                className: "absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-8 w-8" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleDownload,
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
                    "Download"
                  ]
                }
              ),
              canShare && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleShare,
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "mr-2 h-4 w-4" }),
                    "Share"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleSendToFolder,
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FolderInput, { className: "mr-2 h-4 w-4" }),
                    "Folder"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleMoveToMission,
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4" }),
                    "Mission"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: handleDelete,
                  variant: "ghost",
                  size: "sm",
                  className: "text-red-400 hover:bg-white/20",
                  disabled: deleteFile.isPending,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete"
                  ]
                }
              )
            ] }),
            files.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-white/70 text-sm mt-2", children: [
              currentIndex + 1,
              " / ",
              files.length
            ] })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SendToFolderDialog,
      {
        open: sendToFolderOpen,
        onOpenChange: setSendToFolderOpen,
        fileIds: [currentFile.id],
        currentFolderId: currentFile.folderId,
        onMoveComplete: handleMoveComplete
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MoveToMissionDialog,
      {
        open: moveToMissionOpen,
        onOpenChange: setMoveToMissionOpen,
        fileIds: [currentFile.id],
        onMoveComplete: handleMoveComplete
      }
    )
  ] });
}
export {
  ArrowLeft as A,
  Download as D,
  FullScreenViewer as F,
  MoveToMissionDialog as M,
  Share2 as S,
  Target as T,
  FileText as a,
  Folder as b,
  FolderInput as c,
  Trash2 as d,
  downloadNoteAsText as e,
  SendToFolderDialog as f,
  openExternally as o,
  shareNote as s
};
