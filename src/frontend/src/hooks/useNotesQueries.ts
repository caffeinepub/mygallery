import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { Note } from '@/backend';
import { SortDirection } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { createConcurrencyLimiter } from '@/utils/uploadConcurrency';

// Use same concurrency limiter as file uploads for consistency
const noteLimiter = createConcurrencyLimiter(3);

export function useGetNotesNotInFolder() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'root'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedNotes(SortDirection.desc, BigInt(0), BigInt(1000));
      return result.notes;
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetNotesInFolder(folderId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'folder', folderId?.toString()],
    queryFn: async () => {
      if (!actor || folderId === null) return [];
      const result = await actor.getNotesInFolder(folderId, BigInt(0), BigInt(1000));
      return result.notes;
    },
    enabled: !!actor && status === 'ready' && folderId !== null && !!identity,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetNotesForMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'mission', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return [];
      return actor.getNotesForMission(missionId);
    },
    enabled: !!actor && status === 'ready' && missionId !== null && !!identity,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateNote() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      body, 
      folderId, 
      missionId 
    }: { 
      title: string; 
      body: string; 
      folderId?: bigint | null; 
      missionId?: bigint | null;
    }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }

      // Use concurrency limiter for consistency with file uploads
      return noteLimiter.run(async () => {
        const response = await actor.createNote(title, body, folderId ?? null, missionId ?? null);
        return response;
      });
    },
    onSuccess: async (_, variables) => {
      // Targeted invalidations based on where note was created
      if (variables.missionId) {
        await queryClient.invalidateQueries({ queryKey: ['notes', 'mission', variables.missionId.toString()], exact: true });
      } else if (variables.folderId) {
        await queryClient.invalidateQueries({ queryKey: ['notes', 'folder', variables.folderId.toString()], exact: true });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      }
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Note creation failed:', errorMessage);
      throw new Error(`Failed to create note: ${errorMessage}`);
    },
  });
}

export function useDeleteNote() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.deleteNote(noteId);
      return noteId;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      
      const previousRootNotes = queryClient.getQueryData<Note[]>(['notes', 'root']);
      
      queryClient.setQueryData<Note[]>(['notes', 'root'], (old = []) => 
        old.filter(n => n.id !== noteId.toString())
      );
      
      const allFolderQueries = queryClient.getQueriesData<Note[]>({ queryKey: ['notes', 'folder'] });
      const previousFolderNotes: Map<string, Note[]> = new Map();
      
      for (const [queryKey, notes] of allFolderQueries) {
        if (notes) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderNotes.set(keyStr, notes);
          queryClient.setQueryData<Note[]>(queryKey, notes.filter(n => n.id !== noteId.toString()));
        }
      }
      
      const allMissionQueries = queryClient.getQueriesData<Note[]>({ queryKey: ['notes', 'mission'] });
      const previousMissionNotes: Map<string, Note[]> = new Map();
      
      for (const [queryKey, notes] of allMissionQueries) {
        if (notes) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionNotes.set(keyStr, notes);
          queryClient.setQueryData<Note[]>(queryKey, notes.filter(n => n.id !== noteId.toString()));
        }
      }
      
      return { previousRootNotes, previousFolderNotes, previousMissionNotes };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Note deletion failed:', errorMessage);
      
      if (context?.previousRootNotes) {
        queryClient.setQueryData(['notes', 'root'], context.previousRootNotes);
      }
      if (context?.previousFolderNotes) {
        context.previousFolderNotes.forEach((notes, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, notes);
        });
      }
      if (context?.previousMissionNotes) {
        context.previousMissionNotes.forEach((notes, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, notes);
        });
      }
      
      throw new Error(`Failed to delete note: ${errorMessage}`);
    },
    onSuccess: async () => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'folder'] });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'mission'] });
    },
  });
}

export function useDeleteNotes() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteIds: bigint[]) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.deleteNotes(noteIds);
      return noteIds;
    },
    onMutate: async (noteIds) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      
      const noteIdStrings = noteIds.map(id => id.toString());
      const previousRootNotes = queryClient.getQueryData<Note[]>(['notes', 'root']);
      
      queryClient.setQueryData<Note[]>(['notes', 'root'], (old = []) => 
        old.filter(n => !noteIdStrings.includes(n.id))
      );
      
      const allFolderQueries = queryClient.getQueriesData<Note[]>({ queryKey: ['notes', 'folder'] });
      const previousFolderNotes: Map<string, Note[]> = new Map();
      
      for (const [queryKey, notes] of allFolderQueries) {
        if (notes) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderNotes.set(keyStr, notes);
          queryClient.setQueryData<Note[]>(queryKey, notes.filter(n => !noteIdStrings.includes(n.id)));
        }
      }
      
      const allMissionQueries = queryClient.getQueriesData<Note[]>({ queryKey: ['notes', 'mission'] });
      const previousMissionNotes: Map<string, Note[]> = new Map();
      
      for (const [queryKey, notes] of allMissionQueries) {
        if (notes) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionNotes.set(keyStr, notes);
          queryClient.setQueryData<Note[]>(queryKey, notes.filter(n => !noteIdStrings.includes(n.id)));
        }
      }
      
      return { previousRootNotes, previousFolderNotes, previousMissionNotes };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Batch note deletion failed:', errorMessage);
      
      if (context?.previousRootNotes) {
        queryClient.setQueryData(['notes', 'root'], context.previousRootNotes);
      }
      if (context?.previousFolderNotes) {
        context.previousFolderNotes.forEach((notes, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, notes);
        });
      }
      if (context?.previousMissionNotes) {
        context.previousMissionNotes.forEach((notes, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, notes);
        });
      }
      
      throw new Error(`Failed to delete notes: ${errorMessage}`);
    },
    onSuccess: async () => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'folder'] });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'mission'] });
    },
  });
}

export function useMoveNotesToFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds, folderId }: { noteIds: bigint[]; folderId: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.moveNotesToFolder(noteIds, folderId);
      return { noteIds, folderId };
    },
    onSuccess: async ({ folderId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'folder', folderId.toString()], exact: true });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Move notes to folder failed:', errorMessage);
      throw new Error(`Failed to move notes: ${errorMessage}`);
    },
  });
}

export function useMoveNotesToMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds, missionId }: { noteIds: bigint[]; missionId: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.moveNotesToMission(noteIds, missionId);
      return { noteIds, missionId };
    },
    onSuccess: async ({ missionId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'mission', missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'folder'] });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Move notes to mission failed:', errorMessage);
      throw new Error(`Failed to move notes to mission: ${errorMessage}`);
    },
  });
}

export function useBatchRemoveNotesFromFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds, sourceFolderId }: { noteIds: bigint[]; sourceFolderId?: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.batchRemoveNotesFromFolder(noteIds);
      return { noteIds, sourceFolderId };
    },
    onSuccess: async (_, { sourceFolderId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['notes', 'root'], exact: true });
      if (sourceFolderId) {
        await queryClient.invalidateQueries({ queryKey: ['notes', 'folder', sourceFolderId.toString()], exact: true });
      }
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Batch remove notes from folder failed:', errorMessage);
      throw new Error(`Failed to return notes to main collection: ${errorMessage}`);
    },
  });
}
