import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Cycles "mo:core/Cycles";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  public type FileMetadata = {
    id : Text;
    name : Text;
    mimeType : Text; // Optional, can be null for links
    size : Nat;
    createdAt : Time.Time;
    blob : ?Storage.ExternalBlob; // Optional, null for links
    folderId : ?Nat; // Folder association
    owner : Principal; // Principal of the file owner
    missionId : ?Nat; // Optional mission association
    link : ?Text; // Optional link
    fileLocation : ?Text; // Optional location for file (root, folder, mission)
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

  public type UserProfile = {
    name : Text;
  };

  public type Task = {
    taskId : Nat;
    task : Text;
    completed : Bool;
  };

  public type Mission = {
    id : Nat;
    title : Text;
    created : Int;
    owner : Principal;
    tasks : [Task];
  };

  public type Missions = {
    owner : Principal;
    data : Map.Map<Nat, Mission>;
  };

  public type PersistentMissions = {
    nextMissionId : Nat;
    map : Map.Map<Principal, Missions>;
  };

  public type DiagnosticResult = {
    build : Text;
    cycles : Nat;
    time : Int;
    uploadTime : Nat;
    moveFilesToFolderTime : Nat;
    deleteFolderTime : Nat;
    deleteFilesLowLevelTime : Nat;
  };

  public type HealthResult = {
    build : Text;
    cycles : Nat;
    time : Int;
  };

  // Authorization core
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextFileId = 0;
  var nextFolderId = 0 : Nat;
  var nextMissionId = 0 : Nat;

  let files = Map.empty<Nat, FileMetadata>();
  let folders = Map.empty<Nat, Folder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var persistentMissions : PersistentMissions = {
    nextMissionId = 0;
    map = Map.empty<Principal, Missions>();
  };

  // Timings
  var uploadTime = 0;
  var moveFilesToFolderTime = 0;
  var deleteFolderTime = 0;
  var deleteFilesLowLevelTime = 0;

  // Helper: Find file by string id
  private func findFileByTextId(id : Int) : ?(Nat, FileMetadata) {
    files.toArray().find(func((_, file)) { file.id == id.toText() });
  };

  public query ({ caller }) func getHealth() : async HealthResult {
    let time = Time.now();
    {
      build = "1.4.0";
      cycles = Cycles.balance();
      time;
    };
  };

  public query ({ caller }) func getDiagnostics() : async DiagnosticResult {
    let time = Time.now();
    {
      build = "1.3.9";
      cycles = Cycles.balance();
      time;
      uploadTime;
      moveFilesToFolderTime;
      deleteFolderTime;
      deleteFilesLowLevelTime;
    };
  };

  // -------------- User Profile Management ---------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Mission Management
  public shared ({ caller }) func createMission(title : Text, tasks : [Task]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create missions");
    };

    let mission : Mission = {
      id = nextMissionId;
      title;
      created = Time.now();
      owner = caller;
      tasks;
    };

    let userMissions : Missions = switch (persistentMissions.map.get(caller)) {
      case (null) {
        let newMissions : Missions = {
          owner = caller;
          data = Map.empty<Nat, Mission>();
        };
        persistentMissions.map.add(caller, newMissions);
        newMissions;
      };
      case (?missions) { missions };
    };

    userMissions.data.add(nextMissionId, mission);
    let currentMissionId = nextMissionId;
    nextMissionId += 1;
    persistentMissions := {
      persistentMissions with
      nextMissionId
    };
    currentMissionId;
  };

  public query ({ caller }) func getMission(missionId : Nat) : async ?Mission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access missions");
    };

    switch (persistentMissions.map.get(caller)) {
      case (null) { null };
      case (?userMissions) {
        userMissions.data.get(missionId);
      };
    };
  };

  public shared ({ caller }) func updateMission(missionId : Nat, newTitle : Text, newTasks : [Task]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update missions");
    };

    switch (persistentMissions.map.get(caller)) {
      case (null) { Runtime.trap("Mission not found") };
      case (?userMissions) {
        switch (userMissions.data.get(missionId)) {
          case (null) { Runtime.trap("Mission not found") };
          case (?oldMission) {
            let updatedMission = {
              oldMission with
              title = newTitle;
              tasks = newTasks;
            };
            userMissions.data.add(missionId, updatedMission);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteMission(missionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete missions");
    };

    switch (persistentMissions.map.get(caller)) {
      case (null) { Runtime.trap("Mission not found") };
      case (?userMissions) {
        if (not userMissions.data.containsKey(missionId)) {
          Runtime.trap("Mission not found");
        };
        userMissions.data.remove(missionId);
      };
    };
  };

  public query ({ caller }) func listMissions() : async [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list missions");
    };

    switch (persistentMissions.map.get(caller)) {
      case (null) { [] };
      case (?userMissions) {
        userMissions.data.values().toArray();
      };
    };
  };

  // File Management
  public shared ({ caller }) func uploadFile(
    name : Text,
    mimeType : Text,
    size : Nat,
    blob : Storage.ExternalBlob,
    missionId : ?Nat,
  ) : async UploadResponse {
    // Time check
    let startUpload = Time.now();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    switch (missionId) {
      case (?mid) {
        switch (persistentMissions.map.get(caller)) {
          case (null) {
            Runtime.trap("Mission not found");
          };
          case (?userMissions) {
            if (not userMissions.data.containsKey(mid)) {
              Runtime.trap("Mission not found");
            };
          };
        };
      };
      case (null) {};
    };

    let id = nextFileId.toText();
    let file : FileMetadata = {
      id;
      name;
      mimeType;
      createdAt = Time.now();
      size;
      blob = ?blob;
      folderId = null;
      owner = caller;
      missionId;
      link = null;
      fileLocation = null; // Initially location is root
    };
    files.add(nextFileId, file);
    nextFileId += 1;

    // Time check
    let endUpload = Time.now();
    uploadTime := (endUpload - startUpload).toNat();

    { id };
  };

  public shared ({ caller }) func createLink(
    name : Text,
    url : Text,
    folderId : ?Nat,
    missionId : ?Nat,
  ) : async UploadResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create links");
    };

    switch (folderId) {
      case (?fid) {
        switch (folders.get(fid)) {
          case (null) { Runtime.trap("Folder not found") };
          case (?folder) {
            if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only create links in your own folders");
            };
          };
        };
      };
      case (null) {};
    };

    switch (missionId) {
      case (?mid) {
        switch (persistentMissions.map.get(caller)) {
          case (null) { Runtime.trap("Mission not found") };
          case (?userMissions) {
            if (not userMissions.data.containsKey(mid)) {
              Runtime.trap("Mission not found");
            };
          };
        };
      };
      case (null) {};
    };

    let id = nextFileId.toText();

    let linkItem : FileMetadata = {
      id;
      name;
      mimeType = "text/html";
      createdAt = Time.now();
      size = 0;
      blob = null;
      folderId;
      owner = caller;
      missionId;
      link = ?url;
      fileLocation = switch (folderId, missionId) {
        case (?fid, null) { ?("folder:" # fid.toText()) };
        case (null, ?mid) { ?("mission:" # mid.toText()) };
        case (null, null) { ?"root" };
        case (?fid, ?mid) { ?("folder:" # fid.toText() # ":mission:" # mid.toText()) };
      };
    };

    files.add(nextFileId, linkItem);
    nextFileId += 1;
    { id };
  };

  public shared ({ caller }) func moveFilesToMission(fileIds : [Int], missionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move files to missions");
    };

    switch (persistentMissions.map.get(caller)) {
      case (null) {
        Runtime.trap("Mission not found");
      };
      case (?userMissions) {
        if (not userMissions.data.containsKey(missionId)) {
          Runtime.trap("Mission not found");
        };
      };
    };

    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (?(_, file)) {
          if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only move your own files");
          };
        };
        case (null) {
          Runtime.trap("File not found");
        };
      };
    };

    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (?(numericId, file)) {
          let updatedFile = {
            file with
            missionId = ?missionId;
            folderId = null;
            fileLocation = ?("mission:" # missionId.toText());
          };
          files.add(numericId, updatedFile);
        };
        case (null) {};
      };
    };
  };

  public query ({ caller }) func getFile(fileId : Int) : async ?FileMetadata {
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

    let folderFiles = files.values().toArray().filter(
      func(file) {
        switch (file.folderId) {
          case (?id) {
            id == folderId and file.owner == caller and file.missionId == null
          };
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
      Runtime.trap("Unauthorized: Only users can access files");
    };

    let filteredFiles = files.values().toArray().filter(
      func(file) {
        file.folderId == null and file.owner == caller and file.missionId == null
      }
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

  public query ({ caller }) func getFilesForMission(missionId : ?Nat) : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };

    switch (missionId) {
      case (?mid) {
        switch (persistentMissions.map.get(caller)) {
          case (null) {
            Runtime.trap("Mission not found");
          };
          case (?userMissions) {
            if (not userMissions.data.containsKey(mid)) {
              Runtime.trap("Mission not found");
            };
          };
        };
      };
      case (null) {};
    };

    let filteredFiles = files.values().toArray().filter(
      func(file) {
        file.owner == caller and file.missionId == missionId
      }
    );

    filteredFiles;
  };

  public shared ({ caller }) func deleteFile(id : Int) : async () {
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

  public shared ({ caller }) func deleteFiles(fileIds : [Int]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };

    // Verify all exist and are owned by caller
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (null) {
          Runtime.trap("File not found: " # fileId.toText());
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

  // Low-level delete files for performance testing (does not check ownership)
  public shared ({ caller }) func deleteFilesLowLevel(fileIds : [Int]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can use low-level file deletion");
    };

    let startDeleteFiles = Time.now();

    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (null) {
          Runtime.trap("File not found: " # fileId.toText());
        };
        case (?(numericId, _)) {
          files.remove(numericId);
        };
      };
    };

    let endDeleteFiles = Time.now();
    deleteFilesLowLevelTime := (endDeleteFiles - startDeleteFiles).toNat();
  };

  public shared ({ caller }) func moveFileToFolder(fileId : Int, folderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move files");
      return ();
    };

    let fileEntry = findFileByTextId(fileId);
    if (fileEntry == null) {
      Runtime.trap("File not found");
      return ();
    };

    let (numericId, file) = switch (fileEntry) {
      case (?entry) { entry };
      case (null) { Runtime.trap("File not found") };
    };

    if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only move your own files");
      return ();
    };

    switch (folders.get(folderId)) {
      case (null) { Runtime.trap("Folder not found") };
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only move files to your own folders");
          return ();
        };
        let updatedFile = {
          file with
          folderId = ?folderId;
          missionId = null;
        };
        files.add(numericId, updatedFile);
      };
    };
  };

  public shared ({ caller }) func moveFilesToFolder(fileIds : [Int], folderId : Nat) : async () {
    // Time check
    let startMove = Time.now();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move files");
    };

    // Verify all files exist and are owned by caller
    for (fileId in fileIds.vals()) {
      switch (findFileByTextId(fileId)) {
        case (null) {
          Runtime.trap("File not found: " # fileId.toText());
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
          let updatedFile = {
            file with
            folderId = ?folderId;
            missionId = null;
          };
          files.add(numericId, updatedFile);
        };
        case (null) {};
      };
    };

    // Time check
    let endMove = Time.now();
    moveFilesToFolderTime := (endMove - startMove).toNat();
  };

  // Optimized batch remove from folder
  public shared ({ caller }) func batchRemoveFromFolder(fileIds : [Int]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify files");
    };

    for (fileId in fileIds.vals()) {
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
          Runtime.trap("File not found: " # fileId.toText());
        };
      };
    };
  };

  public shared ({ caller }) func removeFromFolder(fileId : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify files");
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
    // Time check
    let startDelete = Time.now();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete folders");
    };

    // Verify folder exists and is owned by caller
    switch (folders.get(folderId)) {
      case (?folder) {
        if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only users can delete your own folders");
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

    // Time check
    let endDelete = Time.now();
    deleteFolderTime := (endDelete - startDelete).toNat();
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

  /// Admin-only method to get all files regardless of owner
  public query ({ caller }) func getAllFiles() : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all files");
    };

    files.values().toArray();
  };

  // Function to return only link items for a user
  public query ({ caller }) func getLinksForUser(user : Principal) : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access links");
    };

    // Only allow viewing own links unless admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own links");
    };

    files.values().toArray().filter(
      func(file) { file.owner == user and file.link != null }
    );
  };
};
