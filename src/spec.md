# Specification

## Summary
**Goal:** Make the “New Mission” creation dialog usable on mobile by showing the mission title, task add row, and primary actions immediately without requiring scroll.

**Planned changes:**
- Update `MissionEditorDialog` layout for small viewports so the mission title input, “Add a new task…” input + add button, and Cancel/Create Mission buttons are all visible on open.
- Constrain scrolling to the tasks list area only when tasks exceed available space, keeping the task input row and action buttons pinned/accessible.
- Preserve all existing mission creation behavior (validation, toasts, create action, and close behavior) with no changes outside the Mission creation UI and any directly-required wiring.

**User-visible outcome:** On mobile-sized screens, users can open “New Mission” and immediately enter a title, add tasks, and tap Cancel/Create without scrolling; only the growing tasks list scrolls if needed.
