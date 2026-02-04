# Specification

## Summary
**Goal:** Update the unauthenticated welcome screen subtitle text under “Welcome to MyGallery” to the provided English copy.

**Planned changes:**
- Update the subtitle/intro text in `frontend/src/components/WelcomeIntroScreen.tsx` to exactly:
  - "This is your personal space for organization and self-improvement.
Create missions, break them into tasks, and complete them step by step."
- Ensure no other user-facing text is changed.

**User-visible outcome:** When logged out, users see the “Welcome to MyGallery” heading with the updated two-sentence English subtitle displayed exactly as provided (including the line break).
