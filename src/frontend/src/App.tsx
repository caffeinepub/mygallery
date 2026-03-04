import IntroScreen from "@/components/IntroScreen";
import UploadQueueRunner from "@/components/UploadQueueRunner";
import { ActorProvider } from "@/contexts/ActorContext";
import { UploadProvider } from "@/contexts/UploadContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIntroOnAppResume } from "@/hooks/useIntroOnAppResume";
import HomePage from "@/pages/HomePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [showIntro, setShowIntro] = useState(false);
  const { identity, isInitializing } = useInternetIdentity();

  useIntroOnAppResume(() => {
    if (identity && !isInitializing) {
      setShowIntro(true);
      setTimeout(() => setShowIntro(false), 2000);
    }
  });

  return (
    <>
      <HomePage />
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <UploadQueueRunner />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ActorProvider>
          <UploadProvider>
            <AppContent />
          </UploadProvider>
        </ActorProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
