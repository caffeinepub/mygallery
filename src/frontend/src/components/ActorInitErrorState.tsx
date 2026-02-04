import { useState } from 'react';
import { AlertCircle, RefreshCw, LogOut, ChevronDown, ChevronUp, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ActorInitErrorStateProps {
  summary: string;
  technicalDetails: string;
  classification?: string;
  onRetry: () => void;
  onLogout: () => void;
}

export default function ActorInitErrorState({ 
  summary, 
  technicalDetails,
  classification,
  onRetry, 
  onLogout 
}: ActorInitErrorStateProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Use standardized classification if available, otherwise fall back to summary check
  const isStoppedCanister = classification === 'transient-canister-unavailable' ||
                            summary.includes('backend service is currently unavailable') || 
                            summary.includes('canister needs to be restarted');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
            <div className={`rounded-full p-4 ${isStoppedCanister ? 'bg-orange-500/10' : 'bg-destructive/10'}`}>
              {isStoppedCanister ? (
                <ServerOff className="h-12 w-12 text-orange-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {isStoppedCanister ? 'Service Unavailable' : 'Connection Failed'}
              </h2>
              <p className="text-muted-foreground">
                {summary}
              </p>
            </div>

            <Collapsible 
              open={isDetailsOpen} 
              onOpenChange={setIsDetailsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between"
                >
                  <span className="text-sm font-medium">Technical Details</span>
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded-md bg-muted p-3 max-h-48 overflow-auto">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                    {technicalDetails}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={onRetry} 
                className="flex-1"
                size="lg"
                variant={isStoppedCanister ? "default" : "default"}
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
              {isStoppedCanister 
                ? 'Contact your administrator if the service remains unavailable after retrying.'
                : 'If the problem persists, try signing out and signing in again.'}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
