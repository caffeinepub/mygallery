# MYL PWA Installability Verification

This document provides a comprehensive checklist for verifying that MYL meets all Chrome PWA installability criteria for Android.

## Prerequisites

- **Secure Context**: The app must be served over HTTPS (or localhost for testing)
- **Service Worker**: Must be registered and active with a fetch event handler
- **Web App Manifest**: Must be valid and include required fields
- **Icons**: Must include at least one icon of 192x192 or larger

## Chrome DevTools Verification Steps

### 1. Check Manifest (Application → Manifest)

Open Chrome DevTools → Application → Manifest and verify:

- ✅ **Name**: "MYL"
- ✅ **Short Name**: "MYL"
- ✅ **Start URL**: "/"
- ✅ **Display Mode**: "standalone"
- ✅ **Theme Color**: "#6A0DAD" (purple)
- ✅ **Background Color**: "#ffffff" (white)
- ✅ **Icons**: At least one 192x192 and one 512x512 icon
  - `/assets/generated/myl-bullseye-icon.dim_192x192.png`
  - `/assets/generated/myl-bullseye-icon.dim_512x512.png`
- ✅ No errors or warnings displayed

### 2. Check Service Worker (Application → Service Workers)

Open Chrome DevTools → Application → Service Workers and verify:

- ✅ Service Worker status: "activated and is running"
- ✅ Source: `/sw.js`
- ✅ After reload: `navigator.serviceWorker.controller` is non-null (check in Console)

### 3. Check Installability (Application → Manifest)

In the Manifest pane, look for:

- ✅ "Add to home screen" or "Install" link is available
- ✅ No installability errors listed

### 4. Test Installation on Android Chrome

On an Android device with Chrome:

1. Navigate to your app URL (must be HTTPS)
2. Open Chrome menu (three dots)
3. ✅ Verify "Install app" or "Add to Home screen" option appears
4. Tap to install
5. ✅ App icon appears on home screen with the purple bullseye icon
6. Launch the installed app
7. ✅ App opens in standalone mode (no browser address bar)
8. ✅ Status bar color matches theme color (#6A0DAD)

## Common Issues and Solutions

### Issue: "Install app" option not appearing

**Possible causes:**
- Not served over HTTPS (localhost is OK for testing)
- Service Worker not registered or not active
- Manifest missing or invalid
- Icons missing or wrong size
- Already installed (uninstall first to test again)

**Solutions:**
1. Check DevTools Console for service worker registration errors
2. Verify manifest loads without 404 errors
3. Ensure icon files exist at specified paths
4. Clear site data and reload (DevTools → Application → Clear storage)

### Issue: Service Worker not activating

**Solutions:**
1. Check Console for registration errors
2. Verify `/sw.js` file exists and is accessible
3. Check for syntax errors in service worker code
4. Try "Update on reload" in DevTools → Application → Service Workers
5. Clear all caches and reload

### Issue: Icons not loading

**Solutions:**
1. Verify icon files exist at:
   - `/assets/generated/myl-bullseye-icon.dim_192x192.png`
   - `/assets/generated/myl-bullseye-icon.dim_512x512.png`
2. Check Network tab for 404 errors
3. Ensure paths in manifest.json match actual file locations
4. Clear cache and reload

### Issue: App opens in browser instead of standalone

**Solutions:**
1. Verify `"display": "standalone"` in manifest.json
2. Uninstall and reinstall the app
3. Check that manifest is properly linked in index.html

## Testing Checklist

Before deploying, verify:

- [ ] App loads over HTTPS (or localhost)
- [ ] Manifest loads without errors
- [ ] Both icon files (192x192 and 512x512) load successfully
- [ ] Service Worker registers and activates
- [ ] `navigator.serviceWorker.controller` is non-null after reload
- [ ] "Install app" appears in Chrome menu on Android
- [ ] App installs successfully
- [ ] Installed app opens in standalone mode
- [ ] App icon displays correctly on home screen
- [ ] Theme color (#6A0DAD) applies to status bar

## Additional Resources

- [Chrome PWA Installability Criteria](https://web.dev/install-criteria/)
- [Web App Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
