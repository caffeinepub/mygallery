# Specification

## Summary
**Goal:** Automatically treat 100%-complete missions as archived and let users switch between Incomplete and Completed mission lists via swipe or on-screen controls.

**Planned changes:**
- Derive mission status in the Missions full-screen view: missions with at least 1 task and 100% progress are classified as **Completed** (archived); all others are **Incomplete** (including missions with 0 tasks).
- Default the Missions screen to show the **Incomplete** list when opened.
- Add horizontal list-level navigation in Missions: swipe right to view **Completed**, swipe left to return to **Incomplete**, plus a visible tappable control (English labels: “Incomplete” / “Completed”) to switch without swiping.
- Ensure swipe gestures for list switching do not conflict with existing per-row swipe actions (edit/delete) and close any open row swipe actions when switching lists.
- Support deleting missions from the **Completed** list via the same swipe-delete behavior as the current Missions list, with immediate UI updates.
- If a task is marked incomplete inside a completed mission’s detail view, reclassify it as **Incomplete** so it moves back to the Incomplete list automatically.

**User-visible outcome:** Opening Missions shows only incomplete missions by default; users can swipe or tap to view completed (archived) missions, delete missions from either list via swipe actions, and missions move between lists automatically as task completion changes.
