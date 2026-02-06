import LoginButton from '@/components/LoginButton';
import MissionTargetIcon from '@/components/MissionTargetIcon';

export default function WelcomeIntroScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="flex justify-center">
            <div className="rounded-full bg-missions-bg p-6">
              <MissionTargetIcon size={64} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Turn inspiration into action.
            </h1>
            <div className="text-lg text-muted-foreground space-y-4">
              <p>
                This self-improvement app lets you save anything that inspires you—recipes, workout plans, photos, videos, or documents—and organize them in a smart gallery with folders like Photos, Videos, and Files.
              </p>
              <p>
                Create missions for your goals, such as cooking a meal, following a weekly workout, or completing important personal or work tasks. Break each mission into tasks and attach the exact photos, videos, or files you need to complete them.
              </p>
              <p className="font-semibold text-foreground">
                Stop collecting ideas. Start completing them
              </p>
            </div>
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
