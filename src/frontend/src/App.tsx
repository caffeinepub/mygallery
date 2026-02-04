import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import IntroScreen from './components/IntroScreen';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { UploadProvider } from './contexts/UploadContext';
import { ActorProvider } from './contexts/ActorContext';

function AppContent() {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const [showIntro, setShowIntro] = useState(false);
  const [hasShownIntroThisSession, setHasShownIntroThisSession] = useState(false);

  // Show intro screen only when user successfully logs in (not when delegation already exists)
  useEffect(() => {
    // Only show intro if:
    // 1. User has identity
    // 2. Not initializing
    // 3. Login status is 'success' (meaning they just completed login, not loaded from storage)
    // 4. Haven't shown intro this session yet
    if (identity && !isInitializing && loginStatus === 'success' && !hasShownIntroThisSession) {
      setShowIntro(true);
      setHasShownIntroThisSession(true);
    }
  }, [identity, isInitializing, loginStatus, hasShownIntroThisSession]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Show intro screen after successful login
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
