import { useMemo } from 'react';
import { useGetFilesNotInFolder } from './useQueries';

/**
 * Hook that determines which files are unorganized (not in any folder or mission)
 * Returns a Set of unorganized file IDs for efficient lookup
 */
export function useFileOrganizationStatus() {
  const { data: rootFiles, isLoading } = useGetFilesNotInFolder();

  const unorganizedFileIds = useMemo(() => {
    if (!rootFiles) return new Set<string>();
    
    // Files are unorganized if they have no folderId and no missionId
    const unorganized = rootFiles.filter(
      file => file.folderId === undefined && file.missionId === undefined
    );
    
    return new Set(unorganized.map(file => file.id));
  }, [rootFiles]);

  return {
    unorganizedFileIds,
    isLoading,
    unorganizedCount: unorganizedFileIds.size,
  };
}
