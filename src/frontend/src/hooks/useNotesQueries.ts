import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { SortDirection } from '@/backend';
import type { Note } from '@/backend';

export function useCreateNote() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, body, folderId, missionId }: { 
      title: string; 
      body: string;
      folderId?: bigint | null;
      missionId?: bigint | null;
    }) => {
      if (!actor || status !== 'ready') throw new Error('Actor not available');
      return actor.createNote(title, body, folderId ?? null, missionId ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['folderNotes'] });
      queryClient.invalidateQueries({ queryKey: ['missionNotes'] });
    },
  });
}

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
  });
}

export function useGetNotesInFolder(folderId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['folderNotes', folderId?.toString()],
    queryFn: async () => {
      if (!actor || folderId === null) return [];
      const result = await actor.getNotesInFolder(folderId, BigInt(0), BigInt(1000));
      return result.notes;
    },
    enabled: !!actor && status === 'ready' && folderId !== null && !!identity,
  });
}

export function useGetNotesForMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['missionNotes', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return [];
      return actor.getNotesForMission(missionId);
    },
    enabled: !!actor && status === 'ready' && missionId !== null && !!identity,
  });
}

export function useGetNote(noteId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note | null>({
    queryKey: ['note', noteId?.toString()],
    queryFn: async () => {
      if (!actor || noteId === null) return null;
      return actor.getNote(noteId);
    },
    enabled: !!actor && status === 'ready' && noteId !== null && !!identity,
  });
}

export function useDeleteNotes() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteIds: bigint[]) => {
      if (!actor || status !== 'ready') throw new Error('Actor not available');
      if (noteIds.length === 1) {
        return actor.deleteNote(noteIds[0]);
      }
      return actor.deleteNotes(noteIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['folderNotes'] });
      queryClient.invalidateQueries({ queryKey: ['missionNotes'] });
    },
  });
}

export function useMoveNotesToFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds, folderId }: { noteIds: bigint[]; folderId: bigint }) => {
      if (!actor || status !== 'ready') throw new Error('Actor not available');
      if (noteIds.length === 1) {
        return actor.moveNoteToFolder(noteIds[0], folderId);
      }
      return actor.moveNotesToFolder(noteIds, folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['folderNotes'] });
      queryClient.invalidateQueries({ queryKey: ['missionNotes'] });
    },
  });
}

export function useMoveNotesToMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds, missionId }: { noteIds: bigint[]; missionId: bigint }) => {
      if (!actor || status !== 'ready') throw new Error('Actor not available');
      return actor.moveNotesToMission(noteIds, missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['folderNotes'] });
      queryClient.invalidateQueries({ queryKey: ['missionNotes'] });
    },
  });
}

export function useBatchRemoveNotesFromFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteIds }: { noteIds: bigint[] }) => {
      if (!actor || status !== 'ready') throw new Error('Actor not available');
      if (noteIds.length === 1) {
        return actor.removeNoteFromFolder(noteIds[0]);
      }
      return actor.batchRemoveNotesFromFolder(noteIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['folderNotes'] });
    },
  });
}
