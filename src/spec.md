# Specification

## Summary
**Goal:** Fix mission task auto-save so task/title changes reliably persist and always display correctly when revisiting an existing mission.

**Planned changes:**
- Ensure add/toggle/remove task actions in the Mission detail view automatically persist to the backend for existing missions (no manual save), including after reopening a mission.
- Keep the Mission detail task list UI in sync with the latest saved mission data to avoid stale task lists or duplicate tasks after autosave/caching updates.
- Adjust autosave trigger/debounce logic to only save after user-initiated edits (title/tasks) and prevent unintended saves on initial load or when switching between missions.

**User-visible outcome:** Users can open an existing mission, add/complete/remove tasks (and edit the title) and have changes autosave reliably; reopening the mission shows the latest tasks without missing items, stale state, or duplicates.
