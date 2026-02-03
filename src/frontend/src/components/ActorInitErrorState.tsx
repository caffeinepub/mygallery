import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ActorInitErrorStateProps {
  error: Error;
  onRetry: () => void;
  onLogout: () => void;
}

export default function ActorInitErrorState({ error, onRetry, onLogout }: ActorInitErrorStateProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Connection Failed</h2>
              <p className="text-muted-foreground">
                Unable to initialize the application. This may be due to a network issue or temporary service interruption.
              </p>
              {error.message && (
                <p className="text-sm text-muted-foreground/80 mt-2 font-mono bg-muted px-3 py-2 rounded">
                  {error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={onRetry} 
                className="flex-1"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
              <Button 
                onClick={onLogout} 
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              If the problem persists, try signing out and signing in again.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
