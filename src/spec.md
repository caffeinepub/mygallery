# Specification

## Summary
**Goal:** Make app startup and login feel immediately responsive for already-authenticated users by removing fixed blocking loaders and using progressive loading states.

**Planned changes:**
- Remove or significantly reduce any fixed-duration, blocking startup UI when an authenticated Internet Identity session is restored, so the Home screen becomes usable immediately.
- Change authenticated startup to progressively render the main layout right away and show lightweight placeholders/skeletons for folders/files/missions while data loads, avoiding full-page blocking spinners.
- Add opt-in startup performance timing logs (identity restoration, actor initialization, first successful initial data fetches) using the existing performance diagnostics toggle, with no extra console noise when disabled.

**User-visible outcome:** When opening the app while already signed in, the Home screen appears immediately and remains interactive while content loads progressively, with optional diagnostics logs available to verify startup performance.
