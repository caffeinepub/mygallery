# Specification

## Summary
**Goal:** Enable in-app inline previews for common document types (PDF and Office files) so users can read them inside MyGallery without downloading or opening an external/native app.

**Planned changes:**
- Update file open/click handling so PDF and Office document types (the `pdf` and `office` categories in `frontend/src/utils/filePreview.ts`) default to opening in the in-app viewer flow rather than downloading or redirecting.
- Update existing viewers (at minimum `FullScreenViewer` and `FilePreviewDialog`) to render Office documents inline (e.g., iframe/embed/viewer) instead of showing an external-only “Open in app” UI.
- Keep all other UI, navigation, and non-file-opening behavior unchanged.

**User-visible outcome:** When a user clicks/taps a PDF, Word, Excel, or PowerPoint file from the gallery (and in existing preview surfaces), the document opens inline within the app for reading, without triggering a download and without leaving the SPA.
