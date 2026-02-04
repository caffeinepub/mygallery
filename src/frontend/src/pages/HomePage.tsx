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
import LoginButton from '@/components/LoginButton';
import DecorativeBottomLine from '@/components/DecorativeBottomLine';
import ActorInitErrorState from '@/components/ActorInitErrorState';
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
  const isActorError = status === 'error';
  const isActorInitializing = status === 'initializing';

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsFoldersDialogOpen(false);
  };

  const handleBackToMain = () => {
    setSelectedFolder(null);
  };

  const mainContent = useMemo(() => {
    // Show login screen for unauthenticated users
    if (!isAuthenticated && !isInitializing) {
      return (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="text-center space-y-6 px-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome to MyGallery</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  A dynamic multimedia gallery application for uploading, viewing, and organizing photos, videos, and documents.
                </p>
              </div>
              <LoginButton />
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    // Show error state only if actor initialization failed AND we're in error status
    // (During cold-start silent retry, status stays 'initializing' so error UI won't show)
    if (isAuthenticated && isActorError && error) {
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

    // Show loading state during initialization (including silent retry phase)
    if (isInitializing || (isAuthenticated && isActorInitializing)) {
      return (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-muted-foreground">Initializing...</p>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    // Show main app for authenticated users with ready actor
    if (isAuthenticated && isActorReady) {
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
              <FoldersButton onClick={() => setIsFoldersDialogOpen(true)} />
              <NotesButton onClick={() => setIsNotesOpen(true)} />
              <MissionsButton onClick={() => setIsMissionsOpen(true)} />
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

    // Fallback to loading
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
  }, [isAuthenticated, isInitializing, status, isActorReady, isActorError, isActorInitializing, error, retry, signOut, selectedFolder, isFoldersDialogOpen, isNotesOpen, isMissionsOpen]);

  return mainContent;
}
