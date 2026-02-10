import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { FileMetadata, Folder } from '@/backend';
import { ExternalBlob, SortDirection } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { createConcurrencyLimiter } from '@/utils/uploadConcurrency';
import { perfDiag, timeOperation } from '@/utils/performanceDiagnostics';

// Upload concurrency limiter: 3 concurrent uploads
const uploadLimiter = createConcurrencyLimiter(3);

export function useGetFilesNotInFolder() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<FileMetadata[]>({
    queryKey: ['files', 'not-in-folder'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(1000));
      return result.files;
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    enabled: !!actor && status === 'ready' && folderId !== null && !!identity,
    staleTime: 5 * 60 * 1000,
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
    enabled: !!actor && status === 'ready' && missionId !== null && !!identity,
    staleTime: 5 * 60 * 1000,
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
      return actor.getAllFolders();
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 10 * 60 * 1000, // 10 minutes - folders change infrequently
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      return timeOperation('createFolder', async () => {
        const folderId = await actor.createFolder(name);
        // Check for null or empty string, not falsy (to allow "0" as valid ID)
        if (folderId === null || folderId === undefined || folderId === '') {
          throw new Error('Failed to create folder - no folder ID returned');
        }
        return { folderId, name };
      }, { folderName: name });
    },
    onSuccess: async () => {
      // Targeted invalidation - only folders
      await queryClient.invalidateQueries({ queryKey: ['folders'], exact: true });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('[useCreateFolder] Folder creation failed:', errorMessage);
      throw new Error(`Failed to create folder: ${errorMessage}`);
    },
  });
}

export function useRenameFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, newName }: { folderId: bigint; newName: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.renameFolder(folderId, newName);
      return { folderId, newName };
    },
    onMutate: async ({ folderId, newName }) => {
      await queryClient.cancelQueries({ queryKey: ['folders'] });
      const previousFolders = queryClient.getQueryData<Folder[]>(['folders']);
      
      queryClient.setQueryData<Folder[]>(['folders'], (old = []) =>
        old.map(folder => folder.id === folderId ? { ...folder, name: newName } : folder)
      );
      
      return { previousFolders };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Folder rename failed:', errorMessage);
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
      throw new Error(`Failed to rename folder: ${errorMessage}`);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['folders'], exact: true });
    },
  });
}

export function useDeleteFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: bigint) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      return timeOperation('deleteFolder', async () => {
        await actor.deleteFolder(folderId);
        return folderId;
      }, { folderId: folderId.toString() });
    },
    onMutate: async (folderId) => {
      await queryClient.cancelQueries({ queryKey: ['folders'] });
      await queryClient.cancelQueries({ queryKey: ['files', 'folder', folderId.toString()] });
      
      const previousFolders = queryClient.getQueryData<Folder[]>(['folders']);
      const previousFolderFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'folder', folderId.toString()]);
      
      queryClient.setQueryData<Folder[]>(['folders'], (old = []) => old.filter(folder => folder.id !== folderId));
      queryClient.removeQueries({ queryKey: ['files', 'folder', folderId.toString()], exact: true });
      
      return { previousFolders, previousFolderFiles, folderId };
    },
    onError: (err, folderId, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Folder deletion failed:', errorMessage);
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
      if (context?.previousFolderFiles) {
        queryClient.setQueryData(['files', 'folder', folderId.toString()], context.previousFolderFiles);
      }
      throw new Error(`Failed to delete folder: ${errorMessage}`);
    },
    onSuccess: async (folderId) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['folders'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder', folderId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
    },
  });
}

export function useMoveFilesToFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds, folderId }: { fileIds: string[]; folderId: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      return timeOperation('moveFilesToFolder', async () => {
        // Convert string IDs to bigint for backend
        const bigintIds = fileIds.map(id => BigInt(id));
        await actor.moveFilesToFolder(bigintIds, folderId);
        return { fileIds, folderId };
      }, { fileCount: fileIds.length, folderId: folderId.toString() });
    },
    onMutate: async ({ fileIds, folderId }) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      const previousTargetFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'folder', folderId.toString()]);
      
      const filesToMove = previousMainFiles?.filter(f => fileIds.includes(f.id)) ?? [];
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        old.filter(f => !fileIds.includes(f.id))
      );
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'folder', folderId.toString()], (old = []) => 
        [...filesToMove.map(f => ({ ...f, folderId })), ...old]
      );
      
      return { previousMainFiles, previousTargetFiles };
    },
    onError: (err, { folderId }, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Move files failed:', errorMessage);
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousTargetFiles) {
        queryClient.setQueryData(['files', 'folder', folderId.toString()], context.previousTargetFiles);
      }
      throw new Error(`Failed to move files: ${errorMessage}`);
    },
    onSuccess: async ({ folderId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder', folderId.toString()], exact: true });
    },
  });
}

