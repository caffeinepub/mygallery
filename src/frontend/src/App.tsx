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

  // Show intro screen when user successfully logs in
  useEffect(() => {
    if (identity && !isInitializing && loginStatus === 'success' && !hasShownIntroThisSession) {
      setShowIntro(true);
      setHasShownIntroThisSession(true);
    }
  }, [identity, isInitializing, loginStatus, hasShownIntroThisSession]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Show intro screen during authentication
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
