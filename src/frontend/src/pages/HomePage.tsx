import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUploadSection from '@/components/FileUploadSection';
import GallerySection from '@/components/GallerySection';
import FoldersButton from '@/components/FoldersButton';
import MissionsButton from '@/components/MissionsButton';
import DecorativeBottomLine from '@/components/DecorativeBottomLine';
import ActorInitErrorState from '@/components/ActorInitErrorState';
import WelcomeIntroScreen from '@/components/WelcomeIntroScreen';
import MobileOnlyLayout from '@/components/MobileOnlyLayout';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useBackendActor } from '@/contexts/ActorContext';
import { useGetFolders, useGetFilesNotInFolder } from '@/hooks/useQueries';
import { useListMissions } from '@/hooks/useMissionsQueries';
import { useHomePrefetch } from '@/hooks/useHomePrefetch';
import type { Folder } from '@/backend';

// Lazy-load full-screen views for better startup performance
const FoldersFullScreenView = lazy(() => import('@/components/FoldersFullScreenView'));
const MissionsFullScreenView = lazy(() => import('@/components/MissionsFullScreenView'));

export default function HomePage() {
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderOpenedFromFoldersView, setFolderOpenedFromFoldersView] = useState(false);
  const [isBulkSelectionActive, setIsBulkSelectionActive] = useState(false);
  const { identity, isInitializing } = useInternetIdentity();
  const { status, error, retry, signOut, actor } = useBackendActor();

  // Prefetch core Home data as soon as actor is ready
  useHomePrefetch();

  // Fetch data when authenticated and actor is ready
  useGetFolders();
  useGetFilesNotInFolder();
  useListMissions();

  const isAuthenticated = !!identity;
  const isActorReady = status === 'ready';
  const isFinalFailure = status === 'error' && error;

  // Dev-only smoke test trigger (only in development mode with URL param)
  // Dynamically import smoke test utilities to avoid bundling them in production
  useEffect(() => {
    if (import.meta.env.DEV && isActorReady && actor) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('runSmokeTest') === 'true') {
        // Remove the param to prevent re-running on refresh
        urlParams.delete('runSmokeTest');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
        
        // Dynamically import smoke test utilities and toast
        console.log('[Dev] Running core flows smoke test...');
        
        Promise.all([
          import('@/utils/smokeTestCoreFlows'),
          import('sonner')
        ]).then(([{ runCoreFlowsSmokeTest, formatSmokeTestResults }, { toast }]) => {
          toast.info('Running smoke test...');
          
          runCoreFlowsSmokeTest(actor)
            .then((results) => {
              const formatted = formatSmokeTestResults(results);
              console.log(formatted);
              
              const allPassed = results.every(r => r.success);
              if (allPassed) {
                toast.success('Smoke test passed! Check console for details.');
              } else {
                toast.error('Smoke test failed! Check console for details.');
              }
            })
            .catch((error) => {
              console.error('[Dev] Smoke test error:', error);
              toast.error('Smoke test error! Check console for details.');
            });
        }).catch((error) => {
          console.error('[Dev] Failed to load smoke test utilities:', error);
        });
      }
    }
  }, [isActorReady, actor]);

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setFolderOpenedFromFoldersView(true);
  };

  const handleBackToMain = () => {
    if (folderOpenedFromFoldersView) {
      // If folder was opened from folders view, return to folders view
      setSelectedFolder(null);
      setFolderOpenedFromFoldersView(false);
      setIsFoldersOpen(true);
    } else {
      // Otherwise just clear the selected folder (return to main collection)
      setSelectedFolder(null);
    }
  };

  const handleBulkSelectionChange = (isActive: boolean) => {
    setIsBulkSelectionActive(isActive);
  };

  const mainContent = useMemo(() => {
    // Show welcome intro for unauthenticated users (every time there's no active session)
    if (!isAuthenticated && !isInitializing) {
      return (
        <MobileOnlyLayout>
          <WelcomeIntroScreen />
        </MobileOnlyLayout>
      );
    }

    // Show final failure error state only when status is 'error' (non-recoverable errors like invalid admin token)
    // Stopped-canister errors keep status as 'unavailable' and never reach 'error' state
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

    // Show main app for authenticated users (even during initialization or unavailable state)
    // During stopped-canister conditions (status='unavailable'), the app remains usable
    // and retries happen silently in the background
    if (isAuthenticated) {
      return (
        <MobileOnlyLayout>
          <Suspense fallback={
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </main>
              <Footer />
            </div>
          }>
            {isMissionsOpen ? (
              <MissionsFullScreenView onClose={() => setIsMissionsOpen(false)} />
            ) : isFoldersOpen ? (
              <FoldersFullScreenView 
                onClose={() => setIsFoldersOpen(false)} 
                onSelectFolder={handleFolderSelect}
              />
            ) : (
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 pb-32">
                  {selectedFolder === null ? (
                    <>
                      <FileUploadSection />
                      <GallerySection 
                        selectedFolder={null} 
                        onBackToMain={handleBackToMain}
                        onBulkSelectionChange={handleBulkSelectionChange}
                      />
                    </>
                  ) : (
                    <GallerySection 
                      selectedFolder={selectedFolder} 
                      onBackToMain={handleBackToMain}
                      onBulkSelectionChange={handleBulkSelectionChange}
                    />
                  )}
                </main>
                <DecorativeBottomLine />
                <FoldersButton 
                  onClick={() => setIsFoldersOpen(true)} 
                  disabled={!isActorReady}
                  behindOverlay={isBulkSelectionActive}
                />
                <MissionsButton 
                  onClick={() => setIsMissionsOpen(true)} 
                  disabled={!isActorReady}
                  behindOverlay={isBulkSelectionActive}
                />
                <Footer />
              </div>
            )}
          </Suspense>
        </MobileOnlyLayout>
      );
    }

    // Fallback to loading (only during Internet Identity initialization)
    return (
      <MobileOnlyLayout>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </MobileOnlyLayout>
    );
  }, [isAuthenticated, isInitializing, status, isActorReady, isFinalFailure, error, retry, signOut, selectedFolder, isFoldersOpen, isMissionsOpen, isBulkSelectionActive, folderOpenedFromFoldersView]);

  return mainContent;
}
