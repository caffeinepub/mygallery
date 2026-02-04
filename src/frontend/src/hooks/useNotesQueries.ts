import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { diagnoseNoteCache, logDeleteMutationLifecycle, formatActorError } from '@/utils/reactQueryDiagnostics';
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
      return noteId;
    },
    onMutate: async (noteId) => {
      const noteIdStr = noteId.toString();
      
      // Diagnostics: before mutation
      const diagBefore = diagnoseNoteCache(queryClient, noteId);
      logDeleteMutationLifecycle('onMutate', 'note', noteIdStr, diagBefore);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['notes', 'detail', noteIdStr] });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<Note[]>(['notes', 'list']);

      // Optimistically update to remove the note from list
      queryClient.setQueryData<Note[]>(['notes', 'list'], (old) => {
        if (!old) return [];
        return old.filter((n) => n.id.toString() !== noteIdStr);
      });

      // Remove the note detail cache
      queryClient.removeQueries({ queryKey: ['notes', 'detail', noteIdStr] });

      // Diagnostics: after optimistic update
      const diagAfter = diagnoseNoteCache(queryClient, noteId);
      logDeleteMutationLifecycle('onMutate', 'note', noteIdStr, diagAfter);

      // Return context with the snapshot
      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      const noteIdStr = noteId.toString();
      const errorMessage = formatActorError(err);
      
      // Diagnostics: on error
      const diagError = diagnoseNoteCache(queryClient, noteId);
      logDeleteMutationLifecycle('onError', 'note', noteIdStr, diagError, err);

      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', 'list'], context.previousNotes);
      }
      
      console.error('Delete note failed:', getActorErrorMessage(err));
      throw new Error(`Failed to delete note: ${errorMessage}`);
    },
    onSuccess: (noteId) => {
      const noteIdStr = noteId.toString();
      
      // Diagnostics: on success
      const diagSuccess = diagnoseNoteCache(queryClient, noteId);
      logDeleteMutationLifecycle('onSuccess', 'note', noteIdStr, diagSuccess);
    },
    onSettled: (noteId) => {
      const noteIdStr = noteId?.toString() ?? 'unknown';
      
      // Always refetch after error or success to ensure backend state is reflected
      queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'detail'] });

      // Diagnostics: on settled
      if (noteId) {
        const diagSettled = diagnoseNoteCache(queryClient, noteId);
        logDeleteMutationLifecycle('onSettled', 'note', noteIdStr, diagSettled);
      }
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
