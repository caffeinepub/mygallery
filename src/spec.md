# Specification

## Summary
**Goal:** Add an “All files” control to Gallery selection mode so users can select (and optionally clear) the entire currently displayed set of items in one action.

**Planned changes:**
- Add a visible “All files” option/button within the Gallery bulk-selection controls (selection mode only).
- When “All files” is used, select every item currently shown in the Gallery (current view: main collection or currently opened folder) and update selected visuals and selected count accordingly.
- Provide a single-action way to undo the “All files” selection (e.g., toggle to deselect all or a “Clear selection” control) without altering existing Gallery flows.
- Ensure existing bulk actions (move to folder, move to mission, download, share, delete) operate on the selected set exactly as they do today, with no other behavior changes.

**User-visible outcome:** In Gallery selection mode, users can tap “All files” to instantly select everything currently displayed (in the current view) and then run existing bulk actions on the full set, and can also clear that selection in a single action.
