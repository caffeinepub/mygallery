# Specification

## Summary
**Goal:** Ensure moving files out of folders updates the gallery UI immediately and correctly (without waiting for refetch) across missions, other folders, and the main collection.

**Planned changes:**
- Update React Query cache/optimistic update logic for “move file(s) from folder → mission” so destination mission lists update immediately and source folder lists remove the moved files immediately, even when the file is not present in the main/root cache.
- Update React Query cache/optimistic update logic for “move file(s) from folder → another folder” so destination folder lists update immediately and source folder lists remove the moved files immediately, even when the file is not present in the main/root cache.
- Verify and adjust the existing “return to main collection” flow so moved files appear immediately in the main/root list and disappear immediately from the folder list, without affecting other gallery behaviors.

**User-visible outcome:** When moving one or more files from a folder to a mission, another folder, or back to the main collection, the file lists update immediately in both the source and destination views without requiring a manual refresh.
