# Draft Baseline Creation - Live Version 114

## Creation Date
February 3, 2026

## Purpose
Document the creation of a new Draft that is synced 1:1 with Live version 114 to restore versioning integrity.

## Baseline Source
**Live version 114** - The authoritative production state as of February 3, 2026

## Sync Procedure

### Step 1: Verification
- Confirmed all frontend files match Live v114 exactly
- No code drift detected between current state and Live v114
- All behavioral requirements verified (see RESTORE_LIVE_V114_CHECKLIST.md)

### Step 2: Draft Creation
- New Draft created from Live v114 state
- All frontend files copied exactly as they exist in Live v114
- No modifications, refactors, or improvements applied
- Strict 1:1 parity maintained

### Step 3: Parity Validation
The following critical aspects were validated for 1:1 parity:

#### Authentication & Session Management
- ✅ Internet Identity integration with 30-day session persistence
- ✅ Login flow: unauthenticated → login → intro → main app
- ✅ Subsequent visits: authenticated → main app (no intro)
- ✅ Sign-out clears all state and returns to login

#### Actor Initialization
- ✅ Background initialization after authentication
- ✅ Explicit state tracking: idle → initializing → ready/error
- ✅ Error handling with retry and sign-out options
- ✅ UI gating: main app only accessible when actor ready

#### UI/UX Behavior
- ✅ No "initializing" message on app open
- ✅ Intro screen shows once per session after login
- ✅ Immediate rendering without blocking delays
- ✅ Proper loading states during actor initialization
- ✅ Theme toggle (light/dark) working correctly

#### Component Hierarchy
- ✅ App.tsx: ThemeProvider → ActorProvider → UploadProvider → AppContent
- ✅ main.tsx: QueryClientProvider → InternetIdentityProvider → App
- ✅ HomePage.tsx: Conditional rendering based on auth + actor status
- ✅ All child components properly wired

#### Styling & Assets
- ✅ OKLCH color system in index.css
- ✅ Tailwind configuration matching v114
- ✅ PWA manifest with "MyGallery" branding
- ✅ Service worker with minimal precaching
- ✅ All assets referenced correctly

## Baseline File List
See V114_BASELINE_FRONTEND_FILES.txt for complete canonical list.

## Validation Results
✅ **PASS** - Draft is 1:1 identical to Live version 114

## Change Control
After this baseline creation:
- ❌ No further frontend changes should be made
- ❌ No refactoring, optimization, or improvements
- ❌ No feature additions or removals
- ✅ Wait for explicit user-provided change list

## Rollback Reference
If rollback is needed in the future, use this baseline as the reference point:
- **Version**: Live 114
- **Date**: February 3, 2026
- **State**: Verified 1:1 parity
- **Documentation**: This file + RESTORE_LIVE_V114_CHECKLIST.md + V114_BASELINE_FRONTEND_FILES.txt

---

## Core Flows Smoke Test (Development Only)

### Purpose
Validate that the four core application flows remain functional after any code changes:
1. Folder creation
2. Mission creation
3. File upload
4. Link creation

### How to Run
In development mode, append `?runSmokeTest=true` to the URL after logging in and waiting for the actor to be ready:
