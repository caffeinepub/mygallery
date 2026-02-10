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
import { toast } from 'sonner';
import FullScreenViewer from './FullScreenViewer';
import NoteViewerDialog from './NoteViewerDialog';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { openExternally } from '@/utils/externalOpen';
import type { Task, FileMetadata, Note } from '@/backend';

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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const { status } = useBackendActor();
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
    debounceMs: 800,
    enabled: autosaveEnabled,
  });

  // Load selected mission data when mission changes or loads
  useEffect(() => {
    if (selectedMission) {
      setMissionTitle(selectedMission.title);
      setIsEditingTitle(false);
      
      // Mark as hydrated and set the baseline for autosave
      markAsHydrated(selectedMission.title, selectedMission.tasks);
      setIsHydrated(true);
    }
  }, [selectedMission, markAsHydrated]);

  // Reset hydration state when mission ID changes
  useEffect(() => {
    setIsHydrated(false);
  }, [missionId]);

  // Sync autosave baseline after add-task mutation settles
  useEffect(() => {
    if (addTaskMutation.isSuccess && selectedMission && isHydrated) {
      syncBaseline(selectedMission.title, selectedMission.tasks);
    }
  }, [addTaskMutation.isSuccess, selectedMission, isHydrated, syncBaseline]);

  // Sync autosave baseline after toggle-task mutation settles
  useEffect(() => {
    if (toggleTaskMutation.isSuccess && selectedMission && isHydrated) {
      syncBaseline(selectedMission.title, selectedMission.tasks);
    }
  }, [toggleTaskMutation.isSuccess, selectedMission, isHydrated, syncBaseline]);

  const handleAddTask = async () => {
    const taskTextToAdd = newTaskText.trim();
    if (!taskTextToAdd) return;

    try {
      await addTaskMutation.mutateAsync({
        missionId,
        task: taskTextToAdd,
      });
      setNewTaskText('');
    } catch (error) {
      console.error('Failed to add task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      toast.error(errorMessage);
    }
  };

  const handleToggleTask = async (taskId: bigint, currentCompleted: boolean) => {
    try {
      await toggleTaskMutation.mutateAsync({
        missionId,
        taskId,
        completed: !currentCompleted,
      });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task';
      toast.error(errorMessage);
    }
  };

  const handleBack = async () => {
    // Flush any pending autosave before navigating away
    await flushPendingSave(missionTitle, tasks);
    onBack();
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  };

  const handleFileClick = (index: number) => {
    setSelectedFileIndex(index);
    setViewerOpen(true);
  };

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    setNoteViewerOpen(true);
  };

  const handleLinkClick = async (url: string) => {
    try {
      await openExternally(url);
    } catch (error) {
      console.error('Failed to open link:', error);
      setCurrentLinkUrl(url);
      setLinkFallbackOpen(true);
    }
  };

  const handleRetryOpenLink = async () => {
    try {
      await openExternally(currentLinkUrl);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentLinkUrl);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const selectedNote = attachedNotes?.find((n) => n.id === selectedNoteId) ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 mx-4">
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
              className="text-lg font-semibold"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold truncate">{missionTitle}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingTitle(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {isSaving && (
          <div className="text-xs text-muted-foreground">Saving...</div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {completedTasks} / {totalTasks} tasks
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Tasks</h2>
            
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
              />
              <Button
                size="icon"
                onClick={handleAddTask}
                disabled={!isActorReady || !newTaskText.trim() || addTaskMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {isLoadingMission ? (
                <div className="text-sm text-muted-foreground">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-sm text-muted-foreground">No tasks yet. Add one above!</div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.taskId.toString()}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        handleToggleTask(task.taskId, task.completed);
                      }}
                      disabled={!isActorReady || toggleTaskMutation.isPending}
                    />
                    <span
                      className={`flex-1 ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.task}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Attachments</h2>
            
            {isLoadingFiles || isLoadingNotes ? (
              <div className="text-sm text-muted-foreground">Loading attachments...</div>
            ) : (attachedFiles?.length ?? 0) === 0 && (attachedNotes?.length ?? 0) === 0 ? (
              <div className="text-sm text-muted-foreground">
                No attachments yet. Use the "Send to Mission" option from the main gallery.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {/* Files */}
                {attachedFiles?.map((file, index) => {
                  const isLink = !!file.link;
                  const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
                  const isImage = !isLink && file.mimeType.startsWith('image/');
                  const isVideo = !isLink && file.mimeType.startsWith('video/');

                  return (
                    <div
                      key={file.id}
                      className="group cursor-pointer relative"
                      onClick={() => {
                        if (isLink && file.link) {
                          handleLinkClick(file.link);
                        } else {
                          handleFileClick(index);
                        }
                      }}
                    >
                      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02]">
                        {isLink ? (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : isImage && file.blob ? (
                          <img
                            src={file.blob.getDirectURL()}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : isVideo && file.blob ? (
                          <video
                            src={file.blob.getDirectURL()}
                            className="h-full w-full object-cover"
                            preload="metadata"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {isLink && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs truncate" title={file.name}>
                        {file.name}
                      </p>
                    </div>
                  );
                })}

                {/* Notes */}
                {attachedNotes?.map((note) => (
                  <div
                    key={note.id}
                    className="group cursor-pointer relative"
                    onClick={() => handleNoteClick(note.id)}
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 transition-all duration-150 hover:shadow-lg hover:scale-[1.02] p-3 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100 line-clamp-3 flex-1">
                        {note.title}
                      </p>
                    </div>
                    <p className="mt-1 text-xs truncate text-amber-700 dark:text-amber-300" title={note.title}>
                      {note.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Viewers */}
      {viewerOpen && attachedFiles && attachedFiles.length > 0 && (
        <FullScreenViewer
          files={attachedFiles}
          initialIndex={selectedFileIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {noteViewerOpen && selectedNote && (
        <NoteViewerDialog
          note={selectedNote}
          open={noteViewerOpen}
          onOpenChange={setNoteViewerOpen}
        />
      )}

      {linkFallbackOpen && (
        <LinkOpenFallbackDialog
          linkUrl={currentLinkUrl}
          open={linkFallbackOpen}
          onOpenChange={setLinkFallbackOpen}
          onRetryOpen={handleRetryOpenLink}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  );
}
