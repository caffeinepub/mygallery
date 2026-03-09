import type { Folder } from "@/backend";
import ActorInitErrorState from "@/components/ActorInitErrorState";
import DecorativeBottomLine from "@/components/DecorativeBottomLine";
import FileUploadSection from "@/components/FileUploadSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeSharedElementTransitionLayer from "@/components/HomeSharedElementTransitionLayer";
import MobileOnlyLayout from "@/components/MobileOnlyLayout";
import OrbitDock from "@/components/OrbitDock";
import WelcomeIntroScreen from "@/components/WelcomeIntroScreen";
import { useBackendActor } from "@/contexts/ActorContext";
import { useHomePrefetch } from "@/hooks/useHomePrefetch";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useListMissions } from "@/hooks/useMissionsQueries";
import { useGetFolders } from "@/hooks/useQueries";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FoldersFullScreenView = lazy(
  () => import("@/components/FoldersFullScreenView"),
);
const MissionsFullScreenView = lazy(
  () => import("@/components/MissionsFullScreenView"),
);
const CollectionsFullScreenView = lazy(
  () => import("@/components/CollectionsFullScreenView"),
);

// OrbitDock index mapping: 0 = Upload, 1 = Folders, 2 = Mission, 3 = Collections
const DOCK_INDEX_UPLOAD = 0;
const DOCK_INDEX_FOLDERS = 1;
const DOCK_INDEX_MISSION = 2;
const DOCK_INDEX_COLLECTIONS = 3;

