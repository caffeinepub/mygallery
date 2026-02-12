# Specification

## Summary
**Goal:** Hide/suppress all automated in-app system toast notifications so they never render in the UI.

**Planned changes:**
- Disable or remove the global toast renderer (e.g., Sonner toaster) so automated success/error/info toasts are not displayed.
- Ensure any toast-triggering calls no longer result in visible UI notifications, without changing underlying action behavior or logic.

**User-visible outcome:** Actions that previously showed automated toast messages (e.g., “Mission created successfully”) will no longer display any toast notifications, while the rest of the app behaves the same.
