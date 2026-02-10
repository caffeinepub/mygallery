# Specification

## Summary
**Goal:** Improve overall frontend performance and responsiveness via targeted optimizations (bundle size, lazy loading, caching, render smoothness) with zero UI or behavior changes.

**Planned changes:**
- Expand route-/feature-level code splitting and lazy-loading for heavy, non-critical components (e.g., dialogs/viewers/secondary full-screen subviews) to reduce initial JavaScript payload.
- Reduce unnecessary React re-renders and inefficient state updates in top-level screens and frequently updating areas (e.g., view switching, upload progress, large lists/grids) using memoization and stable callbacks.
- Tune React Query defaults/behaviors to reduce redundant refetching while preserving existing invalidation semantics and data correctness.
- Optimize the service worker caching strategy for static build assets with safe cache versioning/cleanup, while ensuring navigation reliability and avoiding caching/interfering with API/canister traffic.
- Remove/gate dev-only diagnostics and delete clearly unused code from production bundles without affecting production behavior.

**User-visible outcome:** The app feels faster and smoother (quicker navigation and reduced jank), while the UI, text, and all existing flows behave exactly the same as before.