export default function HomePage() {
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [dockActiveIndex, setDockActiveIndex] = useState(DOCK_INDEX_UPLOAD);
  const [dockRotation, setDockRotation] = useState(0);

  const [transitionState, setTransitionState] = useState<{
    isActive: boolean;
    type: "opening" | "closing" | null;
    source: "folders" | "missions" | null;
  }>({
    isActive: false,
    type: null,
    source: null,
  });
  const pendingActionRef = useRef<(() => void) | null>(null);

  const { identity, isInitializing } = useInternetIdentity();
  const { status, error, retry, signOut, actor } = useBackendActor();

  useHomePrefetch();
  useGetFolders();
  useListMissions();

  const isAuthenticated = !!identity;
  const isActorReady = status === "ready";
  const isFinalFailure = status === "error" && error;

  useEffect(() => {
    if (import.meta.env.DEV && isActorReady && actor) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("runSmokeTest") === "true") {
        urlParams.delete("runSmokeTest");
        const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
        window.history.replaceState({}, "", newUrl);

        console.log("[Dev] Running core flows smoke test...");

        Promise.all([import("@/utils/smokeTestCoreFlows"), import("sonner")])
          .then(
            ([
              { runCoreFlowsSmokeTest, formatSmokeTestResults },
              { toast },
            ]) => {
              toast.info("Running smoke test...");

              runCoreFlowsSmokeTest(actor)
                .then((results) => {
                  const formatted = formatSmokeTestResults(results);
                  console.log(formatted);

                  const allPassed = results.every((r) => r.success);
                  if (allPassed) {
                    toast.success(
                      "Smoke test passed! Check console for details.",
                    );
                  } else {
                    toast.error(
                      "Smoke test failed! Check console for details.",
                    );
                  }
                })
                .catch((error) => {
                  console.error("[Dev] Smoke test error:", error);
                  toast.error("Smoke test error! Check console for details.");
                });
            },
          )
          .catch((error) => {
            console.error("[Dev] Failed to load smoke test utilities:", error);
          });
      }
    }
  }, [isActorReady, actor]);

  const handleFolderSelect = useCallback((_folder: Folder) => {
    // folder selected from FoldersFullScreenView
  }, []);

  const handleCloseFolders = useCallback(() => {
    setTransitionState({
      isActive: true,
      type: "closing",
      source: "folders",
    });
    pendingActionRef.current = () => setIsFoldersOpen(false);
  }, []);

  const handleCloseMissions = useCallback(() => {
    setTransitionState({
      isActive: true,
      type: "closing",
      source: "missions",
    });
    pendingActionRef.current = () => setIsMissionsOpen(false);
  }, []);

  const handleOpenFolders = useCallback(() => {
    setTransitionState({
      isActive: true,
      type: "opening",
      source: "folders",
    });
    pendingActionRef.current = () => setIsFoldersOpen(true);
  }, []);

  const handleOpenMissions = useCallback(() => {
    setTransitionState({
      isActive: true,
      type: "opening",
      source: "missions",
    });
    pendingActionRef.current = () => setIsMissionsOpen(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }

    setTransitionState({
      isActive: false,
      type: null,
      source: null,
    });
  }, []);

  const handleUploadClick = useCallback(() => {
    setShowUploadMenu(true);
  }, []);

  // Called when the user selects an action in the upload panel (Upload Files / Paste Link / Add Note).
  // Closes the panel, transitions to Collections, and sets Collections as the active dock item.
  const handleUploadActionSelected = useCallback(() => {
    setShowUploadMenu(false);
    setDockActiveIndex(DOCK_INDEX_COLLECTIONS);
    setIsCollectionsOpen(true);
  }, []);

  const handleOpenCollections = useCallback(() => {
    setIsCollectionsOpen(true);
  }, []);

  const handleCloseCollections = useCallback(() => {
    setIsCollectionsOpen(false);
  }, []);

  // Track previous dock index (used by handleDockIndexChange)
  const prevDockIndexRef = useRef(dockActiveIndex);

  // Handle OrbitDock index changes (swipe or rotation) — visual only, no open action
  const handleDockIndexChange = useCallback((index: number) => {
    setDockActiveIndex(index);
    prevDockIndexRef.current = index;
  }, []);

  // Keep rotation state in sync — persist so OrbitDock restores position on re-mount
  const handleDockRotationChange = useCallback((rotation: number) => {
    setDockRotation(rotation);
  }, []);

  // Handle OrbitDock item activation (tap on centered icon) — fires the open action
  const handleDockItemActivate = useCallback(
    (index: number) => {
      if (index === DOCK_INDEX_UPLOAD) {
        handleUploadClick();
      } else if (index === DOCK_INDEX_FOLDERS) {
        handleOpenFolders();
      } else if (index === DOCK_INDEX_MISSION) {
        handleOpenMissions();
      } else if (index === DOCK_INDEX_COLLECTIONS) {
        handleOpenCollections();
      }
    },
    [
      handleUploadClick,
      handleOpenFolders,
      handleOpenMissions,
      handleOpenCollections,
    ],
  );

  const mainContent = useMemo(() => {
    if (!isAuthenticated && !isInitializing) {
      return (
        <MobileOnlyLayout>
          <WelcomeIntroScreen />
        </MobileOnlyLayout>
      );
    }

    if (isAuthenticated && isFinalFailure && error) {
      return (
        <MobileOnlyLayout>
          <ActorInitErrorState
            summary={error.summary}
            technicalDetails={error.technicalDetails}
            classification={error.classification}
            onRetry={retry}
            onLogout={signOut}
          />
        </MobileOnlyLayout>
      );
    }

    if (isAuthenticated) {
      return (
        <MobileOnlyLayout>
          <Suspense
            fallback={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </main>
                <Footer />
              </div>
            }
          >
            {isCollectionsOpen ? (
              <CollectionsFullScreenView
                onClose={handleCloseCollections}
                onUploadRequest={() => setShowUploadMenu(true)}
              />
            ) : isMissionsOpen ? (
              <MissionsFullScreenView onClose={handleCloseMissions} />
            ) : isFoldersOpen ? (
              <FoldersFullScreenView
                onClose={handleCloseFolders}
                onSelectFolder={handleFolderSelect}
              />
            ) : (
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 pb-36" />
                <DecorativeBottomLine />
                <OrbitDock
                  activeIndex={dockActiveIndex}
                  initialRotation={dockRotation}
                  onIndexChange={handleDockIndexChange}
                  onItemActivate={handleDockItemActivate}
                  onRotationChange={handleDockRotationChange}
                  disabled={!isActorReady}
                  behindOverlay={false}
                />
                <Footer />
              </div>
            )}
            {/* FileUploadSection is always mounted so it can handle uploads
                triggered from CollectionsFullScreenView as well */}
            <FileUploadSection
              showMenu={showUploadMenu}
              onMenuChange={setShowUploadMenu}
              onActionSelected={handleUploadActionSelected}
            />
          </Suspense>
          <HomeSharedElementTransitionLayer
            isActive={transitionState.isActive}
            transitionType={transitionState.type}
            source={transitionState.source}
            onTransitionComplete={handleTransitionComplete}
          />
        </MobileOnlyLayout>
      );
    }

    return (
      <MobileOnlyLayout>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </MobileOnlyLayout>
    );
  }, [
    isAuthenticated,
    isInitializing,
    isActorReady,
    isFinalFailure,
    error,
    retry,
    signOut,
    isFoldersOpen,
    isMissionsOpen,
    isCollectionsOpen,
    transitionState,
    showUploadMenu,
    dockActiveIndex,
    dockRotation,
    handleCloseFolders,
    handleCloseMissions,
    handleCloseCollections,
    handleFolderSelect,
    handleTransitionComplete,
    handleDockIndexChange,
    handleDockItemActivate,
    handleDockRotationChange,
    handleUploadActionSelected,
  ]);

  return mainContent;
}
