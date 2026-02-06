import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useListMissions } from '@/hooks/useMissionsQueries';
import { useMoveFilesToMission } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface MoveToMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: string[];
  onComplete?: () => void;
}

export default function MoveToMissionDialog({
  open,
  onOpenChange,
  fileIds,
  onComplete,
}: MoveToMissionDialogProps) {
  const { data: missions, isLoading } = useListMissions();
  const moveToMission = useMoveFilesToMission();

  const handleMoveToMission = async (missionId: bigint) => {
    try {
      const bigintFileIds = fileIds.map(id => BigInt(id));
      await moveToMission.mutateAsync({ fileIds: bigintFileIds, missionId });
      
      // Show success message
      const fileCount = fileIds.length;
      toast.success(`Moved ${fileCount} ${fileCount === 1 ? 'file' : 'files'} to mission`);
      
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error('Move to mission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move files to mission';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while moving
      if (!newOpen && moveToMission.isPending) {
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move to mission</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading missions...</div>
          ) : !missions || missions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No missions</p>
                <p className="text-xs text-muted-foreground mt-1">Create a mission first</p>
              </CardContent>
            </Card>
          ) : (
            missions.map((mission) => (
              <Card
                key={mission.id.toString()}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-missions-accent ${
                  moveToMission.isPending ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !moveToMission.isPending && handleMoveToMission(mission.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-missions-accent/10 p-2">
                      <Target className="h-5 w-5 text-missions-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{mission.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.tasks.length} {mission.tasks.length === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {moveToMission.isPending && (
          <div className="py-3 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
              Moving files...
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            disabled={moveToMission.isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
