import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUploadSection from '@/components/FileUploadSection';
import GallerySection from '@/components/GallerySection';
import FoldersButton from '@/components/FoldersButton';
import FoldersDialog from '@/components/FoldersDialog';
import NotesButton from '@/components/NotesButton';
import NotesFullScreenView from '@/components/NotesFullScreenView';
import MissionsButton from '@/components/MissionsButton';
import MissionsFullScreenView from '@/components/MissionsFullScreenView';
import DecorativeBottomLine from '@/components/DecorativeBottomLine';
import ActorInitErrorState from '@/components/ActorInitErrorState';
import WelcomeIntroScreen from '@/components/WelcomeIntroScreen';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useBackendActor } from '@/contexts/ActorContext';
import { useGetFolders, useGetFilesNotInFolder } from '@/hooks/useQueries';
import { useListNotes } from '@/hooks/useNotesQueries';
import { useListMissions } from '@/hooks/useMissionsQueries';
import type { Folder } from '@/backend';

export default function HomePage() {
  const [isFoldersDialogOpen, setIsFoldersDialogOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const { identity, isInitializing } = useInternetIdentity();
  const { status, error, retry, signOut } = useBackendActor();

  // Only fetch data when authenticated and actor is ready
  useGetFolders();
  useGetFilesNotInFolder();
  useListNotes();
  useListMissions();

  const isAuthenticated = !!identity;
  const isActorReady = status === 'ready';
  const isFinalFailure = status === 'error' && error;

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsFoldersDialogOpen(false);
  };

  const handleBackToMain = () => {
    setSelectedFolder(null);
  };

  const mainContent = useMemo(() => {
    // Show welcome intro for unauthenticated users (every time there's no active session)
    if (!isAuthenticated && !isInitializing) {
      return <WelcomeIntroScreen />;
    }

    // Show final failure error state only after retry budget is exhausted
    if (isAuthenticated && isFinalFailure && error) {
      return (
        <ActorInitErrorState 
          summary={error.summary}
          technicalDetails={error.technicalDetails}
          classification={error.classification}
          onRetry={retry} 
          onLogout={signOut} 
        />
      );
    }

    // Show main app for authenticated users (even during initialization or unavailable state)
    // No ConnectivityIndicator shown during silent retries
    if (isAuthenticated) {
      return (
        <>
          {isNotesOpen ? (
            <NotesFullScreenView onClose={() => setIsNotesOpen(false)} />
          ) : isMissionsOpen ? (
            <MissionsFullScreenView onClose={() => setIsMissionsOpen(false)} />
          ) : (
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8 pb-32">
                {selectedFolder === null ? (
                  <>
                    <FileUploadSection />
                    <GallerySection selectedFolder={null} onBackToMain={handleBackToMain} />
                  </>
                ) : (
                  <GallerySection selectedFolder={selectedFolder} onBackToMain={handleBackToMain} />
                )}
              </main>
              <DecorativeBottomLine />
              <FoldersButton 
                onClick={() => setIsFoldersDialogOpen(true)} 
                disabled={!isActorReady}
              />
              <NotesButton 
                onClick={() => setIsNotesOpen(true)} 
                disabled={!isActorReady}
              />
              <MissionsButton 
                onClick={() => setIsMissionsOpen(true)} 
                disabled={!isActorReady}
              />
              <FoldersDialog
                open={isFoldersDialogOpen}
                onOpenChange={setIsFoldersDialogOpen}
                onSelectFolder={handleFolderSelect}
              />
              <Footer />
            </div>
          )}
        </>
      );
    }

    // Fallback to loading (only during Internet Identity initialization)
    return (
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
    );
  }, [isAuthenticated, isInitializing, status, isActorReady, isFinalFailure, error, retry, signOut, selectedFolder, isFoldersDialogOpen, isNotesOpen, isMissionsOpen]);

  return mainContent;
}
