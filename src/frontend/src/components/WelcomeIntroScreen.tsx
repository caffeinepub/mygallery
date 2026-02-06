import LoginButton from '@/components/LoginButton';

export default function WelcomeIntroScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="flex justify-center">
            <div className="rounded-full bg-missions-bg p-6">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
              >
                {/* Outer target ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="fill-none stroke-missions-accent"
                  strokeWidth="2"
                />
                
                {/* Middle target ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="20"
                  className="fill-none stroke-missions-accent"
                  strokeWidth="2.5"
                />
                
                {/* Inner target ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="12"
                  className="fill-none stroke-missions-accent"
                  strokeWidth="3"
                />
                
                {/* Center bullseye */}
                <circle
                  cx="32"
                  cy="32"
                  r="6"
                  className="fill-missions-accent"
                />
                
                {/* Crosshair vertical line */}
                <line
                  x1="32"
                  y1="4"
                  x2="32"
                  y2="60"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Crosshair horizontal line */}
                <line
                  x1="4"
                  y1="32"
                  x2="60"
                  y2="32"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Corner markers - top left */}
                <path
                  d="M 8 8 L 8 14 M 8 8 L 14 8"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Corner markers - top right */}
                <path
                  d="M 56 8 L 56 14 M 56 8 L 50 8"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Corner markers - bottom left */}
                <path
                  d="M 8 56 L 8 50 M 8 56 L 14 56"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Corner markers - bottom right */}
                <path
                  d="M 56 56 L 56 50 M 56 56 L 50 56"
                  className="stroke-missions-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
