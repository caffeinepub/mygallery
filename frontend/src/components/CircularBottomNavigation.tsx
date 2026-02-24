import { Plus, Folder, Target } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useCircularCarousel } from '@/hooks/useCircularCarousel';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CircularBottomNavigationProps {
  onUploadClick: () => void;
  onFoldersClick: () => void;
  onMissionsClick: () => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

const navigationItems = [
  { id: 'upload', icon: Plus, label: 'Upload', color: 'primary' },
  { id: 'mission', icon: Target, label: 'Mission', color: 'missions' },
  { id: 'files', icon: Folder, label: 'Files', color: 'sky' },
] as const;

export default function CircularBottomNavigation({
  onUploadClick,
  onFoldersClick,
  onMissionsClick,
  disabled = false,
  behindOverlay = false,
}: CircularBottomNavigationProps) {
  const prefersReducedMotion = useReducedMotion();
  const { currentIndex, rotateClockwise, rotateCounterClockwise, getItemPosition } = useCircularCarousel({
    itemCount: navigationItems.length,
    radius: 70,
    reducedMotion: prefersReducedMotion,
  });

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useSwipeGesture({
    onSwipeLeft: rotateCounterClockwise,
    onSwipeRight: rotateClockwise,
    threshold: 50,
  });

  const handleItemClick = (itemId: string) => {
    if (disabled) return;
    
    switch (itemId) {
      case 'upload':
        onUploadClick();
        break;
      case 'files':
        onFoldersClick();
        break;
      case 'mission':
        onMissionsClick();
        break;
    }
  };

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 w-[280px] h-[120px] ${
        behindOverlay ? 'z-30' : 'z-40'
      }`}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 34px)',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {navigationItems.map((item, index) => {
          const position = getItemPosition(index);
          const isCentered = (index === currentIndex);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              disabled={disabled || !isCentered}
              className={`absolute flex flex-col items-center gap-1.5 focus:outline-none ${
                disabled || !isCentered
                  ? 'cursor-default'
                  : 'cursor-pointer focus:ring-2 focus:ring-offset-2'
              } ${
                item.color === 'missions'
                  ? 'focus:ring-missions-accent'
                  : item.color === 'sky'
                  ? 'focus:ring-sky-400'
                  : 'focus:ring-primary'
              } ${
                prefersReducedMotion ? '' : 'transition-all duration-[225ms] ease-in-out'
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${isCentered ? 1.0 : 0.8})`,
                opacity: isCentered ? 1.0 : 0.55,
                pointerEvents: isCentered ? 'auto' : 'none',
              }}
              aria-label={item.label}
              data-transition-source={item.id === 'files' ? 'folders' : item.id === 'mission' ? 'missions' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`transition-all duration-200 ${
                    item.color === 'missions'
                      ? 'text-missions-accent'
                      : item.color === 'sky'
                      ? 'text-sky-500 dark:text-sky-400'
                      : 'text-primary'
                  }`}
                  style={{
                    width: isCentered ? '34px' : '25px',
                    height: isCentered ? '34px' : '25px',
                  }}
                  strokeWidth={1.5}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  item.color === 'missions'
                    ? 'text-missions-accent'
                    : 'text-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
