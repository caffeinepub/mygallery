import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import IntroScreen from './components/IntroScreen';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { UploadProvider } from './contexts/UploadContext';
import { ActorProvider } from './contexts/ActorContext';
import { useBackendActor } from './contexts/ActorContext';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { signOut } = useBackendActor();
  const [showIntro, setShowIntro] = useState(false);
  const [hasShownIntroThisLoad, setHasShownIntroThisLoad] = useState(false);

  // Show intro screen once per app load when authenticated (including restored sessions)
  useEffect(() => {
    // Only show intro if:
    // 1. User has identity (authenticated)
    // 2. Not initializing (Internet Identity has finished loading)
    // 3. Haven't shown intro this app load yet
    if (identity && !isInitializing && !hasShownIntroThisLoad) {
      setShowIntro(true);
      setHasShownIntroThisLoad(true);
    }
  }, [identity, isInitializing, hasShownIntroThisLoad]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Reset splash flag when identity is cleared (logout)
  useEffect(() => {
    if (!identity) {
      setHasShownIntroThisLoad(false);
    }
  }, [identity]);

  // Show intro screen after authentication
  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ActorProvider>
        <UploadProvider>
          <AppContent />
        </UploadProvider>
      </ActorProvider>
    </ThemeProvider>
  );
}
