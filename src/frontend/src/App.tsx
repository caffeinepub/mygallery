import { ThemeProvider } from 'next-themes';
import { useState, useEffect, useCallback } from 'react';
import HomePage from './pages/HomePage';
import IntroScreen from './components/IntroScreen';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { UploadProvider } from './contexts/UploadContext';
import { ActorProvider } from './contexts/ActorContext';
import { useAppReturnIntro } from './hooks/useAppReturnIntro';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const [showIntro, setShowIntro] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [hasShownInitialIntro, setHasShownInitialIntro] = useState(false);

  const isAuthenticated = !!identity;

  // Show intro screen on initial authentication (login or restored session)
  useEffect(() => {
    // Only show intro if:
    // 1. User has identity (authenticated)
    // 2. Not initializing (Internet Identity has finished loading)
    // 3. Haven't shown initial intro yet
    if (isAuthenticated && !isInitializing && !hasShownInitialIntro) {
      setShowIntro(true);
      setHasShownInitialIntro(true);
      setIntroKey((prev) => prev + 1); // Force remount for fresh animation
    }
  }, [isAuthenticated, isInitializing, hasShownInitialIntro]);

  // Trigger intro on app return (tab visible / window focus)
  const handleAppReturn = useCallback(() => {
    setShowIntro(true);
    setIntroKey((prev) => prev + 1); // Force remount for fresh animation
  }, []);

  useAppReturnIntro({
    isAuthenticated,
    isInitializing,
    onAppReturn: handleAppReturn,
  });

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Reset splash flag when identity is cleared (logout)
  useEffect(() => {
    if (!identity) {
      setHasShownInitialIntro(false);
    }
  }, [identity]);

  return (
    <>
      {/* Always render HomePage immediately when authenticated */}
      <HomePage />
      
      {/* Show intro as non-blocking overlay with key to force remount */}
      {showIntro && <IntroScreen key={introKey} onComplete={handleIntroComplete} />}
    </>
  );
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
