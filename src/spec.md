# Specification

## Summary
**Goal:** Increase the intro/splash overlay total on-screen duration to approximately 2 seconds before it completes and dismisses.

**Planned changes:**
- Adjust the intro/splash overlay timing so it waits ~2000ms from mount before calling `onComplete` and being removed.
- Ensure any existing fade/transition timing aligns with the 2-second duration (no premature completion).

**User-visible outcome:** The splash/intro overlay remains visible for about 2 seconds before the app’s main screen appears, with no other behavior changes.
