import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Edit2, FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetMission, useToggleTaskCompletion } from '@/hooks/useMissionsQueries';
import { useGetFilesForMission } from '@/hooks/useQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { useMissionAutosave } from '@/hooks/useMissionAutosave';
import { toast } from 'sonner';
import FullScreenViewer from './FullScreenViewer';
import LinkOpenFallbackDialog from './LinkOpenFallbackDialog';
import { openExternally } from '@/utils/externalOpen';
import type { Task, FileMetadata } from '@/backend';

interface MissionDetailFullScreenViewProps {
  missionId: bigint;
  onBack: () => void;
}

export default function MissionDetailFullScreenView({
  missionId,
  onBack,
}: MissionDetailFullScreenViewProps) {
  const [missionTitle, setMissionTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const { status } = useBackendActor();
  const { data: selectedMission, isLoading: isLoadingMission } = useGetMission(missionId);
  const { data: attachedFiles, isLoading: isLoadingFiles } = useGetFilesForMission(missionId);
  const toggleTaskMutation = useToggleTaskCompletion();

  const isActorReady = status === 'ready';

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
      setTasks(selectedMission.tasks);
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
    if (!newTaskText.trim()) return;
    
    // Find the highest taskId and increment
    const maxTaskId = tasks.length > 0 
      ? tasks.reduce((max, t) => t.taskId > max ? t.taskId : max, BigInt(0))
      : BigInt(-1);
    
    const newTask: Task = {
      taskId: maxTaskId + BigInt(1),
      task: newTaskText.trim(),
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: bigint) => {
    // Optimistically update UI immediately
    const updatedTasks = tasks.map(t => 
      t.taskId.toString() === taskId.toString() ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    
    // Find the task to get its new completion state
    const toggledTask = updatedTasks.find(t => t.taskId.toString() === taskId.toString());
    if (!toggledTask) return;

    // Fire background save without awaiting - this ensures immediate persistence
    // without blocking the UI or navigation
    // Error handling is done in the mutation's onError callback
    toggleTaskMutation.mutate({
      missionId,
      taskId,
      completed: toggledTask.completed,
    });
  };

  const handleRemoveTask = (taskId: bigint) => {
    setTasks(tasks.filter(t => t.taskId.toString() !== taskId.toString()));
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
  const isCompleted = tasks.length > 0 && progress === 100;

  // Filter files with blobs for the viewer (exclude links)
  const viewableFiles = attachedFiles?.filter(f => f.blob) || [];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-missions-bg shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {isEditingTitle ? (
              <Input
                placeholder="Mission title..."
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                disabled={!isActorReady}
                className="text-xl font-bold border-0 focus-visible:ring-1 shadow-none px-2 flex-1"
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setIsEditingTitle(false);
                  }
                  if (e.key === 'Escape') {
                    setMissionTitle(selectedMission?.title || '');
                    setIsEditingTitle(false);
                  }
                }}
              />
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{missionTitle || 'Untitled Mission'}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                  disabled={!isActorReady}
                  className="h-8 w-8 shrink-0"
                  title="Edit title"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
                <span className="hidden sm:inline">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              {isCompleted && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <span>Mission completed!</span>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Tasks</h2>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <p className="text-sm">No tasks yet. Add your first task below!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div
                      key={task.taskId.toString()}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.taskId)}
                        disabled={!isActorReady}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {index + 1}.
                        </span>
                        <span className={`ml-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveTask(task.taskId)}
                        disabled={!isActorReady}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Task Input */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                  disabled={!isActorReady}
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!isActorReady || !newTaskText.trim()}
                  className="bg-missions-accent hover:bg-missions-accent-hover text-white shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Attachments Section */}
            {attachedFiles && attachedFiles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Attachments ({attachedFiles.length})</h2>
                <div className="grid grid-cols-2 gap-3">
                  {attachedFiles.map((file, index) => {
                    // Calculate blob index for viewer (only count files with blobs)
                    const blobIndex = attachedFiles
                      .slice(0, index)
                      .filter(f => f.blob).length;

                    const Icon = getFileIcon(file.mimeType);
                    const isLink = !!file.link;

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleAttachmentClick(file, blobIndex)}
                        className="relative p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="relative">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                            {isLink && (
                              <ExternalLink className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs font-medium truncate w-full" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Full Screen Viewer for files with blobs */}
      {viewableFiles.length > 0 && (
        <FullScreenViewer
          files={viewableFiles}
          initialIndex={selectedFileIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
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
