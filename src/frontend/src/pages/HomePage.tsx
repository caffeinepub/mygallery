import { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUploadSection from '@/components/FileUploadSection';
import GallerySection from '@/components/GallerySection';
import FoldersButton from '@/components/FoldersButton';
import MissionsButton from '@/components/MissionsButton';
import MobileOnlyLayout from '@/components/MobileOnlyLayout';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import WelcomeIntroScreen from '@/components/WelcomeIntroScreen';
import { useBackendActor } from '@/contexts/ActorContext';
import { useHomePrefetch } from '@/hooks/useHomePrefetch';
import type { Folder } from '@/backend';

const FoldersFullScreenView = lazy(() => import('@/components/FoldersFullScreenView'));
const MissionsFullScreenView = lazy(() => import('@/components/MissionsFullScreenView'));

export default function HomePage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { status, actor } = useBackendActor();
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showFoldersView, setShowFoldersView] = useState(false);
  const [showMissionsView, setShowMissionsView] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  useHomePrefetch();

  const isAuthenticated = !!identity;

  const handleFolderSelect = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setShowFoldersView(false);
  }, []);

  const handleBackToMain = useCallback(() => {
    setSelectedFolder(null);
  }, []);

  const handleCloseFoldersView = useCallback(() => {
    setShowFoldersView(false);
  }, []);

  const handleCloseMissionsView = useCallback(() => {
    setShowMissionsView(false);
  }, []);

  const handleBulkSelectionChange = useCallback((isActive: boolean) => {
    setBulkSelectMode(isActive);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV && status === 'ready' && isAuthenticated && actor) {
      const runSmokeTest = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('smokeTest') === 'true') {
          try {
            const { toast } = await import('sonner');
            const { runCoreFlowsSmokeTest, formatSmokeTestResults } = await import('@/utils/smokeTestCoreFlows');
            
            toast.info('Running smoke test...');
            const startTime = Date.now();
            const results = await runCoreFlowsSmokeTest(actor);
            const duration = Date.now() - startTime;
            
            const allPassed = results.every(r => r.success);
            const formattedResults = formatSmokeTestResults(results);
            
            console.log(formattedResults);
            
            if (allPassed) {
              toast.success(`Smoke test passed! (${duration}ms)`);
            } else {
              toast.error(`Smoke test failed - check console for details`);
            }
          } catch (error) {
            console.error('Smoke test error:', error);
          }
        }
      };
      
      runSmokeTest();
    }
  }, [status, isAuthenticated, actor]);

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <WelcomeIntroScreen />;
  }

  return (
    <MobileOnlyLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 pb-24">
          <FileUploadSection />
          <GallerySection
            selectedFolder={selectedFolder}
            onBackToMain={handleBackToMain}
            onBulkSelectionChange={handleBulkSelectionChange}
          />
        </main>
        <Footer />
        <FoldersButton
          onClick={() => setShowFoldersView(true)}
          disabled={status !== 'ready'}
          behindOverlay={bulkSelectMode}
        />
        <MissionsButton
          onClick={() => setShowMissionsView(true)}
          disabled={status !== 'ready'}
          behindOverlay={bulkSelectMode}
        />

        {showFoldersView && (
          <Suspense fallback={null}>
            <FoldersFullScreenView
              onClose={handleCloseFoldersView}
              onSelectFolder={handleFolderSelect}
            />
          </Suspense>
        )}

        {showMissionsView && (
          <Suspense fallback={null}>
            <MissionsFullScreenView onClose={handleCloseMissionsView} />
          </Suspense>
        )}
      </div>
    </MobileOnlyLayout>
  );
}
