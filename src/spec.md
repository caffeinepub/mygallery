# Specification

## Summary
**Goal:** Add touch-only, iOS-style swipe-left actions for list rows in Folders, Notes, and Missions, while keeping desktop interactions unchanged.

**Planned changes:**
- Implement swipe-left (right-to-left) gesture on touch/mobile for Folder list rows to reveal persistent “Edit” and red “Delete” actions.
- Implement the same swipe-to-reveal persistent actions for Note list rows, wiring “Edit” to the existing note title edit flow and “Delete” to the existing delete flow.
- Implement the same swipe-to-reveal persistent actions for Mission list rows, wiring “Edit” to the existing mission title edit flow and “Delete” to the existing delete flow.
- Ensure revealed actions remain open until dismissed (swipe back, tap outside, or opening another row) and ensure swipe behavior is disabled on non-touch/desktop.

**User-visible outcome:** On mobile/touch devices, users can swipe left on Folder/Note/Mission rows to reveal “Edit” and “Delete” buttons that stay visible until dismissed; on desktop, the lists behave exactly as before.
