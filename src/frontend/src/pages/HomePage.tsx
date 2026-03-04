import type { FileMetadata, Folder } from "@/backend";
import ActorInitErrorState from "@/components/ActorInitErrorState";
import DecorativeBottomLine from "@/components/DecorativeBottomLine";
import FileUploadSection from "@/components/FileUploadSection";
import FloatingFileStack from "@/components/FloatingFileStack";
import Footer from "@/components/Footer";
import GallerySection from "@/components/GallerySection";
import Header from "@/components/Header";
import HomeSharedElementTransitionLayer from "@/components/HomeSharedElementTransitionLayer";
import MobileOnlyLayout from "@/components/MobileOnlyLayout";
import OrbitDock from "@/components/OrbitDock";
import StackFilesFullScreenView from "@/components/StackFilesFullScreenView";
import WelcomeIntroScreen from "@/components/WelcomeIntroScreen";
import { useBackendActor } from "@/contexts/ActorContext";
import { useUpload } from "@/contexts/UploadContext";
import { useHomePrefetch } from "@/hooks/useHomePrefetch";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useListMissions } from "@/hooks/useMissionsQueries";
import { useGetFilesNotInFolder, useGetFolders } from "@/hooks/useQueries";
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
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderOpenedFromFoldersView, setFolderOpenedFromFoldersView] =
    useState(false);
  const [isBulkSelectionActive, setIsBulkSelectionActive] = useState(false);
  const [newlyUploadedFiles, setNewlyUploadedFiles] = useState<FileMetadata[]>(
    [],
  );
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [dockActiveIndex, setDockActiveIndex] = useState(DOCK_INDEX_UPLOAD);
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
  const { getCompletedUploads, clearCompletedUploads } = useUpload();
  const { data: files } = useGetFilesNotInFolder();

  useHomePrefetch();
  useGetFolders();
  useGetFilesNotInFolder();
  useListMissions();

  const isAuthenticated = !!identity;
  const isActorReady = status === "ready";
  const isFinalFailure = status === "error" && error;

  // Track completed uploads and match with backend files
  useEffect(() => {
    const completedUploads = getCompletedUploads();
    if (completedUploads.length > 0 && files) {
      const matchedFiles: FileMetadata[] = [];

      for (const upload of completedUploads) {
        if (upload.backendId) {
          const file = files.find((f) => f.id === upload.backendId);
          if (file) {
            matchedFiles.push(file);
          }
        }
      }

      if (matchedFiles.length > 0) {
        setNewlyUploadedFiles(matchedFiles);
        clearCompletedUploads();

        // Clear after animation completes
        setTimeout(() => {
          setNewlyUploadedFiles([]);
        }, 3500);
      }
    }
  }, [files, getCompletedUploads, clearCompletedUploads]);

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

  const handleFolderSelect = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setFolderOpenedFromFoldersView(true);
  }, []);

  const handleBackToMain = useCallback(() => {
    if (folderOpenedFromFoldersView) {
      setSelectedFolder(null);
      setFolderOpenedFromFoldersView(false);
      setIsFoldersOpen(true);
    } else {
      setSelectedFolder(null);
    }
  }, [folderOpenedFromFoldersView]);

  const handleBulkSelectionChange = useCallback((isActive: boolean) => {
    setIsBulkSelectionActive(isActive);
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
    setShowUploadMenu((prev) => !prev);
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

  // Handle OrbitDock index changes (swipe or rotation) — visual only, no open action
  const handleDockIndexChange = useCallback((index: number) => {
    setDockActiveIndex(index);
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
            {isStackOpen ? (
              <StackFilesFullScreenView onClose={() => setIsStackOpen(false)} />
            ) : isCollectionsOpen ? (
              <CollectionsFullScreenView onClose={handleCloseCollections} />
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
                <main className="flex-1 container mx-auto px-4 py-8 pb-36">
                  {selectedFolder === null ? (
                    <>
                      <FileUploadSection
                        showMenu={showUploadMenu}
                        onMenuChange={setShowUploadMenu}
                        onActionSelected={handleUploadActionSelected}
                      />
                      <GallerySection
                        selectedFolder={null}
                        onBackToMain={handleBackToMain}
                        onBulkSelectionChange={handleBulkSelectionChange}
                        hideCollection={true}
                      />
                    </>
                  ) : (
                    <GallerySection
                      selectedFolder={selectedFolder}
                      onBackToMain={handleBackToMain}
                      onBulkSelectionChange={handleBulkSelectionChange}
                      hideCollection={false}
                    />
                  )}
                </main>
                <DecorativeBottomLine />
                <FloatingFileStack
                  onOpenStack={() => setIsStackOpen(true)}
                  newlyUploadedFiles={newlyUploadedFiles}
                />
                <OrbitDock
                  activeIndex={dockActiveIndex}
                  onIndexChange={handleDockIndexChange}
                  onItemActivate={handleDockItemActivate}
                  disabled={!isActorReady}
                  behindOverlay={isBulkSelectionActive}
                />
                <Footer />
              </div>
            )}
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
    selectedFolder,
    isFoldersOpen,
    isMissionsOpen,
    isCollectionsOpen,
    isStackOpen,
    isBulkSelectionActive,
    transitionState,
    newlyUploadedFiles,
    showUploadMenu,
    dockActiveIndex,
    handleBackToMain,
    handleBulkSelectionChange,
    handleCloseFolders,
    handleCloseMissions,
    handleCloseCollections,
    handleFolderSelect,
    handleTransitionComplete,
    handleDockIndexChange,
    handleDockItemActivate,
    handleUploadActionSelected,
  ]);

  return mainContent;
}
