import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import { UploadProvider } from './contexts/UploadContext';
import { ActorProvider } from './contexts/ActorContext';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ActorProvider>
        <UploadProvider>
          <HomePage />
        </UploadProvider>
      </ActorProvider>
    </ThemeProvider>
  );
}
