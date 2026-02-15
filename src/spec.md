# Specification

## Summary
**Goal:** Remove the visible “MyGallery” text from the top-left header area on the home page while keeping the app icon and all functionality unchanged.

**Planned changes:**
- Update `frontend/src/components/Header.tsx` to stop rendering the “MyGallery” header text (currently an `<h1>`) next to the app icon.
- Ensure no other UI elements, layout behavior (beyond the text removal), routes, animations, or app functionality are modified.

**User-visible outcome:** On the home page, the top-left header shows the app icon without the “MyGallery” text, with everything else behaving the same as before.
