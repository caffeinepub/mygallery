# Specification

## Summary
**Goal:** Fix the freeze/blank-screen issue when completing tasks in a mission, including rapid toggling, without changing any other app behavior.

**Planned changes:**
- Fix mission task toggle flow so completing the last remaining task (and rapid toggling) does not freeze the UI or render a blank screen.
- Update mission autosave change-detection logic to safely compare tasks that include BigInt identifiers without using `JSON.stringify` on BigInt-containing objects.
- Ensure task completion persistence and autosave behavior remain the same (debounced, background persistence, no runtime exceptions).

**User-visible outcome:** In the Mission detail view, users can mark tasks complete/incomplete (including completing all tasks) without the app freezing or showing a blank screen, and task completion states continue to persist as before.
