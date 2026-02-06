import { Target } from 'lucide-react';

interface MissionsButtonProps {
  onClick: () => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

export default function MissionsButton({ onClick, disabled = false, behindOverlay = false }: MissionsButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-16 left-[17rem] flex flex-col items-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-missions-accent focus:ring-offset-2 rounded-lg p-2 group ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 cursor-pointer'
      } ${behindOverlay ? 'z-30' : 'z-40'}`}
      aria-label="Missions"
    >
      <div className="relative">
        <div className={`w-[5.5rem] h-[5.5rem] flex items-center justify-center rounded-xl bg-missions-bg transition-all duration-200 ${
          !disabled && 'group-hover:bg-missions-bg-hover'
        }`}>
          <Target 
            className={`w-10 h-10 text-missions-accent transition-all duration-200 ${
              !disabled && 'group-hover:scale-110 animate-missions-float'
            }`}
            strokeWidth={1.5}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-missions-accent">Missions</span>
    </button>
  );
}
