import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FoldersButtonProps {
  onClick: () => void;
  disabled?: boolean;
  behindOverlay?: boolean;
  isInitializing?: boolean;
}

export default function FoldersButton({ onClick, disabled = false, behindOverlay = false, isInitializing = false }: FoldersButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg transition-all ${
        behindOverlay ? 'z-30' : 'z-40'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
      size="icon"
      aria-label="Folders"
    >
      <Folder className={`h-6 w-6 ${isInitializing ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
