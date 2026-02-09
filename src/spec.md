# Specification

## Summary
**Goal:** Improve Mission task add/toggle responsiveness and make swipe-to-delete missions feel immediate and reliable.

**Planned changes:**
- Update the Mission detail screen so newly added tasks appear instantly (optimistic UI) and remain consistent after the create call completes.
- Ensure the Mission detail screen refreshes/reloads the latest task list when re-entering the same mission after navigating elsewhere, preventing missing/duplicated tasks and avoiding input/list glitches.
- Fix task completion toggling to be smooth and isolated (no changes to other tasks), with immediate mission progress updates and per-task rollback on failure.
- Make swipe-to-delete in the Missions list remove the mission row immediately (optimistic removal), keep list state consistent after success, rollback + show an error toast on failure, and reset/close swipe row state correctly.

**User-visible outcome:** Tasks in a mission can be added and toggled instantly and reliably (even after leaving and returning), mission progress updates immediately, and swiping to delete a mission removes it from the list right away while staying consistent if the operation succeeds or fails.
