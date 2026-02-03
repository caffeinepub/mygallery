import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  public type FileMetadata = {
    id : Text;
    name : Text;
    mimeType : Text;
    size : Nat;
    createdAt : Time.Time;
    blob : Storage.ExternalBlob;
    folderId : ?Nat;
    owner : Principal;
  };

  public type PaginatedFiles = {
    files : [FileMetadata];
    hasMore : Bool;
  };

  public type Folder = {
    id : Nat;
    name : Text;
    createdAt : Time.Time;
    owner : Principal;
  };

  public type UploadResponse = {
    id : Text;
  };

  public type SortDirection = {
    #asc;
    #desc;
  };

  // Authorization core
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Mutable actor state
  var nextFileId = 0;
  var nextFolderId = 0 : Nat;
  let files = Map.empty<Nat, FileMetadata>();
  let folders = Map.empty<Nat, Folder>();

  // Helper: Find file by string id
  private func findFileByTextId(id : Text) : ?(Nat, FileMetadata) {
    files.toArray().find(func((_, file)) { file.id == id });
  };

  // File Management
  public shared ({ caller }) func uploadFile(name : Text, mimeType : Text, size : Nat, blob : Storage.ExternalBlob) : async UploadResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    let id = nextFileId.toText();
    let file : FileMetadata = {
      id;
      name;
      mimeType;
      createdAt = Time.now();
      size;
      blob;
      folderId = null;
      owner = caller;
    };
    files.add(nextFileId, file);
    nextFileId += 1;
    { id };
  };

  public query ({ caller }) func getFile(fileId : Text) : async ?FileMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };

    switch (findFileByTextId(fileId)) {
      case (?(_, file)) {
        // Verify ownership
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only access your own files");
        };
        ?file;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getFilesInFolder(folderId : Nat, offset : Nat, limit : Nat) : async PaginatedFiles {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };

    // Verify folder ownership
    switch (folders.get(folderId)) {
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only access your own folders");
        };
      };
      case (null) {
        Runtime.trap("Folder not found");
      };
    };

    // Filter by folder and owner
    let folderFiles = files.values().toArray().filter(
      func(file) {
        switch (file.folderId) {
          case (?id) { id == folderId and file.owner == caller };
          case (null) { false };
        };
      }
    );

    let start = Nat.min(offset, folderFiles.size());
    let end = Nat.min(offset + limit, folderFiles.size());
    let paginatedFiles = folderFiles.sliceToArray(start, end);
    let hasMore = end < folderFiles.size();
    {
      files = paginatedFiles;
      hasMore;
    };
  };

  public query ({ caller }) func getPaginatedFiles(sortDirection : SortDirection, offset : Nat, limit : Nat) : async PaginatedFiles {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Filter by owner and no folder assignment
    let filteredFiles = files.values().toArray().filter(
      func(file) { file.folderId == null and file.owner == caller }
    );

    let sortedFiles = filteredFiles.sort(
      func(a, b) {
        switch (sortDirection) {
          case (#asc) { Int.compare(a.createdAt, b.createdAt) };
          case (#desc) { Int.compare(b.createdAt, a.createdAt) };
        };
      }
    );

    let start = Nat.min(offset, sortedFiles.size());
    let end = Nat.min(offset + limit, sortedFiles.size());
    let paginatedFiles = sortedFiles.sliceToArray(start, end);
    let hasMore = end < sortedFiles.size();

    {
      files = paginatedFiles;
      hasMore;
    };
  };

  public shared ({ caller }) func deleteFile(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };

    switch (findFileByTextId(id)) {
      case (?(fileId, file)) {
        // Verify ownership
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own files");
        };
        files.remove(fileId);
      };
      case (null) {
        Runtime.trap("File not found");
      };
    };
  };

  public shared ({ caller }) func deleteFiles(fileIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Verify all exist and are owned by caller
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (null) {
          Runtime.trap("File not found: " # fileId);
        };
        case (?(_, file)) {
          if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only delete your own files");
          };
        };
      };
    };

    // Delete all verified files
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (?(numericId, _)) {
          files.remove(numericId);
        };
        case (null) {};
      };
    };
  };

  public shared ({ caller }) func moveFileToFolder(fileId : Text, folderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move files to folders");
    };

    switch (findFileByTextId(fileId)) {
      case (?(numericFileId, file)) {
        // Verify file ownership
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only move your own files");
        };

        // Verify folder exists and is owned by caller
        switch (folders.get(folderId)) {
          case (?folder) {
            if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only move files to your own folders");
            };
            let updatedFile = { file with folderId = ?folderId };
            files.add(numericFileId, updatedFile);
          };
          case (null) {
            Runtime.trap("Folder not found");
          };
        };
      };
      case (null) {
        Runtime.trap("File not found");
      };
    };
  };

  public shared ({ caller }) func moveFilesToFolder(fileIds : [Text], folderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Verify all files exist and are owned by caller
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (null) {
          Runtime.trap("File not found: " # fileId);
        };
        case (?(_, file)) {
          if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only move your own files");
          };
        };
      };
    };

    // Verify folder exists and is owned by caller
    switch (folders.get(folderId)) {
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only move files to your own folders");
        };
      };
      case (null) {
        Runtime.trap("Folder not found");
      };
    };

    // Update all verified files
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (?(numericId, file)) {
          let updatedFile = { file with folderId = ?folderId };
          files.add(numericId, updatedFile);
        };
        case (null) {};
      };
    };
  };

  public shared ({ caller }) func removeFromFolder(fileId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (findFileByTextId(fileId)) {
      case (?(numericFileId, file)) {
        // Verify ownership
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only modify your own files");
        };
        let updatedFile = { file with folderId = null };
        files.add(numericFileId, updatedFile);
      };
      case (null) {
        Runtime.trap("File not found");
      };
    };
  };

  // Folder Management
  public shared ({ caller }) func createFolder(name : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create folders");
    };

    let id = nextFolderId.toText();
    let folder : Folder = {
      id = nextFolderId;
      name;
      createdAt = Time.now();
      owner = caller;
    };

    folders.add(nextFolderId, folder);
    nextFolderId += 1;
    ?id;
  };

  public shared ({ caller }) func renameFolder(folderId : Nat, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename folders");
    };

    switch (folders.get(folderId)) {
      case (?folder) {
        // Verify ownership
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only rename your own folders");
        };
        let updatedFolder = { folder with name = newName };
        folders.add(folderId, updatedFolder);
      };
      case (null) {
        Runtime.trap("Folder not found");
      };
    };
  };

  public shared ({ caller }) func deleteFolder(folderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete folders");
    };

    // Verify folder exists and is owned by caller
    switch (folders.get(folderId)) {
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own folders");
        };
      };
      case (null) {
        Runtime.trap("Folder not found");
      };
    };

    folders.remove(folderId);

    // Remove all files in the deleted folder (only caller's files)
    let filesToDelete = files.toArray().filter(
      func((_, file)) {
        switch (file.folderId) {
          case (?id) { id == folderId and file.owner == caller };
          case (null) { false };
        };
      }
    );

    for ((fileId, _) in filesToDelete.values()) {
      files.remove(fileId);
    };
  };

  public query ({ caller }) func getAllFolders() : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access folders");
    };
    // Only return folders owned by caller
    folders.values().toArray().filter(
      func(folder) { folder.owner == caller }
    );
  };

  /// New method to get all files regardless of owner
  public query ({ caller }) func getAllFiles() : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all files");
    };

    files.values().toArray();
  };
};