export function useMoveFilesToMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds, missionId }: { fileIds: string[]; missionId: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      // Convert string IDs to bigint for backend
      const bigintIds = fileIds.map(id => BigInt(id));
      await actor.moveFilesToMission(bigintIds, missionId);
      
      return { fileIds, missionId };
    },
    onMutate: async ({ fileIds, missionId }) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      const previousMissionFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'mission', missionId.toString()]);
      
      const allFolderQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'folder'] });
      const previousFolderFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderFiles.set(keyStr, files);
        }
      }
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        old.filter(f => !fileIds.includes(f.id))
      );
      
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => !fileIds.includes(f.id)));
        }
      }
      
      const filesToMove = previousMainFiles?.filter(f => fileIds.includes(f.id)) ?? [];
      queryClient.setQueryData<FileMetadata[]>(['files', 'mission', missionId.toString()], (old = []) => 
        [...filesToMove.map(f => ({ ...f, missionId, folderId: undefined })), ...(old ?? [])]
      );
      
      return { previousMainFiles, previousMissionFiles, previousFolderFiles };
    },
    onError: (err, { missionId }, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Move to mission failed:', errorMessage);
      
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousMissionFiles) {
        queryClient.setQueryData(['files', 'mission', missionId.toString()], context.previousMissionFiles);
      }
      if (context?.previousFolderFiles) {
        context.previousFolderFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
      
      throw new Error(`Failed to move files to mission: ${errorMessage}`);
    },
    onSuccess: async (_, { missionId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'mission', missionId.toString()], exact: true });
      
      // Invalidate all folder queries since files could come from any folder
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder'] });
    },
  });
}

// New batch remove from folder mutation
export function useBatchRemoveFromFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds, sourceFolderId }: { fileIds: string[]; sourceFolderId?: bigint }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      return timeOperation('batchRemoveFromFolder', async () => {
        // Convert string IDs to bigint for backend
        const bigintIds = fileIds.map(id => BigInt(id));
        await actor.batchRemoveFromFolder(bigintIds);
        return { fileIds, sourceFolderId };
      }, { fileCount: fileIds.length });
    },
    onMutate: async ({ fileIds, sourceFolderId }) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      const previousFolderFiles = sourceFolderId 
        ? queryClient.getQueryData<FileMetadata[]>(['files', 'folder', sourceFolderId.toString()])
        : undefined;
      
      // Files from folder move to main collection
      const filesToMove = previousFolderFiles?.filter(f => fileIds.includes(f.id)) ?? [];
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        [...filesToMove.map(f => ({ ...f, folderId: undefined })), ...old]
      );
      
      if (sourceFolderId) {
        queryClient.setQueryData<FileMetadata[]>(['files', 'folder', sourceFolderId.toString()], (old = []) => 
          old.filter(f => !fileIds.includes(f.id))
        );
      }
      
      return { previousMainFiles, previousFolderFiles, sourceFolderId };
    },
    onError: (err, { sourceFolderId }, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Batch remove from folder failed:', errorMessage);
      
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousFolderFiles && sourceFolderId) {
        queryClient.setQueryData(['files', 'folder', sourceFolderId.toString()], context.previousFolderFiles);
      }
      
      throw new Error(`Failed to return files to main collection: ${errorMessage}`);
    },
    onSuccess: async (_, { sourceFolderId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      if (sourceFolderId) {
        await queryClient.invalidateQueries({ queryKey: ['files', 'folder', sourceFolderId.toString()], exact: true });
      }
    },
  });
}

