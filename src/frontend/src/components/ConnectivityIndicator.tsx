import { useBackendActor } from '@/contexts/ActorContext';
import { Badge } from '@/components/ui/badge';
import { Loader2, WifiOff } from 'lucide-react';

/**
 * Compact connectivity indicator that shows backend connection state.
 * Displays when actor is initializing or unavailable (stopped canister).
 */
export default function ConnectivityIndicator() {
  const { status } = useBackendActor();

  // Only show indicator when connecting or unavailable
  if (status === 'ready' || status === 'idle' || status === 'error') {
    return null;
  }

  const isInitializing = status === 'initializing';
  const isUnavailable = status === 'unavailable';

  return (
    <div className="flex items-center justify-center py-1 px-3 bg-muted/50 border-b border-border/40">
      <Badge variant="outline" className="gap-1.5 text-xs font-normal">
        {isInitializing && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting...</span>
          </>
        )}
        {isUnavailable && (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Reconnecting...</span>
          </>
        )}
      </Badge>
    </div>
  );
}
