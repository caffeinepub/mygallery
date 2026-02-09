# Specification

## Summary
**Goal:** Make the app consistently installable as a fully recognized PWA across major browsers without changing any UI or app features.

**Planned changes:**
- Ensure `frontend/public/manifest.json` is valid and meets installability requirements (name, short_name, start_url within scope, `display: "standalone"`, and working 192x192 + 512x512 PNG icon entries).
- Ensure the manifest is discoverable by adding/keeping a single `<link rel="manifest" href="/manifest.json">` in `frontend/index.html` (not conditional).
- Add minimal service worker registration for `/sw.js` from `frontend/index.html`, only in supported/secure contexts, without altering app flows.
- Ensure `frontend/public/sw.js` is minimal but installability-friendly: includes a `fetch` handler, avoids interfering with cross-origin and API/canister calls, and provides a reliable navigation fallback.
- Verify and fix any remaining installability blockers (secure context, reachable start URL, no manifest/SW console errors) so browser install UI/prompts are available.

**User-visible outcome:** The app can be installed from supported browsers (e.g., Chrome/Edge, and where applicable others) as a standalone PWA, with no changes to the app’s UI or behavior.
