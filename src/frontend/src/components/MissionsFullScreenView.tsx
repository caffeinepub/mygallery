import { useState } from 'react';
import { ArrowLeft, Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';
import type { Task } from '@/backend';
import MissionEditorDialog from './MissionEditorDialog';
import MissionDetailFullScreenView from './MissionDetailFullScreenView';
import SwipeRevealRow from './SwipeRevealRow';

interface MissionsFullScreenViewProps {
  onClose: () => void;
}

export default function MissionsFullScreenView({ onClose }: MissionsFullScreenViewProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<bigint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmMissionId, setDeleteConfirmMissionId] = useState<bigint | null>(null);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const [editTitleOnOpen, setEditTitleOnOpen] = useState(false);

  const { status } = useBackendActor();
  const { data: missionsList = [], isLoading: isLoadingList } = useListMissions();
  const deleteMissionMutation = useDeleteMission();

  const isActorReady = status === 'ready';

  const calculateProgress = (missionTasks: Task[]) => {
    if (missionTasks.length === 0) return 0;
    const completed = missionTasks.filter(t => t.completed).length;
    return (completed / missionTasks.length) * 100;
  };

  const handleDeleteMission = async (missionId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    try {
      await deleteMissionMutation.mutateAsync(missionId);
      // Clear selection if the deleted mission was selected
      if (selectedMissionId?.toString() === missionId.toString()) {
        setSelectedMissionId(null);
      }
      setDeleteConfirmMissionId(null);
      setOpenSwipeRowId(null);
      toast.success('Mission deleted successfully');
    } catch (error) {
      console.error('Failed to delete mission:', error);
      toast.error('Failed to delete mission');
      // Keep the mission visible on error (optimistic update will be rolled back)
    }
  };

  const handleSelectMission = (missionId: bigint) => {
    setIsCreating(false);
    setSelectedMissionId(missionId);
    setEditTitleOnOpen(false);
    setOpenSwipeRowId(null);
  };

  const handleEditMissionTitle = (missionId: bigint) => {
    setIsCreating(false);
    setSelectedMissionId(missionId);
    setEditTitleOnOpen(true);
    setOpenSwipeRowId(null);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setSelectedMissionId(null);
    setOpenSwipeRowId(null);
  };

  const handleCloseEditor = () => {
    setIsCreating(false);
  };

  const handleBackFromDetail = () => {
    setSelectedMissionId(null);
    setEditTitleOnOpen(false);
  };

  // Show mission detail view if a mission is selected
  if (selectedMissionId !== null) {
    return (
      <MissionDetailFullScreenView
        missionId={selectedMissionId}
        onBack={handleBackFromDetail}
        startEditingTitle={editTitleOnOpen}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-missions-bg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-missions-accent" />
              <h1 className="text-2xl font-bold">Missions</h1>
            </div>
          </div>
          <Button
            onClick={handleStartCreating}
            disabled={!isActorReady}
            className="bg-missions-accent hover:bg-missions-accent-hover text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Mission</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Missions List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Your Missions ({missionsList.length})
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isLoadingList ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
                  <p className="mt-2">Loading missions...</p>
                </div>
              ) : missionsList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No missions yet</p>
                  <p className="text-sm">Create your first mission to get started!</p>
                </div>
              ) : (
                missionsList.map((mission) => {
                  const missionProgress = calculateProgress(mission.tasks);
                  const missionCompleted = mission.tasks.length > 0 && missionProgress === 100;
                  
                  return (
                    <SwipeRevealRow
                      key={mission.id.toString()}
                      isOpen={openSwipeRowId === mission.id.toString()}
                      onOpen={() => setOpenSwipeRowId(mission.id.toString())}
                      onClose={() => setOpenSwipeRowId(null)}
                      disabled={!isActorReady}
                      actions={
                        <div className="flex h-full">
                          <button
                            onClick={() => handleEditMissionTitle(mission.id)}
                            disabled={!isActorReady}
                            className="px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                            style={{ minWidth: '80px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmMissionId(mission.id)}
                            disabled={!isActorReady}
                            className="px-4 bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                            style={{ minWidth: '80px' }}
                          >
                            Delete
                          </button>
                        </div>
                      }
                    >
                      <div
                        className={`group relative p-4 rounded-lg cursor-pointer transition-colors border ${
                          missionCompleted 
                            ? 'bg-muted/50 border-muted hover:bg-muted' 
                            : 'bg-card hover:bg-accent/50 border-border'
                        }`}
                        onClick={() => handleSelectMission(mission.id)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg truncate ${missionCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {mission.title || 'Untitled Mission'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mission.tasks.filter(t => t.completed).length} of {mission.tasks.length} tasks completed
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden md:flex"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmMissionId(mission.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Progress value={missionProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {Math.round(missionProgress)}% complete
                          </p>
                        </div>
                      </div>
                    </SwipeRevealRow>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mission Editor Dialog - Only for creating new missions */}
      <MissionEditorDialog
        open={isCreating}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEditor();
          }
        }}
        missionId={null}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmMissionId !== null} onOpenChange={(open) => !open && setDeleteConfirmMissionId(null)}>
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
              onClick={() => deleteConfirmMissionId && handleDeleteMission(deleteConfirmMissionId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
