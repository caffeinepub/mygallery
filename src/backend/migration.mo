import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  type Mission = {
    id : Nat;
    title : Text;
    created : Int;
    owner : Principal;
    tasks : [Task];
  };

  type Task = {
    taskId : Nat;
    task : Text;
    completed : Bool;
  };

  type Missions = {
    owner : Principal;
    data : Map.Map<Nat, Mission>;
  };

  type OldActor = {
    persistentMissions : Map.Map<Principal, Missions>;
    nextMissionId : Nat;
    // Other state...
  };

  public func run(old : OldActor) : { persistentMissions : { nextMissionId : Nat; map : Map.Map<Principal, Missions> } } {
    let persistentMissions = {
      map = old.persistentMissions;
      nextMissionId = old.nextMissionId;
    };
    {
      persistentMissions;
    };
  };
};
