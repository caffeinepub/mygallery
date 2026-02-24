# Specification

## Summary
**Goal:** Replace the existing bottom navigation with an animated semi-circular "Orbit Dock" component that provides orbital arc motion, micro-interactions, and adaptive feedback while preserving all existing section functionality.

**Planned changes:**
- Create a new `OrbitDock` component rendering three icons (Upload, Folders, Mission) on a semi-circular arc at the bottom of the screen, with the active icon always at the center apex and inactive icons flanking symmetrically
- Implement swipe gesture handling (reusing `useSwipeGesture` hook) that animates icons along the curved orbital arc path with 220–260ms ease-in-out transitions and infinite cycling
- Add adaptive active-state feedback: a subtle glow arc/underline beneath the active icon, a fade-in text label, and a momentum effect on swipe; glow and label fade out when a swipe begins
- Add per-icon micro-interactions: subtle idle pulse every 8–10s for Upload, layered depth/shadow effect for Folders, and a brief activation animation for Mission when it becomes active
- Implement reduced-motion fallback (reusing `useReducedMotion` hook) that switches to a flat horizontal slide with no scale or orbital animation
- Integrate `OrbitDock` into `HomePage` replacing the existing bottom navigation, wiring it to the same section-switching logic without altering any Upload, Folders, or Mission functionality

**User-visible outcome:** The bottom navigation animates as a rotating orbital dock with swipe support, micro-interactions, and active-state indicators, while all app functionality remains unchanged.
