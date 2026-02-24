import { useEffect, useRef, useState, useCallback } from 'react';
import { Upload, FolderOpen, Target } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OrbitDockProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

const ITEMS = [
  { id: 'upload', label: 'Upload', Icon: Upload },
  { id: 'folders', label: 'Folders', Icon: FolderOpen },
  { id: 'mission', label: 'Mission', Icon: Target },
] as const;

const ITEM_COUNT = ITEMS.length;

// Semi-circular arc: center icon at top of arc (270° = bottom of circle = top of arc visually)
// We place icons on the upper half of a circle so the arc curves upward
// Center: angle = 270° (top), Left: 270° - 65° = 205°, Right: 270° + 65° = 335°
const ARC_RADIUS = 65; // px
const ARC_ANGLES_DEG = [-65, 0, 65]; // relative to center (0 = top of arc)

function getArcPosition(relativeSlot: number, radius: number): { x: number; y: number } {
  // relativeSlot: -1 = left, 0 = center, 1 = right
  const angleDeg = ARC_ANGLES_DEG[relativeSlot + 1];
  // We want the arc to curve upward: center is highest, sides are lower
  // Using angle from vertical (0° = straight up)
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = Math.sin(angleRad) * radius;
  const y = (1 - Math.cos(angleRad)) * radius * 0.45; // positive y = downward
  return { x, y };
}

