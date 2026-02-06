/**
 * Developer-facing diagnostics helper for React Query cache state
 * Used to identify whether delete failures are frontend caching/mutations or backend logic
 */

import { QueryClient } from '@tanstack/react-query';
import type { Mission } from '@/backend';

export interface CacheDiagnostics {
  entityId: string;
  inListCache: boolean;
  inDetailCache: boolean;
  listCacheSize: number;
}

export function diagnoseMissionCache(
  queryClient: QueryClient,
  missionId: bigint
): CacheDiagnostics {
  const missionIdStr = missionId.toString();
  const listData = queryClient.getQueryData<Mission[]>(['missions', 'list']);
  const detailData = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionIdStr]);

  return {
    entityId: missionIdStr,
    inListCache: listData ? listData.some(m => m.id.toString() === missionIdStr) : false,
    inDetailCache: detailData !== undefined,
    listCacheSize: listData?.length ?? 0,
  };
}

export function logDeleteMutationLifecycle(
  phase: 'onMutate' | 'onSuccess' | 'onError' | 'onSettled',
  entityType: 'mission',
  entityId: string,
  diagnostics: CacheDiagnostics,
  error?: unknown
) {
  const prefix = `[${entityType.toUpperCase()} DELETE ${phase.toUpperCase()}]`;
  console.log(`${prefix} ID: ${entityId}`);
  console.log(`${prefix} In list cache: ${diagnostics.inListCache}`);
  console.log(`${prefix} In detail cache: ${diagnostics.inDetailCache}`);
  console.log(`${prefix} List cache size: ${diagnostics.listCacheSize}`);
  
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${prefix} Error: ${errorMessage}`);
  }
}

export function formatActorError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
