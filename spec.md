# MYL

## Current State

- Κεντρική οθόνη (HomePage): εμφανίζει `GallerySection` (αρχεία/notes με αρίθμηση) και `FloatingFileStack` (floating badge με count αρχείων).
- CollectionsFullScreenView: έχει long-press που ανοίγει ξεχωριστό "single-item action sheet" — δεν ενεργοποιεί inline batch selection mode.
- Όταν items μεταφερθούν σε folder/mission μέσω CollectionsFullScreenView, τα query keys `collections-files` / `collections-notes` invalidate-άρονται, αλλά υπάρχει κίνδυνος τα items να φαίνονται και στο Collection αν δεν γίνει σωστό optimistic update.

## Requested Changes (Diff)

### Add
- Στο `CollectionsFullScreenView`: long-press σε item → ενεργοποιεί inline selection mode, το item επιλέγεται αμέσως, ο χρήστης μπορεί να επιλέξει πρόσθετα items → toolbar με Mission / Folder / Share / Delete.
- Optimistic removal: μόλις επιλεγμένα items σταλούν σε folder/mission ή διαγραφούν, αφαιρούνται αμέσως (optimistic) από το collection grid πριν επιστρέψει το backend.

### Modify
- `HomePage`: αφαιρεί `GallerySection` και `FloatingFileStack` από την κεντρική οθόνη (όταν δεν υπάρχει selectedFolder). Δεν εμφανίζεται αρίθμηση αρχείων κάτω δεξιά.
- `CollectionsFullScreenView`: αντικαθιστά το "single-item action sheet" flow με απλό inline selection mode (long-press → select item → toolbar).
- `SendToFolderDialog` / `MoveToMissionDialog`: μετά την επιτυχή μεταφορά, τα items αφαιρούνται από το `collections-files` / `collections-notes` cache αμέσως.

### Remove
- `GallerySection` render όταν `selectedFolder === null` στο `HomePage`.
- `FloatingFileStack` component από `HomePage`.
- Single-item action sheet logic από `CollectionsFullScreenView` (απλοποιείται σε ενιαίο batch selection flow).

## Implementation Plan

1. **HomePage**: Αφαίρεσε `GallerySection` (hideCollection branch) και `FloatingFileStack`. Αφαίρεσε state/handlers που αφορούν μόνο αυτά (`newlyUploadedFiles`, `isStackOpen`, `isBulkSelectionActive`, `handleBulkSelectionChange`).
2. **CollectionsFullScreenView**: Αντικατάστησε single-item sheet με inline selection mode. Long-press → `enterSelectionMode()` + select item. Ο χρήστης επιλέγει ελεύθερα. Toolbar εμφανίζεται στο κάτω μέρος.
3. **Optimistic removal στο Collection**: Μετά από επιτυχές move σε folder/mission ή delete, να αφαιρεί αμέσως τα items από το collection cache (`collections-files`, `collections-notes`) με `setQueryData` πριν το invalidate.
4. **Καμία αλλαγή** σε design, χρώματα, Orbit Dock, Folders, Missions, Upload panel, Notes editor, ή οποιαδήποτε άλλη λειτουργία.
