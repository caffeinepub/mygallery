# Specification

## Summary
**Goal:** Make MYL fully installable as an Android Chrome PWA with correct branding, manifest configuration, and service worker setup so it launches in standalone mode.

**Planned changes:**
- Update `frontend/public/manifest.json` to set MYL name/short name, colors, `display: "standalone"`, and include exactly 192x192 and 512x512 PNG icons using the generated MYL bullseye icon files.
- Update `frontend/index.html` PWA-related metadata to use MYL app name, set `theme-color` to `#6A0DAD`, and ensure the manifest link points to `/manifest.json`.
- Ensure service worker registration remains enabled in `frontend/index.html` and that `frontend/public/sw.js` includes an active `fetch` handler and controls the page after reload.
- Verify installability signals so Android Chrome shows an install option and the installed app opens without browser UI (standalone).

**User-visible outcome:** On Android Chrome, MYL can be installed from the browser menu and launches as a standalone app (no address bar) with MYL name, purple theme color, and correct icons.
