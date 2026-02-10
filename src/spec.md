# Specification

## Summary
**Goal:** Make mission task completion checkbox clicks update immediately and stay correct in the mission detail screen.

**Planned changes:**
- Update task completion toggling in `MissionDetailFullScreenView` to apply an optimistic UI update so checkbox state changes immediately on click.
- Adjust `useToggleTaskCompletion` to optimistically update the React Query cache for `['missions','detail',<missionId>]`, and also update `['missions','list']` if that UI shows task completion/progress.
- Ensure optimistic updates correctly roll back on mutation failure so the UI returns to the prior correct state.
- Sync the mission autosave baseline after task add/toggle mutations using the latest tasks state (from React Query cache or mutation result) to avoid stale state causing incorrect follow-up saves.

**User-visible outcome:** In mission details, checking/unchecking tasks updates instantly and reliably (even with rapid clicks), mission progress stays in sync without waiting for refetch, and task changes don’t get overwritten by stale autosave state.
