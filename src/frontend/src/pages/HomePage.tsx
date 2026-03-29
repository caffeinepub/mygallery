import type { Folder } from "@/backend";
import ActorInitErrorState from "@/components/ActorInitErrorState";
import BottomNavBar from "@/components/BottomNavBar";
import FileUploadSection from "@/components/FileUploadSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeCollectionsPanel from "@/components/HomeCollectionsPanel";
import HomeSharedElementTransitionLayer from "@/components/HomeSharedElementTransitionLayer";
import MobileOnlyLayout from "@/components/MobileOnlyLayout";
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

// BottomNavBar index mapping: 0=Upload, 1=Folders, 2=Missions
const NAV_INDEX_UPLOAD = 0;
const NAV_INDEX_FOLDERS = 1;
const NAV_INDEX_MISSIONS = 2;

export default function HomePage() {
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState(NAV_INDEX_UPLOAD);

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
                .catch((err) => {
                  console.error("[Dev] Smoke test error:", err);
                  toast.error("Smoke test error! Check console for details.");
                });
            },
          )
          .catch((err) => {
            console.error("[Dev] Failed to load smoke test utilities:", err);
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
    pendingActionRef.current = () => {
      setIsFoldersOpen(false);
      setActiveNavIndex(NAV_INDEX_UPLOAD);
    };
  }, []);

  const handleCloseMissions = useCallback(() => {
    setTransitionState({
      isActive: true,
      type: "closing",
      source: "missions",
    });
    pendingActionRef.current = () => {
      setIsMissionsOpen(false);
      setActiveNavIndex(NAV_INDEX_UPLOAD);
    };
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

  const handleUploadActionSelected = useCallback(() => {
    setShowUploadMenu(false);
    // Stay on home page — collections panel is embedded in main page
  }, []);

  const handleNavItemPress = useCallback(
    (index: number) => {
      if (index === NAV_INDEX_UPLOAD) {
        setActiveNavIndex(NAV_INDEX_UPLOAD);
        setIsFoldersOpen(false);
        setIsMissionsOpen(false);
        handleUploadClick();
      } else if (index === NAV_INDEX_FOLDERS) {
        setActiveNavIndex(NAV_INDEX_FOLDERS);
        setIsMissionsOpen(false);
        handleOpenFolders();
      } else if (index === NAV_INDEX_MISSIONS) {
        setActiveNavIndex(NAV_INDEX_MISSIONS);
        setIsFoldersOpen(false);
        handleOpenMissions();
      }
    },
    [handleUploadClick, handleOpenFolders, handleOpenMissions],
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
            {isMissionsOpen ? (
              <MissionsFullScreenView onClose={handleCloseMissions} />
            ) : isFoldersOpen ? (
              <FoldersFullScreenView
                onClose={handleCloseFolders}
                onSelectFolder={handleFolderSelect}
              />
            ) : (
              <div
                className="flex min-h-screen flex-col"
                style={{ background: "transparent" }}
              >
                <Header />
                <main
                  className="flex flex-1 flex-col overflow-hidden"
                  style={{ paddingBottom: 68 }}
                >
                  <HomeCollectionsPanel
                    onUploadRequest={() => setShowUploadMenu(true)}
                  />
                </main>
              </div>
            )}
            {/* FileUploadSection always mounted to handle uploads from any view */}
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
          {/* BottomNavBar is always visible when authenticated */}
          <BottomNavBar
            activeIndex={activeNavIndex}
            onItemPress={handleNavItemPress}
            disabled={!isActorReady}
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
    transitionState,
    showUploadMenu,
    activeNavIndex,
    handleCloseFolders,
    handleCloseMissions,
    handleFolderSelect,
    handleTransitionComplete,
    handleNavItemPress,
    handleUploadActionSelected,
  ]);

  return mainContent;
}
