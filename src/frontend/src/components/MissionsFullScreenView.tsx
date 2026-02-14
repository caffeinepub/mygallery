import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useListMissions, useDeleteMission } from '@/hooks/useMissionsQueries';
import { useBackendActor } from '@/contexts/ActorContext';
import type { Mission } from '@/backend';
import { toast } from 'sonner';
import SwipeActionsRow from './SwipeActionsRow';
import MissionEditorDialog from './MissionEditorDialog';
import MissionDetailFullScreenView from './MissionDetailFullScreenView';
import { splitMissionsByCompletion } from '@/utils/missionCompletion';

interface MissionsFullScreenViewProps {
  onClose: () => void;
}

export default function MissionsFullScreenView({ onClose }: MissionsFullScreenViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<bigint | null>(null);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const [deleteConfirmMissionId, setDeleteConfirmMissionId] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState<'incomplete' | 'completed'>('incomplete');

  const { status } = useBackendActor();
  const { data: missions = [], isLoading } = useListMissions();
  const deleteMissionMutation = useDeleteMission();

  const isActorReady = status === 'ready';

  const { incomplete, completed } = splitMissionsByCompletion(missions);

  // Reset to incomplete tab when returning from mission detail
  useEffect(() => {
    if (!selectedMissionId) {
      setActiveTab('incomplete');
    }
  }, [selectedMissionId]);

  const handleOpenDeleteConfirm = (missionId: bigint) => {
    setOpenSwipeRowId(null);
    setDeleteConfirmMissionId(missionId);
  };

  const handleDeleteMission = async (missionId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteMissionMutation.mutateAsync(missionId);
      setDeleteConfirmMissionId(null);
      setOpenSwipeRowId(null);
      toast.success('Mission deleted successfully');
    } catch (error) {
      console.error('Failed to delete mission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mission';
      toast.error(errorMessage);
    }
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMissionId(mission.id);
  };

  const handleBackFromDetail = () => {
    setSelectedMissionId(null);
  };

  const renderMissionRow = (mission: Mission) => {
    const missionId = mission.id.toString();
    const totalTasks = mission.tasks.length;
    const completedTasks = mission.tasks.filter((t) => t.completed).length;

    const missionContent = (
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <Button
          variant="ghost"
          className="flex-1 justify-start text-left"
          onClick={() => handleMissionSelect(mission)}
        >
          <div className="flex-1">
            <div className="font-medium">{mission.title}</div>
            <div className="text-sm text-muted-foreground">
              {completedTasks}/{totalTasks} tasks completed
            </div>
          </div>
        </Button>
      </div>
    );

    return (
      <SwipeActionsRow
        key={missionId}
        onEdit={() => {}} // No-op: missions don't have inline edit in list view
        onDelete={() => handleOpenDeleteConfirm(mission.id)}
        isOpen={openSwipeRowId === missionId}
        onOpenChange={(open) => {
          setOpenSwipeRowId(open ? missionId : null);
        }}
        disabled={!isActorReady}
      >
        {missionContent}
      </SwipeActionsRow>
    );
  };

  if (selectedMissionId !== null) {
    return (
      <MissionDetailFullScreenView
        missionId={selectedMissionId}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-page-scale-in">
        {/* Header */}
        <div 
          className="flex items-center gap-4 p-4 border-b border-border"
          data-transition-target="missions"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Missions</h1>
          <Button
            size="icon"
            onClick={() => setIsCreating(true)}
            disabled={!isActorReady}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Missions list with tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'incomplete' | 'completed')} className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="incomplete" className="flex-1">
              Incomplete ({incomplete.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incomplete" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading missions...
                  </div>
                ) : incomplete.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="font-medium mb-2">Missions incompleted</p>
                    <p className="text-sm">Create a mission to get started!</p>
                  </div>
                ) : (
                  incomplete.map(renderMissionRow)
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading missions...
                  </div>
                ) : completed.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="font-medium mb-2">Completed missions</p>
                    <p className="text-sm">No completed missions yet.</p>
                  </div>
                ) : (
                  completed.map(renderMissionRow)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create mission dialog */}
      <MissionEditorDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        missionId={null}
        isCreating={true}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteConfirmMissionId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmMissionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmMissionId !== null && handleDeleteMission(deleteConfirmMissionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
