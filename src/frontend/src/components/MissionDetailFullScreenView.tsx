import type { FileMetadata, Mission, Note, Task } from "@/backend";
import MoveToMissionDialog from "@/components/MoveToMissionDialog";
import SendToFolderDialog from "@/components/SendToFolderDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBackendActor } from "@/contexts/ActorContext";
import { useMissionAutosave } from "@/hooks/useMissionAutosave";
import {
  useAddTaskToMission,
  useGetMission,
  useToggleTaskCompletion,
} from "@/hooks/useMissionsQueries";
import { useDeleteNotes, useGetNotesForMission } from "@/hooks/useNotesQueries";
import { useDeleteFiles, useGetFilesForMission } from "@/hooks/useQueries";
import { openExternally } from "@/utils/externalOpen";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Edit2,
  ExternalLink,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FullScreenViewer from "./FullScreenViewer";
import LinkOpenFallbackDialog from "./LinkOpenFallbackDialog";
import NoteViewerDialog from "./NoteViewerDialog";

interface MissionDetailFullScreenViewProps {
  missionId: bigint;
  onBack: () => void;
}

export default function MissionDetailFullScreenView({
  missionId,
  onBack,
}: MissionDetailFullScreenViewProps) {
  const [missionTitle, setMissionTitle] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [noteViewerOpen, setNoteViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Batch selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set(),
  );
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);

  const { status } = useBackendActor();
  const queryClient = useQueryClient();
  const { data: selectedMission, isLoading: isLoadingMission } =
    useGetMission(missionId);
  const {
    data: attachedFiles,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useGetFilesForMission(missionId);
  const {
    data: attachedNotes,
    isLoading: isLoadingNotes,
    refetch: refetchNotes,
  } = useGetNotesForMission(missionId);
  const toggleTaskMutation = useToggleTaskCompletion();
  const addTaskMutation = useAddTaskToMission();
  const deleteFilesMutation = useDeleteFiles();
  const deleteNotesMutation = useDeleteNotes();

  const isActorReady = status === "ready";

  // Derive tasks directly from React Query cache - single source of truth
  const tasks = selectedMission?.tasks ?? [];

  // Auto-save hook - disabled while mutations are in flight
  const autosaveEnabled =
    isHydrated &&
    isActorReady &&
    !addTaskMutation.isPending &&
    !toggleTaskMutation.isPending;
  const { isSaving, markAsHydrated, syncBaseline, flushPendingSave } =
    useMissionAutosave({
      missionId,
      title: missionTitle,
      tasks,
      enabled: autosaveEnabled,
    });

  // Hydrate local state from React Query cache on mount and when mission changes
  useEffect(() => {
    if (selectedMission) {
      setMissionTitle(selectedMission.title);
      setIsHydrated(false);
      // Mark as hydrated after a short delay to prevent initial save
      setTimeout(() => {
        markAsHydrated(selectedMission.title, selectedMission.tasks);
        setIsHydrated(true);
      }, 100);
    }
  }, [selectedMission, markAsHydrated]);

  // Flush pending autosave before navigating back
  const handleBack = async () => {
    await flushPendingSave(missionTitle, tasks);
    onBack();
  };

  const handleAddTask = async () => {
    const taskTextToAdd = newTaskText.trim();
    if (!taskTextToAdd || !isActorReady) return;

    try {
      await addTaskMutation.mutateAsync({
        missionId,
        task: taskTextToAdd,
      });

      setNewTaskText("");

      // Sync autosave baseline after mutation settles using latest cache state
      setTimeout(() => {
        const latestMission = queryClient.getQueryData<Mission | null>([
          "missions",
          "detail",
          missionId.toString(),
        ]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error("Failed to add task:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add task";
      toast.error(errorMessage);
    }
  };

  const handleToggleTask = async (taskId: bigint, newCompleted: boolean) => {
    if (!isActorReady) return;

    try {
      await toggleTaskMutation.mutateAsync({
        missionId,
        taskId,
        completed: newCompleted,
      });

      // Sync autosave baseline after mutation settles using latest cache state
      setTimeout(() => {
        const latestMission = queryClient.getQueryData<Mission | null>([
          "missions",
          "detail",
          missionId.toString(),
        ]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update task";
      toast.error(errorMessage);
    }
  };

  const handleFileClick = (index: number) => {
    if (selectionMode) {
      const file = attachedFiles?.[index];
      if (!file) return;
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        if (next.has(file.id)) next.delete(file.id);
        else next.add(file.id);
        return next;
      });
      return;
    }
    const file = attachedFiles?.[index];
    if (!file) return;

    if (file.link) {
      const url = file.link;
      openExternally(url)
        .then((opened) => {
          if (!opened) {
            setCurrentLinkUrl(url);
            setLinkFallbackOpen(true);
          }
        })
        .catch((error) => {
          console.error("Failed to open link:", error);
          setCurrentLinkUrl(url);
          setLinkFallbackOpen(true);
        });
    } else {
      setSelectedFileIndex(index);
      setViewerOpen(true);
    }
  };

  const handleNoteClick = (note: Note) => {
    if (selectionMode) {
      setSelectedNoteIds((prev) => {
        const next = new Set(prev);
        if (next.has(note.id)) next.delete(note.id);
        else next.add(note.id);
        return next;
      });
      return;
    }
    setSelectedNote(note);
    setNoteViewerOpen(true);
  };

  // Long press handlers for attachments
  const makeLongPressHandlers = (
    onLongPress: () => void,
    onClick: () => void,
  ) => {
    const touchMoved = { current: false };
    const touchStarted = { current: false };
    const longPressTimer: { current: ReturnType<typeof setTimeout> | null } = {
      current: null,
    };
    const didLongPress = { current: false };

    return {
      onTouchStart: () => {
        touchMoved.current = false;
        touchStarted.current = true;
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
          didLongPress.current = true;
          onLongPress();
        }, 500);
      },
      onTouchMove: () => {
        touchMoved.current = true;
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      },
      onTouchEnd: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (
          !touchMoved.current &&
          touchStarted.current &&
          !didLongPress.current
        ) {
          onClick();
        }
        touchStarted.current = false;
      },
      onTouchCancel: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        touchStarted.current = false;
      },
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    };
  };

  const handleRetryOpenLink = async () => {
    if (currentLinkUrl) {
      await openExternally(currentLinkUrl);
    }
  };

  const handleCopyLink = async () => {
    if (currentLinkUrl) {
      try {
        await navigator.clipboard.writeText(currentLinkUrl);
      } catch (error) {
        console.error("Failed to copy link:", error);
        toast.error("Failed to copy link");
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    if (mimeType === "application/pdf") return FileText;
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    )
      return FileText;
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    )
      return FileSpreadsheet;
    return FileIcon;
  };

  const completedTasks = tasks.filter((t: Task) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isLoading = isLoadingMission || isLoadingFiles || isLoadingNotes;

  const totalSelected = selectedFileIds.size + selectedNoteIds.size;
  const allFiles = attachedFiles ?? [];
  const allNotes = attachedNotes ?? [];
  const allAttachments = allFiles.length + allNotes.length;
  const allSelected = allAttachments > 0 && totalSelected === allAttachments;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFileIds(new Set());
      setSelectedNoteIds(new Set());
    } else {
      setSelectedFileIds(new Set(allFiles.map((f: FileMetadata) => f.id)));
      setSelectedNoteIds(new Set(allNotes.map((n: Note) => n.id)));
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedFileIds(new Set());
    setSelectedNoteIds(new Set());
  };

  const handleDeleteSelected = async () => {
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
    handleCancelSelection();
    refetchFiles();
    refetchNotes();
  };

  const handleShareSelected = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${totalSelected} item(s) from MYL` });
      } catch {
        // cancelled
      }
    }
  };

  const handleMoveComplete = () => {
    handleCancelSelection();
    refetchFiles();
    refetchNotes();
  };

  const startFileSelection = (file: FileMetadata) => {
    setSelectionMode(true);
    setSelectedFileIds(new Set([file.id]));
    setSelectedNoteIds(new Set());
  };

  const startNoteSelection = (note: Note) => {
    setSelectionMode(true);
    setSelectedNoteIds(new Set([note.id]));
    setSelectedFileIds(new Set());
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {isEditingTitle ? (
            <Input
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="flex-1 text-lg font-semibold"
              disabled={!isActorReady}
            />
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <h1 className="text-lg font-semibold truncate">
                {missionTitle || "Untitled Mission"}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingTitle(true)}
                disabled={!isActorReady}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {isSaving && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="text-muted-foreground">Loading mission...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Section */}
            {totalTasks > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {completedTasks} / {totalTasks} tasks
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Tasks Section */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tasks
              </h2>

              {/* Add Task Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTask();
                    }
                  }}
                  disabled={!isActorReady || addTaskMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTask}
                  disabled={
                    !isActorReady ||
                    !newTaskText.trim() ||
                    addTaskMutation.isPending
                  }
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Task List */}
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tasks yet. Add one above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task: Task) => (
                      <div
                        key={task.taskId.toString()}
                        className="flex items-start gap-3 group"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => {
                            const newCompleted = checked === true;
                            handleToggleTask(task.taskId, newCompleted);
                          }}
                          disabled={!isActorReady}
                          className="mt-1"
                        />
                        <span
                          className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.task}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Attachments
                </h2>
                {allAttachments > 0 && !selectionMode && (
                  <button
                    type="button"
                    onClick={() => setSelectionMode(true)}
                    className="text-xs font-medium"
                    style={{ color: "#7C3AED" }}
                    data-ocid="mission.selection.select_button"
                  >
                    Select
                  </button>
                )}
              </div>

              {/* Files */}
              {attachedFiles && attachedFiles.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    Files & Links
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {attachedFiles.map((file: FileMetadata, index: number) => {
                      const isLink = !!file.link;
                      const Icon = isLink
                        ? ExternalLink
                        : getFileIcon(file.mimeType);
                      const isImage =
                        !isLink && file.mimeType.startsWith("image/");
                      const isVideo =
                        !isLink && file.mimeType.startsWith("video/");
                      const isSelected = selectedFileIds.has(file.id);

                      const lp = makeLongPressHandlers(
                        () => startFileSelection(file),
                        () => handleFileClick(index),
                      );

                      return (
                        <button
                          type="button"
                          key={file.id}
                          onClick={() => handleFileClick(index)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleFileClick(index);
                            }
                          }}
                          onTouchStart={lp.onTouchStart}
                          onTouchMove={lp.onTouchMove}
                          onTouchEnd={lp.onTouchEnd}
                          onTouchCancel={lp.onTouchCancel}
                          onContextMenu={lp.onContextMenu}
                          className="group cursor-pointer relative text-left bg-transparent border-0 p-0 w-full"
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                          }}
                        >
                          <div
                            className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02]"
                            style={{
                              outline: isSelected
                                ? "2px solid #7C3AED"
                                : "none",
                              outlineOffset: 2,
                            }}
                          >
                            {isLink ? (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                              </div>
                            ) : isImage && file.blob ? (
                              <img
                                src={file.blob.getDirectURL()}
                                alt={file.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                draggable={false}
                              />
                            ) : isVideo && file.blob ? (
                              <video
                                src={file.blob.getDirectURL()}
                                className="h-full w-full object-cover"
                                preload="metadata"
                              >
                                <track kind="captions" />
                              </video>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Icon className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
                            {isLink && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                                <ExternalLink className="h-3 w-3" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1 right-1">
                                <CheckCircle2
                                  size={18}
                                  color="#7C3AED"
                                  fill="white"
                                />
                              </div>
                            )}
                          </div>
                          <p
                            className="mt-1.5 text-xs truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {attachedNotes && attachedNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    Notes
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {attachedNotes.map((note: Note) => {
                      const isSelected = selectedNoteIds.has(note.id);
                      const lp = makeLongPressHandlers(
                        () => startNoteSelection(note),
                        () => handleNoteClick(note),
                      );
                      return (
                        <button
                          type="button"
                          key={note.id.toString()}
                          onClick={() => handleNoteClick(note)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleNoteClick(note);
                            }
                          }}
                          onTouchStart={lp.onTouchStart}
                          onTouchMove={lp.onTouchMove}
                          onTouchEnd={lp.onTouchEnd}
                          onTouchCancel={lp.onTouchCancel}
                          onContextMenu={lp.onContextMenu}
                          className="group cursor-pointer relative text-left bg-transparent border-0 p-0 w-full"
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                          }}
                        >
                          <div
                            className="relative w-full aspect-square overflow-hidden rounded-lg bg-amber-50 dark:bg-amber-950/20 transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border border-amber-200 dark:border-amber-800"
                            style={{
                              outline: isSelected
                                ? "2px solid #7C3AED"
                                : "none",
                              outlineOffset: 2,
                            }}
                          >
                            <div className="flex h-full w-full items-center justify-center">
                              <StickyNote className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
                            {isSelected && (
                              <div className="absolute top-1 right-1">
                                <CheckCircle2
                                  size={18}
                                  color="#7C3AED"
                                  fill="white"
                                />
                              </div>
                            )}
                          </div>
                          <p
                            className="mt-1.5 text-xs truncate"
                            title={note.title}
                          >
                            {note.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!attachedFiles || attachedFiles.length === 0) &&
                (!attachedNotes || attachedNotes.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No attachments yet
                  </p>
                )}
            </div>
          </div>
        )}
      </main>

      {/* Batch selection toolbar */}
      {selectionMode && (
        <div
          className="fixed left-0 right-0 z-[70] flex flex-col"
          style={{
            bottom: 0,
            background: "var(--background)",
            borderTop: "1px solid var(--border)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Select All / Count row */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm font-semibold"
              style={{ color: "#7C3AED" }}
              data-ocid="mission.select_all.button"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-muted-foreground">
              {totalSelected} selected
            </span>
            <button
              type="button"
              onClick={handleCancelSelection}
              className="text-sm text-muted-foreground"
              data-ocid="mission.selection.cancel_button"
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
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              data-ocid="mission.selection.mission_button"
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#7C3AED" }}
              >
                Mission
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={() => setFolderDialogOpen(true)}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              data-ocid="mission.selection.folder_button"
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#0D9488" }}
              >
                Folder
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={handleShareSelected}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              data-ocid="mission.selection.share_button"
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#2563EB" }}
              >
                Share
              </span>
            </button>
            <button
              type="button"
              disabled={totalSelected === 0}
              onClick={handleDeleteSelected}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              data-ocid="mission.selection.delete_button"
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#EF4444" }}
              >
                Delete
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Viewer */}
      {viewerOpen && attachedFiles && attachedFiles.length > 0 && (
        <FullScreenViewer
          files={attachedFiles}
          initialIndex={selectedFileIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Note Viewer Dialog */}
      {noteViewerOpen && selectedNote && (
        <NoteViewerDialog
          note={selectedNote}
          open={noteViewerOpen}
          onOpenChange={(open) => {
            setNoteViewerOpen(open);
            if (!open) {
              setSelectedNote(null);
            }
          }}
        />
      )}

      {/* Link Fallback Dialog */}
      <LinkOpenFallbackDialog
        open={linkFallbackOpen}
        onOpenChange={setLinkFallbackOpen}
        linkUrl={currentLinkUrl}
        onRetryOpen={handleRetryOpenLink}
        onCopyLink={handleCopyLink}
      />

      {/* Send to Folder dialog */}
      <SendToFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        fileIds={Array.from(selectedFileIds)}
        noteIds={Array.from(selectedNoteIds).map((id) => BigInt(id))}
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
    </div>
  );
}
