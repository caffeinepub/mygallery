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
import { useMoveNotesToMission } from '@/hooks/useNotesQueries';
import { toast } from '@/utils/noopToast';

interface MoveToMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: string[];
  noteIds?: bigint[];
  onMoveComplete?: () => void;
}

export default function MoveToMissionDialog({
  open,
  onOpenChange,
  fileIds,
  noteIds = [],
  onMoveComplete,
}: MoveToMissionDialogProps) {
  const { data: missions, isLoading } = useListMissions();
  const moveFilesToMission = useMoveFilesToMission();
  const moveNotesToMission = useMoveNotesToMission();

  const handleMoveToMission = async (missionId: bigint) => {
    try {
      if (fileIds.length > 0) {
        await moveFilesToMission.mutateAsync({ fileIds, missionId });
      }
      if (noteIds.length > 0) {
        await moveNotesToMission.mutateAsync({ noteIds, missionId });
      }
      
      // Show success message
      const totalCount = fileIds.length + noteIds.length;
      toast.success(`Moved ${totalCount} ${totalCount === 1 ? 'item' : 'items'} to mission`);
      
      onOpenChange(false);
      onMoveComplete?.();
    } catch (error) {
      console.error('Move to mission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move items to mission';
      toast.error(errorMessage);
    }
  };

  const isProcessing = moveFilesToMission.isPending || moveNotesToMission.isPending;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while moving
      if (!newOpen && isProcessing) {
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
                  isProcessing ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !isProcessing && handleMoveToMission(mission.id)}
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

        {isProcessing && (
          <div className="py-3 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
              Moving items...
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
