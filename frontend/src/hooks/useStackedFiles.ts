import { create } from 'zustand';
import type { FileMetadata } from '@/backend';

interface StackedFilesState {
  stackedFiles: FileMetadata[];
  addFiles: (files: FileMetadata[]) => void;
  removeFiles: (fileIds: string[]) => void;
  clearStack: () => void;
}

export const useStackedFiles = create<StackedFilesState>((set) => ({
  stackedFiles: [],
  addFiles: (files) =>
    set((state) => ({
      stackedFiles: [...state.stackedFiles, ...files],
    })),
  removeFiles: (fileIds) =>
    set((state) => ({
      stackedFiles: state.stackedFiles.filter((f) => !fileIds.includes(f.id)),
    })),
  clearStack: () => set({ stackedFiles: [] }),
}));
