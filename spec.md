# MYL - Upload Flow & Collections Fix

## Current State

- Ο χρήστης ανοίγει το Upload menu (bottom action panel) και επιλέγει Upload Files / Paste Link / Add Note.
- Μετά την επιλογή, ο χρήστης μεταφέρεται στο Collections view.
- Η progress bar (UnifiedProgressBar) εμφανίζεται στο top (z-40) αλλά βρίσκεται στο HomePage — δεν εμφανίζεται μέσα στο CollectionsFullScreenView.
- Το CollectionsFullScreenView έχει ήδη batch actions (Mission, Folder, Share, Delete) που ενεργοποιούνται μέσω long-press → selection mode.
- Το "Upload" icon στο OrbitDock ανοίγει το bottom action panel. Αφού ο χρήστης ανεβάσει, δεν υπάρχει τρόπος να ανοίξει ξανά το upload menu από το collections view.

## Requested Changes (Diff)

### Add
- Progress bar ορατή μέσα στο CollectionsFullScreenView κατά τη διάρκεια upload (αντί για global fixed bar που κρύβεται πίσω από το full-screen).
- Όταν ο χρήστης βρίσκεται στο Collections view και θέλει να ανεβάσει νέο αρχείο, μπορεί να το κάνει μέσω του upload icon (επιστροφή στο dock ή button μέσα στο Collections).
- Οι batch actions (Mission, Folder, Share, Delete) να λειτουργούν και μεμονωμένα (tap σε item → single-item action menu) και ομαδικά (long-press → selection mode → batch actions).

### Modify
- CollectionsFullScreenView: Προσθήκη inline progress bar στο top του view που εμφανίζεται κατά τη διάρκεια uploads.
- CollectionsFullScreenView: Tap σε μεμονωμένο item (εκτός selection mode) να ανοίγει ένα action sheet με επιλογές: Send to Mission, Send to Folder, Share, Delete.
- HomePage: Να περνά το `onUploadRequest` callback στο CollectionsFullScreenView, ώστε ο χρήστης να μπορεί να ανοίξει το upload menu από το Collections.
- CollectionsFullScreenView: Προσθήκη "Upload" button στο header για άμεση πρόσβαση στο upload menu.

### Remove
- Τίποτα δεν αφαιρείται.

## Implementation Plan

1. **CollectionsFullScreenView**: 
   - Προσθήκη `onUploadRequest?: () => void` prop.
   - Inline progress bar: χρήση `useUpload()` hook, εμφάνιση bar στο top του view κατά τη διάρκεια active uploads.
   - Upload button στο header (δίπλα στο "Collections" title).
   - Tap σε item (εκτός selection mode): ανοίγει action sheet με Mission / Folder / Share / Delete για το συγκεκριμένο item.
   - Long-press: είσοδος σε selection mode όπως υπάρχει ήδη.

2. **HomePage**: 
   - Πέρασμα του `handleUploadActionSelected` ή νέο `handleOpenUploadMenu` ως `onUploadRequest` στο CollectionsFullScreenView.
   - Το FileUploadSection να παραμένει mounted (ή να ξαναφορτώνεται) ακόμα και όταν το Collections είναι ανοιχτό.

3. Δεν αλλάζει τίποτα άλλο (orbit dock, missions, folders, design).
