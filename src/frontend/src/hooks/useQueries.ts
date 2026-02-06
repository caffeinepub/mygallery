import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { FileMetadata, Folder } from '@/backend';
import { ExternalBlob, SortDirection } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';

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
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
      const folderId = await actor.createFolder(name);
      if (!folderId) {
        throw new Error('Failed to create folder - no folder ID returned');
      }
      return { folderId, name };
    },
    onSuccess: async () => {
      console.log('[useCreateFolder] Folder created successfully, refreshing folders list');
      // Invalidate and force refetch, ensuring the query runs even if not previously active
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      await queryClient.refetchQueries({ 
        queryKey: ['folders'], 
        type: 'all' // Refetch all matching queries, not just active ones
      });
      console.log('[useCreateFolder] Folders list refresh complete');
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
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
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
      await actor.deleteFolder(folderId);
      return folderId;
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
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      await queryClient.invalidateQueries({ queryKey: ['files', 'folder', folderId.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
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
      await actor.moveFilesToFolder(fileIds, folderId);
      return { fileIds, folderId };
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['files'] });
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
      
      // Use the backend batch move method
      await actor.moveFilesToMission(fileIds, missionId);
      
      return { fileIds, missionId };
    },
    onMutate: async ({ fileIds, missionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['files'] });
      
      // Snapshot previous values
      const previousMainFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'not-in-folder']);
      const previousMissionFiles = queryClient.getQueryData<FileMetadata[]>(['files', 'mission', missionId.toString()]);
      
      // Get all folder queries to update
      const allFolderQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'folder'] });
      const previousFolderFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousFolderFiles.set(keyStr, files);
        }
      }
      
      // Optimistically remove files from their current locations
      queryClient.setQueryData<FileMetadata[]>(['files', 'not-in-folder'], (old = []) => 
        old.filter(f => !fileIds.includes(f.id))
      );
      
      // Remove from all folder queries
      for (const [queryKey, files] of allFolderQueries) {
        if (files) {
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => !fileIds.includes(f.id)));
        }
      }
      
      // Add to mission files (optimistically)
      const filesToMove = previousMainFiles?.filter(f => fileIds.includes(f.id)) ?? [];
      queryClient.setQueryData<FileMetadata[]>(['files', 'mission', missionId.toString()], (old = []) => 
        [...filesToMove.map(f => ({ ...f, missionId, folderId: undefined })), ...(old ?? [])]
      );
      
      return { previousMainFiles, previousMissionFiles, previousFolderFiles };
    },
    onError: (err, { missionId }, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Move to mission failed:', errorMessage);
      
      // Rollback on error
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
      // Invalidate all file queries to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      // Refetch mission files to ensure they're up to date
      await queryClient.refetchQueries({ queryKey: ['files', 'mission', missionId.toString()], type: 'all' });
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
      await actor.removeFromFolder(fileId);
      return fileId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['files'] });
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
      await actor.deleteFile(fileId);
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
      
      // Also remove from mission queries
      const allMissionQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'mission'] });
      const previousMissionFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allMissionQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => f.id !== fileId));
        }
      }
      
      return { previousMainFiles, previousFolderFiles, previousMissionFiles, fileId };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Delete file failed:', errorMessage);
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
      await queryClient.invalidateQueries({ queryKey: ['files'] });
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
      
      const CHUNK_SIZE = 50;
      for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
        const chunk = fileIds.slice(i, i + CHUNK_SIZE);
        await actor.deleteFiles(chunk);
      }
      
      return fileIds;
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
      
      // Also remove from mission queries
      const allMissionQueries = queryClient.getQueriesData<FileMetadata[]>({ queryKey: ['files', 'mission'] });
      const previousMissionFiles: Map<string, FileMetadata[]> = new Map();
      
      for (const [queryKey, files] of allMissionQueries) {
        if (files) {
          const keyStr = JSON.stringify(queryKey);
          previousMissionFiles.set(keyStr, files);
          queryClient.setQueryData<FileMetadata[]>(queryKey, files.filter(f => !fileIds.includes(f.id)));
        }
      }
      
      return { previousMainFiles, previousFolderFiles, previousMissionFiles, fileIds };
    },
    onError: (err, _, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Delete files failed:', errorMessage);
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
      await queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useUploadFiles() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      onProgress,
    }: {
      files: File[];
      onProgress?: (fileName: string, progress: number) => void;
    }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }

      const uploadedFiles: Array<{ id: string; file: File }> = [];
      
      const CHUNK_SIZE = 3;
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        
        const chunkPromises = chunk.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          let blob = ExternalBlob.fromBytes(bytes);
          
          if (onProgress) {
            blob = blob.withUploadProgress((percentage) => {
              onProgress(file.name, percentage);
            });
          }

          const response = await actor.uploadFile(
            file.name,
            file.type || 'application/octet-stream',
            BigInt(file.size),
            blob,
            null
          );

          return { id: response.id, file };
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        uploadedFiles.push(...chunkResults);
      }

      return uploadedFiles;
    },
    onSuccess: async () => {
      console.log('[useUploadFiles] Upload successful, refreshing gallery');
      // Invalidate and refetch all file queries, including inactive ones
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
      await queryClient.refetchQueries({ 
        queryKey: ['files', 'not-in-folder'], 
        type: 'all' // Refetch all matching queries, not just active ones
      });
      console.log('[useUploadFiles] Gallery refresh complete');
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('[useUploadFiles] Upload failed:', errorMessage);
      throw new Error(`Upload failed: ${errorMessage}`);
    },
  });
}

export function useCreateLink() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, url }: { name: string; url: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }

      const response = await actor.createLink(name, url, null, null);
      return { id: response.id, name, url };
    },
    onSuccess: async () => {
      console.log('[useCreateLink] Link created successfully, refreshing gallery');
      // Invalidate and refetch all file queries, including inactive ones
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
      await queryClient.refetchQueries({ 
        queryKey: ['files', 'not-in-folder'], 
        type: 'all' // Refetch all matching queries, not just active ones
      });
      console.log('[useCreateLink] Gallery refresh complete');
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('[useCreateLink] Create link failed:', errorMessage);
      throw new Error(`Failed to create link: ${errorMessage}`);
    },
  });
}
