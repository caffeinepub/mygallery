# Specification

## Summary
**Goal:** Make the app render immediately on startup and prevent it from getting stuck on an infinite “Initializing…” state.

**Planned changes:**
- Remove any timeout-based or artificial startup gating that blocks initial rendering, so the UI shows immediately after mount.
- Make actor/access-control initialization non-blocking and fail-fast: if initialization fails, show a clear error state instead of an endless spinner.
- Add recovery actions to the initialization error state: “Retry” to re-attempt initialization and “Sign Out” to clear session and return to login.
- Avoid initializing/creating the backend actor during unauthenticated startup; only initialize when an authenticated session (or authenticated-only action) requires it.
- Ensure authenticated-only data queries remain disabled until identity is present and actor initialization has succeeded.

**User-visible outcome:** On cold load, users immediately see the login screen (when signed out) or the main UI/loading state (when signed in) without a deliberate delay, and any initialization failure shows an actionable error screen with Retry and Sign Out rather than staying stuck on “Initializing…”.
