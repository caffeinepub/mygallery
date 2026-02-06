import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissionsButtonProps {
  onClick: () => void;
  disabled?: boolean;
  behindOverlay?: boolean;
  isInitializing?: boolean;
}

export default function MissionsButton({ onClick, disabled = false, behindOverlay = false, isInitializing = false }: MissionsButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all bg-accent hover:bg-accent-hover ${
        behindOverlay ? 'z-30' : 'z-40'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
      size="icon"
      aria-label="Missions"
    >
      <Target className={`h-6 w-6 ${isInitializing ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
