import { Button } from "@/components/ui/button";
import { useBackendActor } from "@/contexts/ActorContext";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import AnimatedGalleryIcon from "./AnimatedGalleryIcon";
import UnifiedProgressBar from "./UnifiedProgressBar";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { identity } = useInternetIdentity();
  const { signOut } = useBackendActor();

  const isAuthenticated = !!identity;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut size={20} strokeWidth={2} />
            </button>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center transition-all duration-300">
              <AnimatedGalleryIcon />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
      <UnifiedProgressBar />
    </header>
  );
}
