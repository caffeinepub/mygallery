import { useState, useRef, useEffect } from 'react';
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
import type { Task, Mission } from '@/backend';
import MissionEditorDialog from './MissionEditorDialog';
import MissionDetailFullScreenView from './MissionDetailFullScreenView';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';
import SwipeActionsRow from './SwipeActionsRow';
import { splitMissionsByCompletion, calculateMissionProgress } from '@/utils/missionCompletion';

interface MissionsFullScreenViewProps {
  onClose: () => void;
}

type ViewMode = 'incomplete' | 'completed';

export default function MissionsFullScreenView({ onClose }: MissionsFullScreenViewProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<bigint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmMissionId, setDeleteConfirmMissionId] = useState<bigint | null>(null);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('incomplete');

  const listRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const { status } = useBackendActor();
  const { data: missionsList = [], isLoading: isLoadingList } = useListMissions();
  const deleteMissionMutation = useDeleteMission();
  const isCoarsePointer = useIsCoarsePointer();

  const isActorReady = status === 'ready';

  // Split missions into incomplete and completed
  const { incomplete: incompleteMissions, completed: completedMissions } = splitMissionsByCompletion(missionsList);

  // Get current list based on view mode
  const currentMissions = viewMode === 'incomplete' ? incompleteMissions : completedMissions;

  // Handle horizontal swipe navigation
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement || !isCoarsePointer) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Check if touch started inside a swipeable row
      const target = e.target as HTMLElement;
      const swipeRow = target.closest('[data-swipe-row]');
      if (swipeRow) {
        // Don't handle list-level swipe if starting inside a row
        return;
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current) return;

      const target = e.target as HTMLElement;
      const swipeRow = target.closest('[data-swipe-row]');
      if (swipeRow) {
        // Don't handle list-level swipe if inside a row
        return;
      }

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine if this is a horizontal swipe
      if (!isSwiping.current && Math.abs(deltaX) > 10) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isSwiping.current = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current || !touchStartX.current) {
        touchStartX.current = 0;
        touchStartY.current = 0;
        isSwiping.current = false;
        return;
      }

      const target = e.target as HTMLElement;
      const swipeRow = target.closest('[data-swipe-row]');
      if (swipeRow) {
        // Don't handle list-level swipe if inside a row
        touchStartX.current = 0;
        touchStartY.current = 0;
        isSwiping.current = false;
        return;
      }

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;

      // Swipe right -> show completed
      if (deltaX > 50 && viewMode === 'incomplete') {
        setViewMode('completed');
        setOpenSwipeRowId(null);
      }
      // Swipe left -> show incomplete
      else if (deltaX < -50 && viewMode === 'completed') {
        setViewMode('incomplete');
        setOpenSwipeRowId(null);
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
      isSwiping.current = false;
    };

    listElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    listElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    listElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      listElement.removeEventListener('touchstart', handleTouchStart);
      listElement.removeEventListener('touchmove', handleTouchMove);
      listElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isCoarsePointer, viewMode]);

  const handleOpenDeleteConfirm = (missionId: bigint) => {
    // Close any open swipe row
    setOpenSwipeRowId(null);
    setDeleteConfirmMissionId(missionId);
  };

  const handleSwipeDelete = async (missionId: bigint) => {
    if (!isActorReady) {
      toast.error('Please wait for the application to initialize');
      return;
    }

    const missionIdStr = missionId.toString();

    try {
      // Immediate optimistic delete - no artificial delay
      await deleteMissionMutation.mutateAsync(missionId);
      
      // Clear selection if the deleted mission was selected
      if (selectedMissionId?.toString() === missionIdStr) {
        setSelectedMissionId(null);
      }
      
      toast.success('Mission deleted successfully');
    } catch (error) {
      // On error, optimistic update will be rolled back automatically
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mission';
      console.error('Failed to delete mission:', error);
      toast.error(errorMessage);
    }
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
      toast.success('Mission deleted successfully');
    } catch (error) {
      // Error is already logged by the mutation hook with diagnostics
      // The optimistic update will be rolled back automatically
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mission';
      console.error('Failed to delete mission:', error);
      toast.error(errorMessage);
      // Keep the mission visible on error (optimistic update will be rolled back)
    }
  };

  const handleSelectMission = (missionId: bigint) => {
    // Close any open swipe row
    setOpenSwipeRowId(null);
    setIsCreating(false);
    setSelectedMissionId(missionId);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setSelectedMissionId(null);
  };

  const handleCloseEditor = () => {
    setIsCreating(false);
  };

  const handleBackFromDetail = () => {
    // Reset to incomplete view when returning from detail
    setViewMode('incomplete');
    setSelectedMissionId(null);
    // Close any open swipe rows
    setOpenSwipeRowId(null);
  };

  // Show mission detail view if a mission is selected
  if (selectedMissionId !== null) {
    return (
      <MissionDetailFullScreenView
        missionId={selectedMissionId}
        onBack={handleBackFromDetail}
      />
    );
  }

  const renderMissionRow = (mission: Mission) => {
    const missionId = mission.id.toString();
    const missionProgress = calculateMissionProgress(mission.tasks);
    const missionCompleted = mission.tasks.length > 0 && missionProgress === 100;

    const missionContent = (
      <div
        className={`group relative p-4 rounded-lg cursor-pointer transition-all border ${
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
          {!isCoarsePointer && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteConfirm(mission.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <Progress value={missionProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(missionProgress)}% complete
          </p>
        </div>
      </div>
    );

    if (isCoarsePointer) {
      return (
        <SwipeActionsRow
          key={missionId}
          onEdit={() => handleSelectMission(mission.id)}
          onDelete={() => handleSwipeDelete(mission.id)}
          isOpen={openSwipeRowId === missionId}
          onOpenChange={(open) => {
            setOpenSwipeRowId(open ? missionId : null);
          }}
          disabled={!isActorReady}
        >
          {missionContent}
        </SwipeActionsRow>
      );
    }

    return <div key={missionId}>{missionContent}</div>;
  };

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

      {/* View Mode Toggle */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <Button
            variant={viewMode === 'incomplete' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('incomplete');
              setOpenSwipeRowId(null);
            }}
            className={viewMode === 'incomplete' ? 'bg-missions-accent hover:bg-missions-accent-hover text-white' : ''}
          >
            Incomplete ({incompleteMissions.length})
          </Button>
          <Button
            variant={viewMode === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('completed');
              setOpenSwipeRowId(null);
            }}
            className={viewMode === 'completed' ? 'bg-missions-accent hover:bg-missions-accent-hover text-white' : ''}
          >
            Completed ({completedMissions.length})
          </Button>
        </div>
      </div>

      {/* Main Content - Missions List */}
      <div className="flex-1 overflow-hidden" ref={listRef}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {viewMode === 'incomplete' ? 'Incomplete Missions' : 'Completed Missions'} ({currentMissions.length})
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isLoadingList ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-missions-accent border-r-transparent"></div>
                  <p className="mt-2">Loading missions...</p>
                </div>
              ) : currentMissions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {viewMode === 'incomplete' ? 'No incomplete missions' : 'No completed missions'}
                  </p>
                  <p className="text-sm">
                    {viewMode === 'incomplete' 
                      ? 'Create your first mission to get started!' 
                      : 'Complete missions will appear here.'}
                  </p>
                </div>
              ) : (
                currentMissions.map((mission) => renderMissionRow(mission))
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this mission and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMissionMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmMissionId !== null && handleDeleteMission(deleteConfirmMissionId)}
              disabled={deleteMissionMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMissionMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Deleting...
                </>
              ) : (
                'OK'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
