# Specification

## Summary
**Goal:** Make “Move to mission” transfers from folders update immediately and correctly for files/links and notes, without requiring refresh or navigation.

**Planned changes:**
- Fix frontend “move to mission” for files/links so moved items are removed from the source folder list immediately and appear in the target mission list immediately (including items originating from folder-scoped caches, not only the root list).
- Fix frontend “move to mission” for notes so moved notes are removed from the source folder notes list immediately and appear in the target mission notes list immediately.
- Add proper optimistic update + rollback behavior for both flows so failed moves restore the pre-move UI state.
- Fix backend move-to-mission operations so moved files/links and notes have `folderId` cleared and `missionId` set (and any related location fields updated consistently if used), ensuring folder-scoped queries no longer return moved items and mission-scoped queries do.

**User-visible outcome:** When moving files/links/notes from a folder to a mission, the items disappear from the folder and show up in the mission immediately after the move completes, and if a move fails the UI returns to the original state.
