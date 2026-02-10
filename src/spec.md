# Specification

## Summary
**Goal:** Make Mission task completion toggles update the Mission detail UI immediately and stay consistent after the mutation resolves.

**Planned changes:**
- Update `MissionDetailFullScreenView` task checkbox handling to apply an immediate local/React Query cache update for the toggled task (complete ↔ incomplete), so the checkbox state, line-through styling, and progress counters/bar update instantly.
- Ensure post-mutation syncing uses the latest mission detail data from the React Query cache (not a stale `selectedMission`/component reference) so autosave cannot overwrite the newly toggled completion state.

**User-visible outcome:** In the Mission detail screen, toggling any task’s checkbox immediately updates the UI (including progress) in both directions and does not revert after the backend call completes.
