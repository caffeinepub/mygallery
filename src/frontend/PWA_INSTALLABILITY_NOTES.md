# PWA Installability Verification Guide

This document provides a checklist for verifying that MyGallery meets Chrome's PWA installability criteria.

## Chrome PWA Installability Requirements

For Chrome to show the Install button (in the omnibox or menu), the following criteria must be met:

### 1. Secure Context ✅
- **Requirement**: App must be served over HTTPS or localhost
- **Verification**: Check the URL protocol in the browser address bar
- **Status**: Automatically satisfied on localhost during development and on HTTPS in production

### 2. Valid Web App Manifest ✅
- **Requirement**: A valid `manifest.json` with required fields
- **Verification Steps**:
  1. Open Chrome DevTools (F12)
  2. Go to **Application** tab → **Manifest** section
  3. Verify all fields are present and valid:
     - ✅ `name`: "MyGallery"
     - ✅ `short_name`: "MyGallery"
     - ✅ `start_url`: "/"
     - ✅ `display`: "standalone"
     - ✅ `icons`: Array with 192x192 and 512x512 PNG icons
     - ✅ `theme_color`: "#3b82f6"
     - ✅ `background_color`: "#ffffff"
  4. Check for any errors or warnings in the Manifest section

### 3. Valid Icons ✅
- **Requirement**: At least one icon of 192x192 pixels and one of 512x512 pixels
- **Icon Paths**:
  - 192x192: `/assets/generated/mygallery-mission-icon-192.dim_192x192.png`
  - 512x512: `/assets/generated/mygallery-mission-icon-512.dim_512x512.png`
- **Verification Steps**:
  1. In DevTools → **Application** → **Manifest**, check the Icons section
  2. Verify both icons load without errors (no red X or broken image)
  3. Click on each icon to preview it
  4. Ensure icons are valid PNG files at the stated dimensions

### 4. Service Worker ✅
- **Requirement**: A registered and active service worker with a fetch handler
- **Verification Steps**:
  1. Open Chrome DevTools → **Application** tab → **Service Workers** section
  2. Verify `/sw.js` is listed
  3. Check status shows: **"activated and is running"**
  4. Verify the service worker has a fetch event handler (present in `/sw.js`)
  5. After page reload, check that `navigator.serviceWorker.controller` is not null:
     ```javascript
     // Run in Console:
     navigator.serviceWorker.controller
     // Should return: ServiceWorker object (not null)
     ```

### 5. Start URL Loads Successfully ✅
- **Requirement**: The `start_url` specified in manifest must load without errors
- **Verification**: Navigate to the root path `/` and verify the app loads correctly

## How to Test Installability

### Desktop Chrome
1. Open the app in Chrome (HTTPS or localhost)
2. Look for the **Install** icon in the omnibox (address bar) - typically a ⊕ or 💻 icon
3. Alternatively, click the three-dot menu → **Install MyGallery...**
4. If the Install option appears, the PWA is installable ✅

### Mobile Chrome (Android)
1. Open the app in Chrome on Android
2. Look for the **Add to Home Screen** banner or prompt
3. Alternatively, tap the three-dot menu → **Add to Home Screen** or **Install app**
4. If the option appears, the PWA is installable ✅

### Installed App Behavior
Once installed, verify:
- ✅ App opens in a **standalone window** (no browser UI/address bar)
- ✅ App icon appears on desktop/home screen
- ✅ App name is "MyGallery"
- ✅ Theme color matches the app design

## Troubleshooting

### Install Button Not Showing
1. **Check DevTools Console** for errors during service worker registration
2. **Verify Manifest** in DevTools → Application → Manifest (no errors/warnings)
3. **Check Service Worker** status in DevTools → Application → Service Workers
4. **Verify Icons** load correctly in DevTools → Application → Manifest → Icons
5. **Clear Cache** and reload: DevTools → Application → Clear storage → Clear site data
6. **Hard Reload**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Service Worker Not Activating
1. Check DevTools → Application → Service Workers
2. If stuck in "waiting" state, click **skipWaiting** button
3. Verify no console errors during registration
4. Try unregistering and re-registering:
   ```javascript
   // In Console:
   navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
   // Then reload the page
   ```

### Icons Not Loading
1. Verify icon files exist at the specified paths
2. Check Network tab in DevTools for 404 errors on icon requests
3. Ensure icon files are valid PNG format
4. Verify icon dimensions match the manifest declarations

## Additional Resources
- [Chrome PWA Installability Criteria](https://web.dev/install-criteria/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