export default function OrbitDock({
  activeIndex,
  onIndexChange,
  disabled = false,
  behindOverlay = false,
}: OrbitDockProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isSwiping, setIsSwiping] = useState(false);
  const [missionJustActivated, setMissionJustActivated] = useState(false);
  const prevActiveIndexRef = useRef(activeIndex);
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadPulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadPulseActive, setUploadPulseActive] = useState(false);

  // Detect Mission becoming active for micro-interaction
  useEffect(() => {
    if (activeIndex === 2 && prevActiveIndexRef.current !== 2) {
      setMissionJustActivated(true);
      const t = setTimeout(() => setMissionJustActivated(false), 400);
      return () => clearTimeout(t);
    }
    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Upload idle pulse every 8–10 seconds
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 2000;
      uploadPulseTimerRef.current = setTimeout(() => {
        setUploadPulseActive(true);
        setTimeout(() => setUploadPulseActive(false), 700);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (uploadPulseTimerRef.current) clearTimeout(uploadPulseTimerRef.current);
    };
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (disabled) return;
    setIsSwiping(true);
    onIndexChange((activeIndex + 1) % ITEM_COUNT);
    if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    swipeTimeoutRef.current = setTimeout(() => setIsSwiping(false), 300);
  }, [disabled, activeIndex, onIndexChange]);

  const handleSwipeRight = useCallback(() => {
    if (disabled) return;
    setIsSwiping(true);
    onIndexChange((activeIndex - 1 + ITEM_COUNT) % ITEM_COUNT);
    if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    swipeTimeoutRef.current = setTimeout(() => setIsSwiping(false), 300);
  }, [disabled, activeIndex, onIndexChange]);

  const { handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } =
    useSwipeGesture({
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
      threshold: 40,
    });

  const handleItemClick = useCallback(
    (index: number) => {
      if (disabled) return;
      // Only allow clicking the center (active) item
      if (index === activeIndex) {
        onIndexChange(index);
      }
    },
    [disabled, activeIndex, onIndexChange]
  );

  // Calculate position for each item based on its slot relative to active
  const getItemStyle = (itemIndex: number) => {
    const relativeSlot = ((itemIndex - activeIndex + ITEM_COUNT) % ITEM_COUNT);
    // Map: 0 = center, 1 = right, 2 = left
    let slot: -1 | 0 | 1;
    if (relativeSlot === 0) slot = 0;
    else if (relativeSlot === 1) slot = 1;
    else slot = -1;

    if (prefersReducedMotion) {
      // Flat horizontal slide, no scale
      const x = slot * 110;
      return {
        transform: `translateX(${x}px)`,
        opacity: slot === 0 ? 1 : 0.55,
        scale: 1,
        isCenter: slot === 0,
        slot,
      };
    }

    const { x, y } = getArcPosition(slot, ARC_RADIUS);
    const scale = slot === 0 ? 1.0 : 0.8;
    const opacity = slot === 0 ? 1.0 : 0.55;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      isCenter: slot === 0,
      slot,
    };
  };

  const showGlow = !isSwiping;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 ${behindOverlay ? 'z-30' : 'z-40'}`}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        width: '300px',
        height: '130px',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Arc guide — subtle decorative arc */}
      {!prefersReducedMotion && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ bottom: '8px', width: '200px', height: '80px', overflow: 'visible' }}
          viewBox="-100 -10 200 80"
          fill="none"
        >
          <path
            d={`M -${ARC_RADIUS * Math.sin((65 * Math.PI) / 180)} ${ARC_RADIUS * (1 - Math.cos((65 * Math.PI) / 180)) * 0.45} 
               Q 0 ${-ARC_RADIUS * 0.08} 
               ${ARC_RADIUS * Math.sin((65 * Math.PI) / 180)} ${ARC_RADIUS * (1 - Math.cos((65 * Math.PI) / 180)) * 0.45}`}
            stroke="oklch(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.35"
          />
        </svg>
      )}

      {/* Icons container */}
      <div className="relative w-full h-full flex items-end justify-center" style={{ paddingBottom: '16px' }}>
        {ITEMS.map((item, index) => {
          const { transform, opacity, isCenter, slot } = getItemStyle(index);
          const Icon = item.Icon;

          // Micro-interaction classes
          const isUpload = item.id === 'upload';
          const isFolders = item.id === 'folders';
          const isMission = item.id === 'mission';

          const iconSize = isCenter ? 32 : 22;

          // Color tokens
          let iconColorClass = 'text-primary';
          if (item.id === 'mission') iconColorClass = 'text-missions-accent';
          if (item.id === 'folders') iconColorClass = 'text-sky-500 dark:text-sky-400';

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(index)}
              disabled={disabled || !isCenter}
              aria-label={item.label}
              data-transition-source={
                item.id === 'folders' ? 'folders' : item.id === 'mission' ? 'missions' : undefined
              }
              className={`absolute flex flex-col items-center gap-1 focus:outline-none select-none ${
                isCenter && !disabled ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                transform,
                opacity,
                pointerEvents: isCenter ? 'auto' : 'none',
                transition: prefersReducedMotion
                  ? 'opacity 0.15s ease'
                  : 'transform 240ms cubic-bezier(0.34, 1.20, 0.64, 1), opacity 240ms ease-in-out',
                bottom: 0,
                left: '50%',
                marginLeft: '-28px',
                width: '56px',
              }}
            >
              {/* Icon wrapper with micro-interaction effects */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: iconSize + 16,
                  height: iconSize + 16,
                }}
              >
                {/* Folders depth shadow layers */}
                {isFolders && isCenter && !prefersReducedMotion && (
                  <>
                    <div
                      className="absolute rounded-lg"
                      style={{
                        width: iconSize + 8,
                        height: iconSize + 8,
                        background: 'oklch(var(--primary) / 0.06)',
                        transform: 'translate(3px, 3px)',
                        borderRadius: '10px',
                      }}
                    />
                    <div
                      className="absolute rounded-lg"
                      style={{
                        width: iconSize + 8,
                        height: iconSize + 8,
                        background: 'oklch(var(--primary) / 0.10)',
                        transform: 'translate(1.5px, 1.5px)',
                        borderRadius: '10px',
                      }}
                    />
                  </>
                )}

                {/* Active center glow background */}
                {isCenter && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: isMission
                        ? 'oklch(var(--missions-bg) / 0.7)'
                        : isFolders
                        ? 'oklch(0.88 0.06 220 / 0.5)'
                        : 'oklch(var(--primary) / 0.08)',
                      boxShadow: isMission
                        ? '0 4px 16px oklch(var(--missions-accent) / 0.25)'
                        : isFolders
                        ? '0 4px 16px oklch(0.55 0.15 220 / 0.20)'
                        : '0 4px 16px oklch(var(--primary) / 0.20)',
                      transition: 'opacity 200ms ease',
                      opacity: showGlow ? 1 : 0,
                    }}
                  />
                )}

                <Icon
                  className={`relative z-10 ${iconColorClass} ${
                    isUpload && isCenter && uploadPulseActive && !prefersReducedMotion
                      ? 'animate-orbit-upload-pulse'
                      : ''
                  } ${
                    isMission && isCenter && missionJustActivated && !prefersReducedMotion
                      ? 'animate-orbit-mission-activate'
                      : ''
                  }`}
                  style={{
                    width: iconSize,
                    height: iconSize,
                    transition: prefersReducedMotion ? 'none' : 'width 240ms ease, height 240ms ease',
                    filter:
                      isCenter
                        ? isMission
                          ? 'drop-shadow(0 2px 6px oklch(var(--missions-accent) / 0.4))'
                          : isFolders
                          ? 'drop-shadow(0 2px 6px oklch(0.55 0.15 220 / 0.35))'
                          : 'drop-shadow(0 2px 6px oklch(var(--primary) / 0.35))'
                        : 'brightness(0.75)',
                  }}
                  strokeWidth={isCenter ? 1.5 : 1.75}
                />
              </div>

              {/* Label — fade in when center, fade out on swipe */}
              <span
                className={`text-[10px] font-medium tracking-wide ${iconColorClass}`}
                style={{
                  opacity: isCenter && showGlow ? 1 : 0,
                  transition: prefersReducedMotion
                    ? 'none'
                    : 'opacity 200ms ease-in-out',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>

              {/* Glow arc underline beneath active icon */}
              {isCenter && (
                <div
                  style={{
                    width: '28px',
                    height: '2px',
                    borderRadius: '2px',
                    marginTop: '1px',
                    background: isMission
                      ? 'oklch(var(--missions-accent))'
                      : isFolders
                      ? 'oklch(0.55 0.18 220)'
                      : 'oklch(var(--primary))',
                    boxShadow: isMission
                      ? '0 0 8px oklch(var(--missions-accent) / 0.6)'
                      : isFolders
                      ? '0 0 8px oklch(0.55 0.18 220 / 0.5)'
                      : '0 0 8px oklch(var(--primary) / 0.5)',
                    opacity: showGlow && !prefersReducedMotion ? 1 : prefersReducedMotion ? 1 : 0,
                    transition: prefersReducedMotion ? 'none' : 'opacity 180ms ease-in-out',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
