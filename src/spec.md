# Specification

## Summary
**Goal:** Fix the Mission task completion toggle bug that occurs after re-entering a mission and adding a new task, ensuring task toggles and mission progress update immediately and correctly.

**Planned changes:**
- Fix Mission detail UI state so toggling completion on any task (existing or newly added) updates instantly and only affects the intended task.
- Keep React Query caches consistent after add-task and toggle-task mutations for both mission detail (`['missions','detail', missionId]`) and mission list (`['missions','list']`), preventing regressions or incorrect task state propagation.
- Adjust Mission autosave (`useMissionAutosave`) behavior to avoid overwriting/reverting task completion state during optimistic-to-backend task ID transitions, and prevent persisting temporary optimistic IDs or duplicating tasks.

**User-visible outcome:** After re-opening a mission and adding a new task, the user can immediately check/uncheck any task and see correct, instant task state + progress updates that persist when leaving and returning to the mission—without needing navigation or refresh.
