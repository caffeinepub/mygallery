# Specification

## Summary
**Goal:** Fix folder creation so it works reliably in all states and update the folders list to show rename/delete actions only after a swipe reveal.

**Planned changes:**
- Fix the folder creation flow so creating a folder works whether the folders list is empty or already populated, and the newly created folder appears in the list immediately without requiring reload/navigation/refresh.
- Ensure folder creation does not depend on a previously populated folders query (works on first-time use).
- Add error handling so failed folder creation shows an error and does not insert a phantom folder entry into the list.
- Update the folders list rows so rename and delete actions are hidden by default and only revealed via a left-swipe gesture.
- Ensure swipe actions behavior supports: one row open at a time, tapping/clicking outside closes, and works on touch (and remains usable with pointer input) without showing actions by default.

**User-visible outcome:** Users can always create new folders and see them appear instantly in the folders list, and folder rename/delete actions are only shown after swiping a folder row (with proper open/close behavior).
