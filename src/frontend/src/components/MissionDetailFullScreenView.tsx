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

  // Auto-save hook - only enabled after mission data is hydrated
  const { isSaving, markAsHydrated, flushPendingSave } = useMissionAutosave({
    missionId,
    title: missionTitle,
    tasks,
    debounceMs: 800,
    enabled: isHydrated && isActorReady,
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

  const calculateProgress = (missionTasks: Task[]) => {
    if (missionTasks.length === 0) return 0;
    const completed = missionTasks.filter(t => t.completed).length;
    return (completed / missionTasks.length) * 100;
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || addTaskMutation.isPending) return;
    
    const taskTextToAdd = newTaskText.trim();
    
    // Clear input immediately for better UX
    setNewTaskText('');
    
    // Save to backend - React Query optimistic updates will drive UI changes
    addTaskMutation.mutate({
      missionId,
      taskText: taskTextToAdd,
    }, {
      onError: (error) => {
        console.error('Failed to add task:', error);
        toast.error('Failed to add task');
        // Restore the input text on error so user can retry
        setNewTaskText(taskTextToAdd);
      },
    });
  };

  const handleToggleTask = (taskId: bigint) => {
    // Find the task to get its current completion state
    const currentTask = tasks.find(t => t.taskId.toString() === taskId.toString());
    if (!currentTask) return;

    const newCompletedState = !currentTask.completed;

    // Fire mutation - React Query handles optimistic updates and rollback
    toggleTaskMutation.mutate({
      missionId,
      taskId,
      completed: newCompletedState,
    }, {
      onError: (error) => {
        console.error('Failed to toggle task:', error);
        toast.error('Failed to update task');
      },
    });
  };

  const handleRemoveTask = (taskId: bigint) => {
    // Remove task from local state for autosave to pick up
    const updatedTasks = tasks.filter(t => t.taskId.toString() !== taskId.toString());
    // Trigger autosave by updating title (no-op) which will save the filtered tasks
    setMissionTitle(missionTitle);
  };

  const handleBack = async () => {
    // Flush any pending saves before navigating away
    await flushPendingSave(missionTitle, tasks);
    onBack();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return FileText;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') return FileSpreadsheet;
    return FileIcon;
  };

  const handleAttachmentClick = (file: FileMetadata, blobIndex: number) => {
    // Handle link items - open externally
    if (file.link) {
      const opened = openExternally(file.link);
      if (!opened) {
        setCurrentLinkUrl(file.link);
        setLinkFallbackOpen(true);
      }
      return;
    }

    // Handle file items with blobs - open in viewer
    if (file.blob) {
      setSelectedFileIndex(blobIndex);
      setViewerOpen(true);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNoteId(note.id);
    setNoteViewerOpen(true);
  };

  const handleRetryOpenLink = () => {
    if (currentLinkUrl) {
      openExternally(currentLinkUrl);
    }
  };

  const handleCopyLink = async () => {
    if (currentLinkUrl && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentLinkUrl);
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const progress = calculateProgress(tasks);
  const filesWithBlobs = attachedFiles?.filter(f => f.blob) || [];
  const selectedNote = attachedNotes?.find(n => n.id === selectedNoteId) ?? null;

  if (isLoadingMission) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading mission...</div>
      </div>
    );
  }

  if (!selectedMission) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Mission not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
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
            />
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <h1 className="flex-1 truncate text-lg font-semibold text-foreground">
                {missionTitle}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingTitle(true)}
                className="shrink-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="border-b border-border bg-muted/30 px-4 py-1 text-center text-xs text-muted-foreground">
            Saving...
          </div>
        )}

        {/* Progress bar */}
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4">
            {/* Tasks Section */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tasks
              </h2>
              
              {/* Task List */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.taskId.toString()}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.taskId)}
                      className="shrink-0"
                      disabled={toggleTaskMutation.isPending}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {task.task}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTask(task.taskId)}
                      className="shrink-0 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Task Input */}
              <div className="flex gap-2">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !addTaskMutation.isPending) {
                      handleAddTask();
                    }
                  }}
                  placeholder="Add a new task..."
                  className="flex-1"
                  disabled={addTaskMutation.isPending}
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim() || addTaskMutation.isPending}
                  size="icon"
                  className="shrink-0"
                >
                  {addTaskMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Attachments Section */}
            {((attachedFiles && attachedFiles.length > 0) || (attachedNotes && attachedNotes.length > 0)) && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Attachments
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {attachedFiles?.map((file, index) => {
                    const Icon = file.link ? ExternalLink : getFileIcon(file.mimeType);
                    const blobIndex = filesWithBlobs.findIndex(f => f.id === file.id);
                    
                    return (
                      <button
                        key={file.id}
                        onClick={() => handleAttachmentClick(file, blobIndex)}
                        className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                      >
                        <Icon className="h-8 w-8 text-muted-foreground" />
                        <span className="w-full truncate text-center text-xs text-foreground">
                          {file.name}
                        </span>
                      </button>
                    );
                  })}
                  {attachedNotes?.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                    >
                      <StickyNote className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      <span className="w-full truncate text-center text-xs text-foreground">
                        {note.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Full Screen Viewer */}
      {viewerOpen && filesWithBlobs.length > 0 && (
        <FullScreenViewer
          files={filesWithBlobs}
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
          onOpenChange={setNoteViewerOpen}
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
    </>
  );
}
