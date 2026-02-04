# Specification

## Summary
**Goal:** Prevent the frequent “Service Unavailable / backend service is currently unavailable” screen on first open after deploy by adding a cold-start silent retry flow for backend actor initialization, with clear diagnostics and bounded retry behavior.

**Planned changes:**
- Diagnose and log the root cause of first-open initialization failures (frontend console + any available backend diagnostics) to distinguish canister-stopped/warm-up vs network vs access-control issues.
- Update frontend actor initialization so that on first open in a session, transient cold-start errors trigger silent background retries with capped backoff while keeping the UI in a loading/initializing state (no ActorInitErrorState).
- Add a session-scoped “initialized once” flag so that after a successful initialization, subsequent initialization failures show the existing ActorInitErrorState behavior.
- Unify canister-stopped/unavailable error classification into a shared detection method, used both for deciding cold-start silent retry and for ActorInitErrorState logic.
- Ensure retries are bounded and transition to a real error state if the backend stays unavailable beyond the configured retry window.

**User-visible outcome:** On the first open after a deploy, the app stays in a loading state and automatically recovers once the backend is ready instead of showing a “Service Unavailable” error; if the backend is genuinely down for too long, the app shows the normal error screen, and later failures (after a successful init) behave as they do today.
