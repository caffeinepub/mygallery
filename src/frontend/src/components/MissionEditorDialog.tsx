import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useCreateMission } from '@/hooks/useMissionsQueries';
import { toast } from '@/utils/noopToast';
import type { Task } from '@/backend';

interface MissionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MissionEditorDialog({
  open,
  onOpenChange,
}: MissionEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const createMission = useCreateMission();

  const handleAddTask = () => {
    if (!currentTask.trim()) return;

    const newTask: Task = {
      taskId: BigInt(Date.now() + Math.floor(Math.random() * 1000)),
      task: currentTask.trim(),
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setCurrentTask('');
  };

  const handleRemoveTask = (taskId: bigint) => {
    setTasks(tasks.filter(t => t.taskId !== taskId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a mission title');
      return;
    }

    try {
      await createMission.mutateAsync({
        title: title.trim(),
        tasks,
      });

      toast.success('Mission created successfully');
      setTitle('');
      setTasks([]);
      setCurrentTask('');
      onOpenChange(false);
    } catch (error) {
      console.error('Create mission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create mission';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setTasks([]);
    setCurrentTask('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create mission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission-title">Mission title *</Label>
              <Input
                id="mission-title"
                type="text"
                placeholder="Enter mission title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createMission.isPending}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-input">Add task</Label>
              <div className="flex gap-2">
                <Input
                  id="task-input"
                  type="text"
                  placeholder="Enter task"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                  disabled={createMission.isPending}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTask}
                  disabled={!currentTask.trim() || createMission.isPending}
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-2">
                <Label>Tasks ({tasks.length})</Label>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.taskId.toString()}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted"
                    >
                      <span className="flex-1 text-sm">{task.task}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleRemoveTask(task.taskId)}
                        disabled={createMission.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 p-6 border-t bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMission.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMission.isPending || !title.trim()}
              className="flex-1 bg-missions-accent hover:bg-missions-accent-hover text-white"
            >
              {createMission.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
