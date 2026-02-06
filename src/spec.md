# Specification

## Summary
**Goal:** Prevent the app from getting stuck on an indefinite “Loading...” screen during Internet Identity startup, and make startup/actor readiness states usable and clear.

**Planned changes:**
- Add a deterministic timeout for Internet Identity initialization; if initialization exceeds the threshold, replace the spinner-only view with a fallback screen in English that lets users retry/reload and reach the welcome/login screen.
- Update startup UI so that when a user is authenticated but the backend actor is not ready, the main app shell renders with a clear “Connecting…” indicator and disables actor-dependent actions until readiness.
- Ensure actor-dependent controls automatically enable and data loads when actor status transitions to `ready`, without requiring a manual refresh; show existing error UI with working Retry and Sign out if initialization ultimately fails.

**User-visible outcome:** Users are no longer trapped on a perpetual loading screen; they can always reach login and use the app shell during startup, see connection status, and core actions become available automatically once the backend actor is ready.
