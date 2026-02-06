# Specification

## Summary
**Goal:** Adjust the post-login splash/intro experience so it shows only the animated gallery icon and reliably appears once on every app open/refresh when the user is already signed in.

**Planned changes:**
- Update the splash/intro screen UI to remove any welcome/title text so only the centered animated gallery icon is displayed.
- Adjust the app’s splash triggering logic so authenticated app opens/refreshes show the splash once before navigating to the Home page, without affecting the unauthenticated welcome/login flow.

**User-visible outcome:** Signed-in users will see a clean, icon-only animated splash every time they open or refresh the app, then land on Home; signed-out users continue to see the normal unauthenticated welcome/login flow.
