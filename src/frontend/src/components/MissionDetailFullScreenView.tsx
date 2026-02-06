import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Trash2, Check, Edit2, FileImage, FileVideo, File as FileIcon, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetMission, useUpdateMission, useDeleteMission } from '@/hooks/useMissionsQueries';
import { useGetFilesForMission } from '@/hooks/useQueries';
import { useBackendActor } from '@/contexts/ActorContext';
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
  const [initialTitle, setInitialTitle] = useState('');
  const [initialTasks, setInitialTasks] = useState<Task[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const { status } = useBackendActor();
  const { data: selectedMission, isLoading: isLoadingMission } = useGetMission(missionId);
  const { data: attachedFiles, isLoading: isLoadingFiles } = useGetFilesForMission(missionId);
  const updateMissionMutation = useUpdateMission();
  const deleteMissionMutation = useDeleteMission();

  const isActorReady = status === 'ready';

  // Load selected mission data when mission changes
  useEffect(() => {
    if (selectedMission) {
      setMissionTitle(selectedMission.title);
      setTasks(selectedMission.tasks);
      setInitialTitle(selectedMission.title);
      setInitialTasks(selectedMission.tasks);
      setIsEditingTitle(false);
    }
  }, [selectedMission]);

  const calculateProgress = (missionTasks: Task[]) => {
    if (missionTasks.length === 0) return 0;
    const completed = missionTasks.filter(t => t.completed).length;
    return (completed / missionTasks.length) * 100;
  };

  // BigInt-safe change detection
  const hasChanges = () => {
    if (missionTitle !== initialTitle) return true;
    if (tasks.length !== initialTasks.length) return true;
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const initialTask = initialTasks[i];
      if (
        task.taskId.toString() !== initialTask.taskId.toString() ||
        task.task !== initialTask.task ||
        task.completed !== initialTask.completed
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSaveMission = async () => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await updateMissionMutation.mutateAsync({
        missionId: missionId,
        title: missionTitle,
        tasks: tasks,
      });
      
      // Update initial values after successful save
      setInitialTitle(missionTitle);
      setInitialTasks(tasks);
      setIsEditingTitle(false);
      
      toast.success('Mission saved successfully');
    } catch (error) {
      console.error('Failed to save mission:', error);
      toast.error('Failed to save mission');
    }
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
    setTasks(tasks.map(t => 
      t.taskId.toString() === taskId.toString() ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleRemoveTask = (taskId: bigint) => {
    setTasks(tasks.filter(t => t.taskId.toString() !== taskId.toString()));
  };

  const handleDeleteMission = async () => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteMissionMutation.mutateAsync(missionId);
      toast.success('Mission deleted successfully');
      // Navigate back to list on success
      onBack();
    } catch (error) {
      // Error is already logged by the mutation hook with diagnostics
      // The optimistic update will be rolled back automatically
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mission';
      console.error('Failed to delete mission:', error);
      toast.error(errorMessage);
      // Close the dialog but stay in detail view so user can see the mission is still there
      setDeleteConfirmOpen(false);
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
        toast.success('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const progress = calculateProgress(tasks);
  const isCompleted = tasks.length > 0 && progress === 100;
  const changesDetected = hasChanges();

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
              onClick={onBack}
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
                onBlur={() => {
                  if (!changesDetected) {
                    setIsEditingTitle(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (changesDetected) {
                      handleSaveMission();
                    } else {
                      setIsEditingTitle(false);
                    }
                  }
                  if (e.key === 'Escape') {
                    setMissionTitle(initialTitle);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={!isActorReady || deleteMissionMutation.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSaveMission}
              disabled={!isActorReady || !changesDetected || updateMissionMutation.isPending}
              className="bg-missions-accent hover:bg-missions-accent-hover text-white"
            >
              {updateMissionMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {tasks.length > 0 && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {tasks.filter(t => t.completed).length} / {tasks.length} tasks completed
                </span>
                {isCompleted && (
                  <span className="text-missions-accent font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Tasks List + Attachments */}
      <div className="flex-1 overflow-hidden">
        {isLoadingMission ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
              <p className="text-muted-foreground mt-2">Loading mission...</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="container mx-auto px-4 py-6 space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No tasks yet</p>
                  <p className="text-sm">Add your first task below to get started!</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <div
                    key={task.taskId.toString()}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors group ${
                      task.completed 
                        ? 'bg-muted/50 border-muted' 
                        : 'bg-card hover:bg-accent/50 border-border'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.taskId)}
                      disabled={!isActorReady}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className={`ml-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleRemoveTask(task.taskId)}
                      disabled={!isActorReady}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}

              {/* Attachments Section */}
              {attachedFiles && attachedFiles.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                  <div className="flex flex-wrap gap-3">
                    {attachedFiles.map((file) => {
                      const isLink = !!file.link;
                      const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
                      const isImage = !isLink && file.mimeType.startsWith('image/') && file.blob;
                      const isVideo = !isLink && file.mimeType.startsWith('video/') && file.blob;
                      
                      // Calculate the blob-only index for this file (for viewer navigation)
                      const blobIndex = file.blob 
                        ? viewableFiles.findIndex(vf => vf.id === file.id)
                        : -1;
                      
                      return (
                        <div
                          key={file.id}
                          className="group cursor-pointer relative select-none"
                          onClick={() => handleAttachmentClick(file, blobIndex)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAttachmentClick(file, blobIndex);
                            }
                          }}
                        >
                          <div className="relative w-[100px] h-[100px] overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02]">
                            {isLink ? (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                              </div>
                            ) : isImage ? (
                              <img
                                src={file.blob!.getDirectURL()}
                                alt={file.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : isVideo ? (
                              <video src={file.blob!.getDirectURL()} className="h-full w-full object-cover" preload="metadata" />
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
                          <p className="mt-1.5 text-xs truncate w-[100px]" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLoadingFiles && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading attachments...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Add Task Section */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2">
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
              className="flex-1"
            />
            <Button
              onClick={handleAddTask}
              disabled={!isActorReady || !newTaskText.trim()}
              className="bg-missions-accent hover:bg-missions-accent-hover text-white"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMissionMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMission}
              disabled={deleteMissionMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMissionMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Screen Viewer for File Attachments (not links) */}
      {viewableFiles.length > 0 && (
        <FullScreenViewer
          files={viewableFiles}
          initialIndex={selectedFileIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Link Open Fallback Dialog */}
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
