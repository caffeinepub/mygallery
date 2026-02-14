# Specification

## Summary
**Goal:** Make swipe-to-delete in the full-screen Folders and Missions views actually delete the selected item and immediately reflect the change in the UI without manual refresh.

**Planned changes:**
- Fix the Folders swipe-to-delete action to invoke the backend delete, then update/refresh the folders list state (via React Query cache update/invalidation) so the deleted folder disappears after success.
- Fix the Missions swipe-to-delete action to invoke the backend delete, then update/refresh the missions list state (including the correct Incomplete/Completed tab) so the deleted mission disappears after success.
- Ensure backend delete methods remove the correct folder/mission for the authenticated caller, and add error handling so failed deletes show an error toast and do not remove (or roll back) the item.

**User-visible outcome:** Swiping a folder or mission row and confirming Delete removes it from the backend and it disappears from the list immediately (and stays gone when navigating, refetching, or switching mission tabs); failures show an error and do not affect other rows.
