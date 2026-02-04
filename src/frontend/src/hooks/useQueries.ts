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
        throw new Error('Failed to create folder');
      }
      return { folderId, name };
    },
    onSuccess: async () => {
      // Invalidate and force refetch, ensuring the query runs even if not previously active
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      await queryClient.refetchQueries({ 
        queryKey: ['folders'], 
        type: 'all' // Refetch all matching queries, not just active ones
      });
    },
    onError: (error) => {
      console.error('Folder creation failed:', getActorErrorMessage(error));
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
      console.error('Folder rename failed:', getActorErrorMessage(err));
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
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
      console.error('Folder deletion failed:', getActorErrorMessage(err));
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
      if (context?.previousFolderFiles) {
        queryClient.setQueryData(['files', 'folder', folderId.toString()], context.previousFolderFiles);
      }
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
      console.error('Move files failed:', getActorErrorMessage(err));
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousTargetFiles) {
        queryClient.setQueryData(['files', 'folder', folderId.toString()], context.previousTargetFiles);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['files'] });
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
      console.error('Remove from folder failed:', getActorErrorMessage(error));
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
      
      return { previousMainFiles, previousFolderFiles, fileId };
    },
    onError: (err, _, context) => {
      console.error('Delete file failed:', getActorErrorMessage(err));
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousFolderFiles) {
        context.previousFolderFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
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
      
      return { previousMainFiles, previousFolderFiles, fileIds };
    },
    onError: (err, _, context) => {
      console.error('Delete files failed:', getActorErrorMessage(err));
      if (context?.previousMainFiles) {
        queryClient.setQueryData(['files', 'not-in-folder'], context.previousMainFiles);
      }
      if (context?.previousFolderFiles) {
        context.previousFolderFiles.forEach((files, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, files);
        });
      }
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
            blob
          );

          return { id: response.id, file };
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        uploadedFiles.push(...chunkResults);
      }

      return uploadedFiles;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['files', 'not-in-folder'] });
      await queryClient.refetchQueries({ queryKey: ['files', 'not-in-folder'], type: 'active' });
    },
    onError: (error) => {
      console.error('Upload failed:', getActorErrorMessage(error));
    },
  });
}
