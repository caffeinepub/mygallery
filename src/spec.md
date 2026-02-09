# Specification

## Summary
**Goal:** Make task entry more visible during New Mission creation by moving it directly beneath the mission title input.

**Planned changes:**
- Reorder the New Mission dialog layout in `frontend/src/components/MissionEditorDialog.tsx` so the “Add a new task…” input row (and add button) appears immediately under the mission title input.
- Render the tasks list immediately below the task input row so newly added tasks are visible without scrolling.
- Keep Create Mission and Cancel actions unchanged in placement/behavior (including disabled/loading states).

**User-visible outcome:** When creating a new mission, users can add tasks directly under the title and immediately see the growing task list beneath, without needing to scroll to find either section.
