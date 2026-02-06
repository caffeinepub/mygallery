# Specification

## Summary
**Goal:** Prevent the erroneous “Unable to Open Link” fallback dialog from appearing after a gallery link successfully opens and the user returns to the app.

**Planned changes:**
- Update the gallery link click/open handler logic so the fallback dialog is shown only when opening is truly blocked/failed (not triggered by leaving and returning to the app).
- If needed, incorporate page visibility/focus detection and/or a short delay before showing the fallback to confirm whether an external page/tab actually opened.

**User-visible outcome:** Tapping a gallery link opens it externally when possible, and returning to the app after closing the link no longer triggers an “Unable to Open Link” message; the fallback dialog still appears for real open failures and remains usable (retry/copy).
