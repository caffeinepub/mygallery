# Specification

## Summary
**Goal:** Fix frontend deletion bugs for the first created folder/mission (id 0) and prevent erroneous “Unable to Open Link” messages after successfully opening mission link attachments.

**Planned changes:**
- Update the Folders delete UI flow to correctly handle deleting the first folder (id 0) as well as any other folder.
- Update the Missions delete UI flow to correctly handle deleting the first mission (id 0) as well as any other mission (including from any relevant mission views where deletion is available).
- Adjust mission link-attachment opening behavior so the “Unable to Open Link” fallback appears only when the link truly fails to open (not after returning from a successfully opened link).

**User-visible outcome:** Users can delete their first and subsequent folders/missions via the normal confirmation dialog flow, and opening a mission link no longer triggers an incorrect “Unable to Open Link” message after returning to the app.
