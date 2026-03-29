# MYL

## Current State
- BottomNavBar has 4 items: Upload(0), Collection(1), Folders(2), Missions(3)
- Collection opens as a separate full-screen view (CollectionsFullScreenView)
- SkyBackground renders a sky gradient (day: blue/light, night: dark blue) behind all content
- HomePage main area is empty when no full-screen view is open

## Requested Changes (Diff)

### Add
- `HomeCollectionsPanel` component: embedded collection grid in the main home page area (above bottom nav), with 4-column thumbnail grid, long-press selection, batch action toolbar (Mission/Folder/Share/Delete) that appears above the bottom nav icons, upload progress bar, empty state. Tap item → full screen. Long-press → multi-select mode.

### Modify
- **SkyBackground.tsx**: Replace sky gradient with plain white (`#ffffff`) in day mode and plain black (`#000000`) in night mode. Remove stars too.
- **BottomNavBar.tsx**: Remove `collection` from NAV_ITEMS. Keep only Upload(0), Folders(1), Missions(2). Space evenly across 3 icons.
- **HomePage.tsx**: Remove `isCollectionsOpen` state and all Collection nav logic. Update nav indices to Upload=0, Folders=1, Missions=2. Embed `HomeCollectionsPanel` in the main content area (flex-1, scrollable, above bottom nav padding).

### Remove
- Collection nav item from BottomNavBar
- `isCollectionsOpen`, `handleCloseCollections`, Collection-related nav handling in HomePage

## Implementation Plan
1. Update SkyBackground.tsx: plain white/black background, no gradient, no stars
2. Update BottomNavBar.tsx: remove collection item, keep Upload/Folders/Missions at indices 0/1/2
3. Create HomeCollectionsPanel.tsx: embedded collection grid with all existing logic from CollectionsFullScreenView but without the header/back button, with batch action toolbar pinned above bottom nav
4. Update HomePage.tsx: remove Collection full-screen handling, embed HomeCollectionsPanel in main content area, update nav index mapping
