import { ThemeProvider } from 'next-themes';
import { useState, useEffect, useCallback } from 'react';
import HomePage from './pages/HomePage';
import IntroScreen from './components/IntroScreen';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useIntroOnAppResume } from './hooks/useIntroOnAppResume';
import { UploadProvider } from './contexts/UploadContext';
import { ActorProvider } from './contexts/ActorContext';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const [showIntro, setShowIntro] = useState(false);
  const [hasShownIntroOnLogin, setHasShownIntroOnLogin] = useState(false);

  // Show intro screen when user first logs in (identity becomes available)
  useEffect(() => {
    // Only show intro if:
    // 1. User has identity (authenticated)
    // 2. Not initializing (Internet Identity has finished loading)
    // 3. Haven't shown intro for this login yet
    if (identity && !isInitializing && !hasShownIntroOnLogin) {
      setShowIntro(true);
      setHasShownIntroOnLogin(true);
    }
  }, [identity, isInitializing, hasShownIntroOnLogin]);

  // Show intro screen when authenticated user returns to the app
  const handleAppResume = useCallback(() => {
    setShowIntro(true);
  }, []);

  useIntroOnAppResume(handleAppResume);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Reset splash flag when identity is cleared (logout)
  useEffect(() => {
    if (!identity) {
      setHasShownIntroOnLogin(false);
    }
  }, [identity]);

  return (
    <>
      {/* Always render HomePage immediately when authenticated */}
      <HomePage />
      
      {/* Show intro as non-blocking overlay */}
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
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