export function useRemoveFromFolder() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      // Convert string ID to bigint for backend
      await actor.removeFromFolder(BigInt(fileId));
      return fileId;
    },
    onSuccess: async () => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder'] });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Remove from folder failed:', errorMessage);
      throw new Error(`Failed to remove from folder: ${errorMessage}`);
    },
  });
}

export function useDeleteFile() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      // Convert string ID to bigint for backend
      await actor.deleteFile(BigInt(fileId));
      return fileId;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        old.filter(f => f.id !== fileId)
      );
      
      const allFolderQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'folder'] });
      const previousFolderFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => f.id !== fileId));
        }
      }
      
      const allMissionQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'mission'] });
      const previousMissionFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allMissionQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => f.id !== fileId));
        }
      }
      
      return { previousMainFiles, previousFolderFiles, previousMissionFiles };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('File deletion failed:', errorMessage);
      
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousFolderFiles) {
        context.previousFolderFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
      if (context?.previousMissionFiles) {
        context.previousMissionFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
      
      throw new Error(`Failed to delete file: ${errorMessage}`);
    },
    onSuccess: async () => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder'] });
      await queryClient.invalidateQueries({ queryKey: ['files', 'mission'] });
    },
  });
}

export function useDeleteFiles() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileIds: string[]) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      return timeOperation('deleteFiles', async () => {
        // Convert string IDs to bigint for backend
        const bigintIds = fileIds.map(id => BigInt(id));
        await actor.deleteFiles(bigintIds);
        return fileIds;
      }, { fileCount: fileIds.length });
    },
    onMutate: async (fileIds) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        old.filter(f => !fileIds.includes(f.id))
      );
      
      const allFolderQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'folder'] });
      const previousFolderFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => !fileIds.includes(f.id)));
        }
      }
      
      const allMissionQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'mission'] });
      const previousMissionFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allMissionQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => !fileIds.includes(f.id)));
        }
      }
      
      return { previousMainFiles, previousFolderFiles, previousMissionFiles };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Batch file deletion failed:', errorMessage);
      
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousFolderFiles) {
        context.previousFolderFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
      if (context?.previousMissionFiles) {
        context.previousMissionFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
      
      throw new Error(`Failed to delete files: ${errorMessage}`);
    },
    onSuccess: async () => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder'] });
      await queryClient.invalidateQueries({ queryKey: ['files', 'mission'] });
    },
  });
}

export function useUploadFile() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      mimeType, 
      size, 
      blob, 
      missionId,
      onProgress 
    }: { 
      name: string; 
      mimeType: string; 
      size: bigint; 
      blob: ExternalBlob; 
      missionId?: bigint | null;
      onProgress?: (percentage: number) => void;
    }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }

      // Use concurrency limiter to control parallel uploads
      return uploadLimiter.run(async () => {
        const blobWithProgress = onProgress ? blob.withUploadProgress(onProgress) : blob;
        const response = await actor.uploadFile(name, mimeType, size, blobWithProgress, missionId ?? null);
        return response;
      });
    },
    onSuccess: async (_, variables) => {
      // Targeted invalidations based on where file was uploaded
      if (variables.missionId) {
        await queryClient.invalidateQueries({ queryKey: ['files', 'mission', variables.missionId.toString()], exact: true });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      }
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('File upload failed:', errorMessage);
      throw new Error(`Failed to upload file: ${errorMessage}`);
    },
  });
}

export function useCreateLink() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      url, 
      folderId, 
      missionId 
    }: { 
      name: string; 
      url: string; 
      folderId?: bigint | null; 
      missionId?: bigint | null;
    }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }

      // Use concurrency limiter for consistency with file uploads
      return uploadLimiter.run(async () => {
        const response = await actor.createLink(name, url, folderId ?? null, missionId ?? null);
        return response;
      });
    },
    onSuccess: async (_, variables) => {
      // Targeted invalidations based on where link was created
      if (variables.missionId) {
        await queryClient.invalidateQueries({ queryKey: ['files', 'mission', variables.missionId.toString()], exact: true });
      } else if (variables.folderId) {
        await queryClient.invalidateQueries({ queryKey: ['files', 'folder', variables.folderId.toString()], exact: true });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'], exact: true });
      }
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Link creation failed:', errorMessage);
      throw new Error(`Failed to create link: ${errorMessage}`);
    },
  });
}
