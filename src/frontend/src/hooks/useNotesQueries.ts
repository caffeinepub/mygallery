import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import type { Note } from '@/backend';

export function useListNotes() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'list'],
    queryFn: async () => {
      if (!actor) return [];
      const notes = await actor.listNotes();
      // Sort by updatedAt descending (most recent first)
      return notes.sort((a, b) => Number(b.updatedAt - a.updatedAt));
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  });
}

export function useGetNote(noteId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note | null>({
    queryKey: ['notes', 'detail', noteId?.toString()],
    queryFn: async () => {
      if (!actor || !noteId) return null;
      return await actor.getNote(noteId);
    },
    enabled: !!actor && status === 'ready' && !!identity && noteId !== null,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  });
}

export function useCreateNote() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      const noteId = await actor.createNote(title, content);
      return noteId;
    },
    onSuccess: async (noteId) => {
      // Invalidate and refetch to get the real note with correct ID from backend
      await queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
      // Prefetch the newly created note detail
      await queryClient.prefetchQuery({
        queryKey: ['notes', 'detail', noteId.toString()],
        queryFn: async () => {
          if (!actor) return null;
          return await actor.getNote(noteId);
        },
      });
      // Return the noteId so the component can select it
      return noteId;
    },
    onError: (err) => {
      console.error('Create note failed:', getActorErrorMessage(err));
    },
  });
}

export function useUpdateNote() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, title, content }: { noteId: bigint; title: string; content: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.updateNote(noteId, title, content);
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'detail', variables.noteId.toString()] });
    },
    onError: (err) => {
      console.error('Update note failed:', getActorErrorMessage(err));
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'detail'] });
    },
    onError: (err) => {
      console.error('Delete note failed:', getActorErrorMessage(err));
    },
  });
}

// Legacy hook for backward compatibility (not used in new implementation)
export function useGetNotes() {
  return useListNotes();
}

// Legacy hook for backward compatibility (not used in new implementation)
export function useSaveNotes() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      // This is a legacy hook - not used in new multi-note implementation
      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
