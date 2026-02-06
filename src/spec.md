# Specification

## Summary
**Goal:** Ensure the gallery bulk action bar stays visually and interactively above the floating Folders/Missions buttons during multi-select.

**Planned changes:**
- Adjust UI stacking order (e.g., z-index/positioning) so the bulk action bar overlays the floating Folders/Missions buttons whenever multi-select is active and at least one item is selected.
- Ensure pointer/tap interactions prioritize the bulk action bar actions (Folder, Mission, Share, Download, Delete) while it is visible, even if it overlaps the floating buttons.
- Restore the floating Folders/Missions buttons’ normal stacking/visibility once multi-select mode ends.

**User-visible outcome:** In gallery multi-select with at least one item selected, the bulk action bar is always clearly visible and tappable (not hidden behind the floating Folders/Missions buttons), and the floating buttons behave normally again after exiting multi-select.
