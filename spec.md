# MYL

## Current State
HomeCollectionsPanel uses the legacy `useActor()` hook instead of `useBackendActor()` from ActorContext. The `useActor` hook creates a separate second actor and has a useEffect that calls `queryClient.invalidateQueries` + `queryClient.refetchQueries` for ALL queries whenever the actor changes, causing cascading refetch loops and loading delays across the entire app. All other hooks (useQueries, useMissionsQueries, useNotesQueries, etc.) correctly use `useBackendActor()`.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `HomeCollectionsPanel.tsx`: Replace `useActor()` with `useBackendActor()` + `useInternetIdentity()`. Update query `enabled` conditions from `!!actor && !actorFetching` to `!!actor && status === 'ready' && !!identity`.

### Remove
- `useActor` import and usage from `HomeCollectionsPanel.tsx`

## Implementation Plan
1. In `HomeCollectionsPanel.tsx`, remove `import { useActor } from "../hooks/useActor"`
2. Add `import { useBackendActor } from "@/contexts/ActorContext"`
3. Add `import { useInternetIdentity } from "@/hooks/useInternetIdentity"`
4. Replace `const { actor, isFetching: actorFetching } = useActor()` with `const { actor, status } = useBackendActor()` and `const { identity } = useInternetIdentity()`
5. Update both query `enabled` conditions to use `!!actor && status === 'ready' && !!identity`
