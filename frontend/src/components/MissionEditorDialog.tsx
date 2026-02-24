import { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateMission } from '@/hooks/useMissionsQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import { toast } from 'sonner';
import type { Task } from '@/backend';

interface MissionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: bigint | null;
  isCreating: boolean;
}

export default function MissionEditorDialog({
  open,
  onOpenChange,
  missionId,
  isCreating,
}: MissionEditorDialogProps) {
  const [missionTitle, setMissionTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  const { status } = useBackendActor();
  const createMissionMutation = useCreateMission();

  const isActorReady = status === 'ready';

  // Reset form when dialog opens for creation
  useEffect(() => {
    if (isCreating && open) {
      setMissionTitle('');
      setTasks([]);
      setNewTaskText('');
    }
  }, [isCreating, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setMissionTitle('');
      setTasks([]);
      setNewTaskText('');
    }
  }, [open]);

  const handleCreateMission = async () => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    if (!missionTitle.trim()) {
      toast.error('Please enter a mission title');
      return;
    }

    try {
      // Create a defensive deep copy of tasks to avoid reference issues
      const tasksCopy: Task[] = tasks.map(t => ({
        taskId: t.taskId,
        task: t.task,
        completed: t.completed,
      }));

      await createMissionMutation.mutateAsync({
        title: missionTitle.trim(),
        tasks: tasksCopy,
      });
      
      toast.success('Mission created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create mission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create mission';
      toast.error(errorMessage);
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    // Generate collision-resistant taskId using timestamp + random component
    // This matches the strategy used in useAddTaskToMission for optimistic tasks
    const collisionResistantId = BigInt(`${Date.now()}${Math.random().toString().slice(2, 8)}`);
    
    const newTask: Task = {
      taskId: collisionResistantId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[85dvh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
          <DialogTitle className="sr-only">Create New Mission</DialogTitle>
          <Input
            placeholder="Mission title..."
            value={missionTitle}
            onChange={(e) => setMissionTitle(e.target.value)}
            disabled={!isActorReady}
            className="text-xl font-bold border-0 focus-visible:ring-1 shadow-none px-0"
            autoFocus
          />
        </DialogHeader>

        <div className="px-6 pt-3 pb-2 border-b shrink-0 bg-background">
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

        <div className="flex-1 overflow-hidden px-6 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2 py-3">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No tasks yet. Add tasks above to get started!</p>
                </div>
              ) : (
                tasks.map((task, index) => (
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
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-6 pb-4 pt-3 border-t shrink-0 bg-background">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMissionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMission}
              disabled={!isActorReady || !missionTitle.trim() || createMissionMutation.isPending}
              className="bg-missions-accent hover:bg-missions-accent-hover text-white"
            >
              {createMissionMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Mission
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
