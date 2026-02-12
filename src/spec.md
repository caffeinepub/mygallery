# Specification

## Summary
**Goal:** Make multi-file gallery uploads run non-blocking in the background with accurate, reliable progress reporting and improved throughput, without changing unrelated app behavior.

**Planned changes:**
- Move multi-file upload file-processing work off the main UI thread so the app remains responsive while uploads run.
- Keep uploads running and tracked even when the user navigates away from the gallery/upload UI within the SPA.
- Fix progress tracking to deterministically associate progress with the correct file items (including same-name files) and keep the global progress bar visible/updating until the whole batch completes (success or failure).
- Increase multi-file upload speed using controlled parallelism (limited concurrency) and reduce redundant expensive work such as duplicate file reads/byte conversions.
- Persist in-progress multi-file uploads best-effort and automatically resume them after reload/close, restoring progress correctly and avoiding duplicate uploads for already-completed items.

**User-visible outcome:** Users can select many (including large) gallery files and continue using other parts of the app while uploads proceed at maximum practical speed, with a global progress bar that stays accurate and resumes correctly after reload.
