# Specification

## Summary
**Goal:** Replace the collection area with an animated floating stack for uploaded files, and add a dedicated file management page accessible by tapping the stack.

**Planned changes:**
- Hide the collection area completely
- After upload completion, display files in Gallery for 2-3 seconds, then animate them with a smooth slide transition to a floating stack positioned on the right side above the mission icon
- Design the floating stack with 3-5px diagonal offset between cards and a badge showing total file count
- Tapping the stack opens a new full-screen page displaying all uploaded files as scrollable thumbnails matching the gallery layout
- Enable single and bulk file selection in the stack page with actions to send to folders/missions, share, download, and delete
- Remove files from the floating stack and update the badge count when files are moved to folders/missions or deleted

**User-visible outcome:** Users upload files to the gallery, watch them animate into a compact floating stack with a file count badge, then tap the stack to access a dedicated file management page where they can organize, share, download, or delete their uploaded files.
