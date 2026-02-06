import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { FileMetadata, Folder } from '@/backend';
import { ExternalBlob, SortDirection } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { createConcurrencyLimiter } from '@/utils/uploadConcurrency';
import { perfDiag } from '@/utils/performanceDiagnostics';

// Upload concurrency limiter: 3 concurrent uploads
const uploadLimiter = createConcurrencyLimiter(3);

// Track if initial queries have completed (for diagnostics)
let initialFoldersCompleted = false;
let initialFilesCompleted = false;

export function useGetFilesNotInFolder() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<FileMetadata[]>({
    queryKey: ['files', 'not-in-folder'],
    queryFn: async () => {
      if (!actor) return [];
      
      const startTime = performance.now();
      const result = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(1000));
      
      if (perfDiag.isEnabled() && !initialFilesCompleted) {
        const duration = performance.now() - startTime;
        perfDiag.logOperation('Initial main files query (first completion)', duration, {
          fileCount: result.files.length
        });
        initialFilesCompleted = true;
      }
      
      return result.files;
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 2000, // 2 seconds - reduce redundant refetches
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Rely on staleTime instead
  });
}

export function useGetFilesInFolder(folderId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<FileMetadata[]>({
    queryKey: ['files', 'folder', folderId?.toString()],
    queryFn: async () => {
      if (!actor || folderId === null) return [];
      const result = await actor.getFilesInFolder(folderId, BigInt(0), BigInt(1000));
      return result.files;
    },
    enabled: !!actor && status === 'ready' && !!identity && folderId !== null,
    staleTime: 2000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetFilesForMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<FileMetadata[]>({
    queryKey: ['files', 'mission', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return [];
      return actor.getFilesForMission(missionId);
    },
    enabled: !!actor && status === 'ready' && !!identity && missionId !== null,
    staleTime: 2000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetFolders() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      if (!actor) return [];
      
      const startTime = performance.now();
      const result = await actor.getAllFolders();
      
      if (perfDiag.isEnabled() && !initialFoldersCompleted) {
        const duration = performance.now() - startTime;
        perfDiag.logOperation('Initial folders query (first completion)', duration, {
          folderCount: result.length
        });
        initialFoldersCompleted = true;
      }
      
      return result;
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 3000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUploadFile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      mimeType: string;
      size: bigint;
      blob: ExternalBlob;
      missionId: bigint | null;
    }) => {
      if (!actor) throw createActorNotReadyError();

      return uploadLimiter.run(async () => {
        const startTime = performance.now();
        const result = await actor.uploadFile(
          params.name,
          params.mimeType,
          params.size,
          params.blob,
          params.missionId
        );
        
        if (perfDiag.isEnabled()) {
          const duration = performance.now() - startTime;
          perfDiag.logOperation('File upload', duration, {
            fileName: params.name,
            fileSize: Number(params.size),
            mimeType: params.mimeType
          });
        }
        
        return result;
      });
    },
    onSuccess: (_, variables) => {
      if (variables.missionId !== null) {
        queryClient.invalidateQueries({ queryKey: ['files', 'mission', variables.missionId.toString()] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
      }
    },
    onError: (error) => {
      console.error('Upload failed:', getActorErrorMessage(error));
    },
  });
}

export function useCreateLink() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      url: string;
      folderId: bigint | null;
      missionId: bigint | null;
    }) => {
      if (!actor) throw createActorNotReadyError();

      const startTime = performance.now();
      const result = await actor.createLink(params.name, params.url, params.folderId, params.missionId);
      
      if (perfDiag.isEnabled()) {
        const duration = performance.now() - startTime;
        perfDiag.logOperation('Link creation', duration, {
          linkName: params.name
        });
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      if (variables.missionId !== null) {
        queryClient.invalidateQueries({ queryKey: ['files', 'mission', variables.missionId.toString()] });
      } else if (variables.folderId !== null) {
        queryClient.invalidateQueries({ queryKey: ['files', 'folder', variables.folderId.toString()] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
      }
    },
    onError: (error) => {
      console.error('Link creation failed:', getActorErrorMessage(error));
    },
  });
}

export function useDeleteFiles() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileIds: bigint[]) => {
      if (!actor) throw createActorNotReadyError();
      await actor.deleteFiles(fileIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Delete failed:', getActorErrorMessage(error));
    },
  });
}

export function useMoveFilesToFolder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { fileIds: bigint[]; folderId: bigint }) => {
      if (!actor) throw createActorNotReadyError();
      await actor.moveFilesToFolder(params.fileIds, params.folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Move to folder failed:', getActorErrorMessage(error));
    },
  });
}

export function useBatchRemoveFromFolder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileIds: bigint[]) => {
      if (!actor) throw createActorNotReadyError();
      await actor.batchRemoveFromFolder(fileIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Batch remove from folder failed:', getActorErrorMessage(error));
    },
  });
}

export function useCreateFolder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw createActorNotReadyError();
      return actor.createFolder(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
    onError: (error) => {
      console.error('Create folder failed:', getActorErrorMessage(error));
    },
  });
}

export function useRenameFolder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { folderId: bigint; newName: string }) => {
      if (!actor) throw createActorNotReadyError();
      await actor.renameFolder(params.folderId, params.newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
    onError: (error) => {
      console.error('Rename folder failed:', getActorErrorMessage(error));
    },
  });
}

export function useDeleteFolder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: bigint) => {
      if (!actor) throw createActorNotReadyError();
      await actor.deleteFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Delete folder failed:', getActorErrorMessage(error));
    },
  });
}

export function useMoveFilesToMission() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { fileIds: bigint[]; missionId: bigint }) => {
      if (!actor) throw createActorNotReadyError();
      await actor.moveFilesToMission(params.fileIds, params.missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Move to mission failed:', getActorErrorMessage(error));
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && status === 'ready' && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: (status === 'initializing' || status === 'unavailable') || query.isLoading,
    isFetched: status === 'ready' && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw createActorNotReadyError();
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('Save profile failed:', getActorErrorMessage(error));
    },
  });
}
