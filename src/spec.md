# Specification

## Summary
**Goal:** Disable all automated in-app toast/notification popups (Sonner toasts) across the app without changing any underlying functionality or user flows.

**Planned changes:**
- Remove/disable the global Sonner toaster UI so no toast popups can render.
- Remove/disable all frontend calls that trigger Sonner toast notifications (success, info, and error), ensuring no automated toast messages appear.
- Clean up related imports/usages to keep the frontend building without TypeScript errors.

**User-visible outcome:** Users can create/delete missions and perform all existing actions as before, but no automated toast/notification popups (including success/error/info) appear anywhere in the app.
