import { Folder } from 'lucide-react';
import { forwardRef } from 'react';

interface FoldersButtonProps {
  onClick: () => void;
  disabled?: boolean;
  behindOverlay?: boolean;
  pulse?: boolean;
}

const FoldersButton = forwardRef<HTMLButtonElement, FoldersButtonProps>(
  ({ onClick, disabled = false, behindOverlay = false, pulse = false }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        data-transition-source="folders"
        className={`fixed bottom-16 left-6 flex flex-col items-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 rounded-lg p-2 group ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-105 cursor-pointer'
        } ${behindOverlay ? 'z-30' : 'z-40'} ${pulse ? 'animate-icon-pulse' : ''}`}
        aria-label="Folders"
      >
        <div className="relative">
          <div className={`w-[5.5rem] h-[5.5rem] flex items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30 transition-all duration-200 ${
            !disabled && 'group-hover:bg-sky-200 dark:group-hover:bg-sky-900/50'
          }`}>
            <Folder 
              className={`w-10 h-10 text-sky-500 dark:text-sky-400 transition-all duration-200 ${
                !disabled && 'group-hover:scale-110'
              }`}
              strokeWidth={1.5}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-foreground">Folders</span>
      </button>
    );
  }
);

FoldersButton.displayName = 'FoldersButton';

export default FoldersButton;
