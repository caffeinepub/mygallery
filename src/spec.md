# Specification

## Summary
**Goal:** Hide Edit/Rename/Delete swipe actions in Folders, Notes, and Missions until the user swipes left to reveal them, ensuring actions do not overlay row content when closed.

**Planned changes:**
- Update the shared SwipeActionsRow behavior so action buttons are fully hidden by default and only appear after a sufficient left-swipe reveal.
- Ensure closing the swipe (swiping back or resetting) fully hides actions again with no overlap on the row content.
- Apply the same swipe-to-reveal behavior consistently wherever SwipeActionsRow is used (Folders list, Notes list on coarse pointer devices, Missions list on coarse pointer devices) without backend changes.

**User-visible outcome:** In Folders, Notes (on mobile/coarse pointer), and Missions (on mobile/coarse pointer), list rows no longer show Edit/Rename/Delete buttons until you swipe left; closing the swipe hides the buttons completely and tapping the row behaves normally.
