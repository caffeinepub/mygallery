# Specification

## Summary
**Goal:** Fix mission creation so the Missions list refreshes immediately, and ensure task completion/progress state persists correctly across navigation and reloads.

**Planned changes:**
- Update the mission creation flow so the newly created mission is reflected immediately in the “Your Missions” list (including correct title, task count, and progress) without requiring a manual refresh.
- Eliminate runtime errors during/after mission creation (including within mutation callbacks) and keep list ordering consistent with existing sorting (newest first by created timestamp).
- Make task completion toggles in mission detail persist reliably, with immediate checkbox + progress bar updates, and consistent state when returning to the missions list or re-opening a mission.
- Ensure UI state stays consistent with persisted backend state on failures (avoid silent drift by reverting optimistic updates or re-syncing from backend).

**User-visible outcome:** After creating a mission, it appears instantly in “Your Missions” without errors; task checkmarks and mission progress update immediately and remain correct when navigating around the app, returning to the missions list, or reopening the mission.
