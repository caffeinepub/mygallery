import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = () => {
    login();
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoggingIn}
      variant="default"
      size="lg"
      className="min-w-[200px]"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" />
          Sign In with Internet Identity
        </>
      )}
    </Button>
  );
}
