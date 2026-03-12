# MYL App - Fixes v320

## Current State
- MissionsFullScreenView uses a Plus Button (size=icon default variant) for Create Mission — may be invisible in light mode
- Swipe between incomplete/completed tabs is missing in MissionsFullScreenView
- AnimatedGalleryIcon uses stroke-missions-accent CSS class which may not render visibly in all theme/browser combinations
- No sky/cloud background exists in the app

## Requested Changes (Diff)

### Add
- SkyBackground component: fixed positioned behind all content, animated drifting clouds, visible in both light mode (blue sky + white clouds) and dark mode (navy sky + dim clouds), pointer-events none
- Cloud drift CSS keyframe animations in index.css

### Modify
- MissionsFullScreenView: Create Mission Plus button gets explicit purple bg color for light/dark; add swipe gesture (left→completed, right→incomplete) on the missions list area
- AnimatedGalleryIcon: use useTheme to apply explicit #7C3AED (light) / #A78BFA (dark) colors on all SVG strokes/fills
- MobileOnlyLayout: mount SkyBackground as first child; make mobile-only-content transparent with z-index:1
- index.css: mobile-only-container/content background → transparent; add cloud drift keyframes

### Remove
- Nothing

## Implementation Plan
1. Create SkyBackground.tsx with sky gradient + 4 animated SVG clouds (deterministic positions)
2. Update AnimatedGalleryIcon.tsx with useTheme-based explicit colors
3. Update MissionsFullScreenView.tsx: explicit button colors + swipe handlers on tab content
4. Update MobileOnlyLayout.tsx to include SkyBackground
5. Update index.css: transparent containers + cloud keyframe animations
