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
            <div className="text-lg text-muted-foreground space-y-4">
              <p className="animate-text-reveal" style={{ animationDelay: '0.1s' }}>
                You're scrolling online and you see a photo, a video, or a post that sparks an idea. Later, you notice something in a shop window. Another day, a thought comes to your mind—something you want to do, try, or build. Usually, these ideas fade away.
              </p>
              <p className="animate-text-reveal font-semibold text-foreground" style={{ animationDelay: '0.3s' }}>
                This app is made to catch them.
              </p>
              <p className="animate-text-reveal" style={{ animationDelay: '0.5s' }}>
                You save those moments—online or in real life—and organize them in one place. Then, you turn each idea into a mission. You add photos, videos, files, or notes that help you shape the idea and move it forward.
              </p>
              <p className="animate-text-reveal" style={{ animationDelay: '0.7s' }}>
                Step by step, ideas stop being random thoughts.
              </p>
              <p className="animate-text-reveal font-semibold text-foreground" style={{ animationDelay: '0.9s' }}>
                They become clear missions—meant to be completed.
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
