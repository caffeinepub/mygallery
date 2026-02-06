import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InternetIdentityInitFallbackScreenProps {
  onProceedToLogin: () => void;
  onRetry: () => void;
  onReload: () => void;
}

/**
 * Fallback screen shown when Internet Identity initialization exceeds timeout.
 * Provides clear actions to proceed, retry, or reload.
 */
export default function InternetIdentityInitFallbackScreen({
  onProceedToLogin,
  onRetry,
  onReload,
}: InternetIdentityInitFallbackScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Connection Taking Longer Than Expected</CardTitle>
          <CardDescription>
            The authentication system is taking longer than usual to initialize. You can try the following options:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onProceedToLogin}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Proceed to Sign In
          </Button>
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Initialization
          </Button>
          <Button
            onClick={onReload}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
