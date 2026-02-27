# Specification

## Summary
**Goal:** Add a 4th Collections item to the OrbitDock and implement a full-screen CollectionsFullScreenView that aggregates all uploaded files, notes, and links in a thumbnail grid with existing selection/action logic.

**Planned changes:**
- Extend OrbitDock to include 4 items (Upload, Folders, Mission, Collections) distributed symmetrically at 90° intervals, preserving all existing swipe, animation, and orbital behavior
- Add an inline SVG Collections icon (2×2 grid of squares, rounded corners, stroke 2.2–2.5px, amber #D97706 light / #FBBF24 dark, 60% opacity when inactive)
- Create `CollectionsFullScreenView` component that displays all uploaded files, notes, and links from existing UploadContext and React Query queries
- Render items in a 4-column 80×80px thumbnail grid with 8–12px gap, 16px side padding, 8–10px rounded corners, and lazy loading; images show previews, notes show card thumbnails, links show favicon or fallback icon
- Wire existing file selection, multi-select, select all, move to Mission (MoveToMissionDialog), move to Folder (SendToFolderDialog), delete, and share logic into CollectionsFullScreenView without creating new hooks or mutations
- Wire CollectionsFullScreenView into HomePage using a `showCollections` state flag and `onCollectionsTap` prop on OrbitDock, following the same pattern as FoldersFullScreenView and MissionsFullScreenView

**User-visible outcome:** Users can swipe the orbit dock to reach a new Collections item and tap it to open a full-screen aggregated thumbnail view of all their uploads, with the same selection and file-action capabilities available elsewhere in the app.
