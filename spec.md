# Specification

## Summary
**Goal:** Fix the OrbitDock interaction model so that swiping only updates the visual active state, tapping the centered icon opens the function, tapping a side icon rotates it to center without opening, and all taps produce subtle visual and haptic feedback.

**Planned changes:**
- Remove auto-open logic triggered by swipe gestures in OrbitDock; swiping now only updates the visually active (centered) item
- Implement tap-to-open: tapping the currently centered icon fires its open/navigation callback
- Implement rotation-first behavior for side icon taps: tapping an inactive side icon smoothly rotates the dock to bring it to center without opening the function; a second tap is then required to open it
- Add subtle tap feedback: scale the tapped icon to 0.95 for 100–120ms on every tap, and trigger a light haptic vibration (navigator.vibrate([10])) on supported devices

**User-visible outcome:** Users can swipe the Orbit Dock to browse functions visually, tap a side icon to bring it to center, and then tap the centered icon to open it. Every tap produces a brief scale animation and a light vibration on supported devices.
