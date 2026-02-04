import { Camera } from 'lucide-react';
import LoginButton from '@/components/LoginButton';

export default function WelcomeIntroScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-lg">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Camera className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to MyGallery
            </h1>
            <p className="text-lg text-muted-foreground">
              This is your personal space for organization and self-improvement.
              <br />
              Create missions, break them into tasks, and complete them step by step.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <LoginButton />
            <p className="text-sm text-muted-foreground">
              Sign in with Internet Identity to get started. If you don't have one, you'll be able to create it during the sign-in process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
