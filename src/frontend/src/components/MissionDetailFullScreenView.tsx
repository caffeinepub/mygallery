import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink, Trash2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetMission, useToggleTaskCompletion, useAddTaskToMission } from '@/hooks/useMissionsQueries';
import { useGetFilesForMission } from '@/hooks/useQueries';
import { useGetNotesForMission } from '@/hooks/useNotesQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { useMissionAutosave } from '@/hooks/useMissionAutosave';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FullScreenViewer from './FullScreenViewer';
import NoteViewerDialog from './NoteViewerDialog';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { openExternally } from '@/utils/externalOpen';
import type { Task, FileMetadata, Note, Mission } from '@/backend';

interface MissionDetailFullScreenViewProps {
  missionId: bigint;
  onBack: () => void;
}

export default function MissionDetailFullScreenView({
  missionId,
  onBack,
}: MissionDetailFullScreenViewProps) {
  const [missionTitle, setMissionTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [noteViewerOpen, setNoteViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const { status } = useBackendActor();
  const queryClient = useQueryClient();
  const { data: selectedMission, isLoading: isLoadingMission } = useGetMission(missionId);
  const { data: attachedFiles, isLoading: isLoadingFiles } = useGetFilesForMission(missionId);
  const { data: attachedNotes, isLoading: isLoadingNotes } = useGetNotesForMission(missionId);
  const toggleTaskMutation = useToggleTaskCompletion();
  const addTaskMutation = useAddTaskToMission();

  const isActorReady = status === 'ready';

  // Derive tasks directly from React Query cache - single source of truth
  const tasks = selectedMission?.tasks ?? [];

  // Auto-save hook - disabled while mutations are in flight
  const autosaveEnabled = isHydrated && isActorReady && !addTaskMutation.isPending && !toggleTaskMutation.isPending;
  const { isSaving, markAsHydrated, syncBaseline, flushPendingSave } = useMissionAutosave({
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

      setNewTaskText('');

      // Sync autosave baseline after mutation settles using latest cache state
      setTimeout(() => {
        const latestMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to add task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
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
        const latestMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to toggle task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      toast.error(errorMessage);
    }
  };

  const handleFileClick = (index: number) => {
    const file = attachedFiles?.[index];
    if (!file) return;

    if (file.link) {
      // Handle link click
      const url = file.link;
      openExternally(url)
        .then((opened) => {
          if (!opened) {
            setCurrentLinkUrl(url);
            setLinkFallbackOpen(true);
          }
        })
        .catch((error) => {
          console.error('Failed to open link:', error);
          setCurrentLinkUrl(url);
          setLinkFallbackOpen(true);
        });
    } else {
      // Handle file click - open in viewer
      setSelectedFileIndex(index);
      setViewerOpen(true);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setNoteViewerOpen(true);
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
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isLoading = isLoadingMission || isLoadingFiles || isLoadingNotes;

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
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="flex-1 text-lg font-semibold"
              disabled={!isActorReady}
            />
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <h1 className="text-lg font-semibold truncate">{missionTitle || 'Untitled Mission'}</h1>
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
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
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
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tasks</h2>
              
              {/* Add Task Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask();
                    }
                  }}
                  disabled={!isActorReady || addTaskMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!isActorReady || !newTaskText.trim() || addTaskMutation.isPending}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Task List */}
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tasks yet. Add one above!</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.taskId.toString()} className="flex items-start gap-3 group">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => {
                            // Use the checked value directly from Checkbox (already the next state)
                            const newCompleted = checked === true;
                            handleToggleTask(task.taskId, newCompleted);
                          }}
                          disabled={!isActorReady}
                          className="mt-1"
                        />
                        <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
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
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Attachments</h2>
              
              {/* Files */}
              {attachedFiles && attachedFiles.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Files & Links</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {attachedFiles.map((file, index) => {
                      const isLink = !!file.link;
                      const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
                      const isImage = !isLink && file.mimeType.startsWith('image/');
                      const isVideo = !isLink && file.mimeType.startsWith('video/');

                      return (
                        <div
                          key={file.id}
                          onClick={() => handleFileClick(index)}
                          className="group cursor-pointer relative"
                        >
                          <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02]">
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
                              />
                            ) : isVideo && file.blob ? (
                              <video src={file.blob.getDirectURL()} className="h-full w-full object-cover" preload="metadata" />
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
                          </div>
                          <p className="mt-1.5 text-xs truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {attachedNotes && attachedNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Notes</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {attachedNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleNoteClick(note)}
                        className="group cursor-pointer relative"
                      >
                        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-amber-50 dark:bg-amber-950/20 transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border border-amber-200 dark:border-amber-800">
                          <div className="flex h-full w-full items-center justify-center">
                            <StickyNote className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
                        </div>
                        <p className="mt-1.5 text-xs truncate" title={note.title}>
                          {note.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!attachedFiles || attachedFiles.length === 0) && (!attachedNotes || attachedNotes.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No attachments yet</p>
              )}
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
}
