import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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

  public type OldActor = {
    nextFileId : Nat;
    nextFolderId : Nat;
    nextMissionId : Nat;
    nextNoteId : Nat;
    files : Map.Map<Nat, FileMetadata>;
    uploadTime : Nat;
    moveFilesToFolderTime : Nat;
    deleteFolderTime : Nat;
    deleteFilesLowLevelTime : Nat;
  };

  public type NewActor = {
    nextFileId : Nat;
    nextFolderId : Nat;
    nextMissionId : Nat;
    nextNoteId : Nat;
    files : Map.Map<Nat, FileMetadata>;
    uploadTime : Nat;
    moveFilesToFolderTime : Nat;
    deleteFolderTime : Nat;
    deleteFilesLowLevelTime : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
