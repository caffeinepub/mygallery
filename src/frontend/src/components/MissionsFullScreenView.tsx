import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListMissions, useDeleteMission } from '@/hooks/useMissionsQueries';
import MissionEditorDialog from './MissionEditorDialog';
import MissionDetailFullScreenView from './MissionDetailFullScreenView';
import { splitMissionsByCompletion } from '@/utils/missionCompletion';
import SwipeActionsRow from './SwipeActionsRow';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';
import { toast } from '@/utils/noopToast';
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

interface MissionsFullScreenViewProps {
  onClose: () => void;
}

export default function MissionsFullScreenView({ onClose }: MissionsFullScreenViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<bigint | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState<'incomplete' | 'completed'>('incomplete');
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const { data: missions, isLoading } = useListMissions();
  const deleteMission = useDeleteMission();
  const isCoarsePointer = useIsCoarsePointer();

  const { incomplete, completed } = splitMissionsByCompletion(missions || []);

  useEffect(() => {
    if (selectedMissionId === null) {
      setActiveTab('incomplete');
    }
  }, [selectedMissionId]);

  const handleDeleteMission = async (missionId: bigint) => {
    try {
      await deleteMission.mutateAsync(missionId);
      toast.success('Mission deleted successfully');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete mission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mission';
      toast.error(errorMessage);
    }
  };

  const handleMissionClick = (missionId: bigint) => {
    setSelectedMissionId(missionId);
  };

  const handleBackFromDetail = () => {
    setSelectedMissionId(null);
  };

  if (selectedMissionId !== null) {
    return (
      <MissionDetailFullScreenView
        missionId={selectedMissionId}
        onBack={handleBackFromDetail}
      />
    );
  }

  const renderMissionsList = (missionsList: typeof missions) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-missions-accent border-r-transparent mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading missions...</p>
          </div>
        </div>
      );
    }

    if (!missionsList || missionsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-missions-bg p-4 mb-4">
              <Plus className="h-8 w-8 text-missions-accent" />
            </div>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'incomplete' ? 'No missions yet' : 'No completed missions'}
            </p>
            {activeTab === 'incomplete' && (
              <p className="text-xs text-muted-foreground mt-1">Create your first mission</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {missionsList.map((mission) => {
          const completedTasks = mission.tasks.filter(t => t.completed).length;
          const totalTasks = mission.tasks.length;
          const rowId = mission.id.toString();

          return (
            <SwipeActionsRow
              key={rowId}
              onEdit={() => {}}
              onDelete={() => setDeleteConfirmId(mission.id)}
              isOpen={openSwipeRowId === rowId}
              onOpenChange={(open) => setOpenSwipeRowId(open ? rowId : null)}
              disabled={deleteMission.isPending}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-md hover:border-missions-accent"
                onClick={() => handleMissionClick(mission.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{mission.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {completedTasks} / {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                    {!isCoarsePointer && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(mission.id);
                          }}
                          disabled={deleteMission.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </SwipeActionsRow>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Missions</h1>
        <Button
          onClick={() => setShowEditor(true)}
          size="icon"
          className="shrink-0 bg-missions-accent hover:bg-missions-accent-hover text-white"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'incomplete' | 'completed')} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="incomplete">Missions incompleted</TabsTrigger>
          <TabsTrigger value="completed">Completed missions</TabsTrigger>
        </TabsList>

        <TabsContent value="incomplete" className="flex-1 overflow-auto p-4 mt-0">
          {renderMissionsList(incomplete)}
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-auto p-4 mt-0">
          {renderMissionsList(completed)}
        </TabsContent>
      </Tabs>

      <MissionEditorDialog
        open={showEditor}
        onOpenChange={setShowEditor}
      />

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mission?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mission and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMission.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId !== null && handleDeleteMission(deleteConfirmId)}
              disabled={deleteMission.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMission.isPending ? 'Deleting...' : 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
