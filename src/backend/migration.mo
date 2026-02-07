import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type MissionId = Nat;
  type TaskId = Nat;

  type OldTask = {
    taskId : TaskId;
    task : Text;
    completed : Bool;
  };

  type OldMission = {
    id : MissionId;
    title : Text;
    created : Int;
    owner : Principal.Principal;
    tasks : [OldTask];
  };

  type OldMissions = {
    owner : Principal.Principal;
    data : Map.Map<MissionId, OldMission>;
  };

  type OldPersistentMissions = {
    nextMissionId : Nat;
    map : Map.Map<Principal.Principal, OldMissions>;
  };

  type OldActor = {
    persistentMissions : OldPersistentMissions;
    // ignore other fields
  };

  type Task = {
    taskId : TaskId;
    task : Text;
    completed : Bool;
  };

  type Mission = {
    id : MissionId;
    title : Text;
    created : Int;
    owner : Principal.Principal;
    tasks : [Task];
  };

  type Missions = {
    owner : Principal.Principal;
    data : Map.Map<MissionId, Mission>;
  };

  type PersistentMissions = {
    nextMissionId : Nat;
    map : Map.Map<Principal.Principal, Missions>;
  };

  type NewActor = {
    persistentMissions : PersistentMissions;
  };

  public func run(old : OldActor) : NewActor {
    let persistentMissions = {
      nextMissionId = old.persistentMissions.nextMissionId;
      map = old.persistentMissions.map.map<Principal.Principal, OldMissions, Missions>(
        func(_owner, oldMissions) {
          {
            owner = oldMissions.owner;
            data = oldMissions.data.map<MissionId, OldMission, Mission>(
              func(_missionId, oldMission) {
                {
                  id = oldMission.id;
                  title = oldMission.title;
                  created = oldMission.created;
                  owner = oldMission.owner;
                  tasks = oldMission.tasks.map(
                    func(oldTask) {
                      {
                        oldTask with
                        completed = oldTask.completed : Bool;
                      };
                    }
                  );
                };
              }
            );
          };
        }
      );
    };

    {
      persistentMissions;
    };
  };
};
