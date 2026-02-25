import { useEffect, useRef, useState, useCallback } from 'react';
import { Upload, FolderOpen, Target } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OrbitDockProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onItemActivate: (index: number) => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

const ITEMS = [
  { id: 'upload', label: 'Upload', Icon: Upload },
  { id: 'folders', label: 'Folders', Icon: FolderOpen },
  { id: 'mission', label: 'Mission', Icon: Target },
] as const;

const ITEM_COUNT = ITEMS.length;

// Semi-circular arc geometry
// Radius: 130px — gives clear separation without overlap at max icon size (50px active)
// Angular separation: 120° between each icon (left=-120°, center=0°, right=+120°)
const ARC_RADIUS = 130; // px — increased from 100px to prevent overlap with larger icons
const ARC_ANGLES_DEG = [-120, 0, 120]; // left, center, right — 120° separation

// Active icon base size: 50px (in range 48–52px)
// Inactive icon base size: 36px (in range 34–38px)
// Scale ratio: 36/50 = 0.72 ≈ 0.75 (within 0.75–0.8 range)
const ACTIVE_ICON_SIZE = 50;
const INACTIVE_ICON_SIZE = 36;

// Animation duration for rotation (ms) — used for interaction gating
const ROTATION_DURATION_MS = 260;

function getArcPosition(relativeSlot: number, radius: number): { x: number; y: number } {
  // relativeSlot: -1 = left, 0 = center, 1 = right
  const angleDeg = ARC_ANGLES_DEG[relativeSlot + 1];
  // Arc curves upward: center is highest, sides are lower
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = Math.sin(angleRad) * radius;
  // Use a gentle vertical factor so the arc is visible but not too deep
  const y = (1 - Math.cos(angleRad)) * radius * 0.32;
  return { x, y };
}

export default function OrbitDock({
  activeIndex,
  onIndexChange,
  onItemActivate,
  disabled = false,
  behindOverlay = false,
}: OrbitDockProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isSwiping, setIsSwiping] = useState(false);
  const [missionJustActivated, setMissionJustActivated] = useState(false);
  const prevActiveIndexRef = useRef(activeIndex);
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uploadPulseActive, setUploadPulseActive] = useState(false);

  // Tap feedback state: which icon is being pressed (for scale-down effect)
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const tapFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotation-in-progress guard: prevents firing action until rotation completes
  const isRotatingRef = useRef(false);
  const rotationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Internal display index — tracks what's visually centered (may differ from activeIndex during rotation)
  const [displayIndex, setDisplayIndex] = useState(activeIndex);

  // Keep displayIndex in sync when activeIndex changes externally (e.g. swipe from parent)
  useEffect(() => {
    setDisplayIndex(activeIndex);
  }, [activeIndex]);

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
    let timerId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 2000;
      timerId = setTimeout(() => {
        setUploadPulseActive(true);
        setTimeout(() => setUploadPulseActive(false), 700);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timerId);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (tapFeedbackTimerRef.current) clearTimeout(tapFeedbackTimerRef.current);
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    };
  }, []);

  // Trigger haptic feedback if supported
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Silently ignore — some browsers throw on vibrate
      }
    }
  }, []);

  // Apply tap feedback (scale-down) to the tapped icon
  const applyTapFeedback = useCallback((index: number) => {
    setTappedIndex(index);
    triggerHaptic();
    if (tapFeedbackTimerRef.current) clearTimeout(tapFeedbackTimerRef.current);
    tapFeedbackTimerRef.current = setTimeout(() => {
      setTappedIndex(null);
    }, 120);
  }, [triggerHaptic]);

  // Swipe left: advance to next item (index + 1), visual only — no open action
  const handleSwipeLeft = useCallback(() => {
    if (disabled) return;
    setIsSwiping(true);
    const newIndex = (activeIndex + 1) % ITEM_COUNT;
    setDisplayIndex(newIndex);
    onIndexChange(newIndex);
    if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    swipeTimeoutRef.current = setTimeout(() => setIsSwiping(false), 300);
  }, [disabled, activeIndex, onIndexChange]);

  // Swipe right: go to previous item (index - 1), visual only — no open action
  const handleSwipeRight = useCallback(() => {
    if (disabled) return;
    setIsSwiping(true);
    const newIndex = (activeIndex - 1 + ITEM_COUNT) % ITEM_COUNT;
    setDisplayIndex(newIndex);
    onIndexChange(newIndex);
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
      if (isRotatingRef.current) return;

      const isCurrentlyCenter = index === displayIndex;

      if (isCurrentlyCenter) {
        // Already centered — apply tap feedback and fire the open action
        applyTapFeedback(index);
        onItemActivate(index);
      } else {
        // Side icon tapped — apply tap feedback, rotate to center only (no open action)
        applyTapFeedback(index);
        isRotatingRef.current = true;

        // Update display index immediately for visual rotation
        setDisplayIndex(index);
        // Notify parent of index change (visual only, no open)
        onIndexChange(index);

        // Clear any pending rotation timer
        if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);

        // After rotation animation completes, release the guard
        rotationTimerRef.current = setTimeout(() => {
          isRotatingRef.current = false;
        }, ROTATION_DURATION_MS);
      }
    },
    [disabled, displayIndex, onIndexChange, onItemActivate, applyTapFeedback]
  );

  // Calculate position for each item based on its slot relative to displayIndex
  const getItemStyle = (itemIndex: number) => {
    const relativeSlot = (itemIndex - displayIndex + ITEM_COUNT) % ITEM_COUNT;
    // Map: 0 = center, 1 = right, 2 = left
    let slot: -1 | 0 | 1;
    if (relativeSlot === 0) slot = 0;
    else if (relativeSlot === 1) slot = 1;
    else slot = -1;

    if (prefersReducedMotion) {
      // Flat horizontal slide, no arc — wider spacing for larger icons
      const x = slot * 150;
      return {
        transform: `translateX(${x}px)`,
        opacity: slot === 0 ? 1 : 0.55,
        isCenter: slot === 0,
        slot,
      };
    }

    const { x, y } = getArcPosition(slot, ARC_RADIUS);
    const scale = slot === 0 ? 1.0 : 0.72;
    const opacity = slot === 0 ? 1.0 : 0.55;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      isCenter: slot === 0,
      slot,
    };
  };

  const showGlow = !isSwiping;

  // Arc path for the decorative guide
  const arcEndX = Math.sin((120 * Math.PI) / 180) * ARC_RADIUS;
  const arcEndY = (1 - Math.cos((120 * Math.PI) / 180)) * ARC_RADIUS * 0.32;
  const arcCtrlY = -ARC_RADIUS * 0.10;

  // Suppress unused ref warning
  void uploadPulseTimerRef;

  return (
    <div
      className={`fixed left-1/2 ${behindOverlay ? 'z-30' : 'z-40'}`}
      style={{
        // Position the arc center at ~62% of viewport height
        top: '62vh',
        transform: 'translateX(-50%) translateY(-50%)',
        width: '380px',
        height: '200px',
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
          style={{ bottom: '24px', width: '320px', height: '120px', overflow: 'visible' }}
          viewBox="-160 -20 320 120"
          fill="none"
        >
          <path
            d={`M ${-arcEndX} ${arcEndY} Q 0 ${arcCtrlY} ${arcEndX} ${arcEndY}`}
            stroke="oklch(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.30"
          />
        </svg>
      )}

      {/* Icons container */}
      <div className="relative w-full h-full flex items-end justify-center" style={{ paddingBottom: '20px' }}>
        {ITEMS.map((item, index) => {
          const { transform, opacity, isCenter } = getItemStyle(index);
          const Icon = item.Icon;

          // Micro-interaction classes
          const isUpload = item.id === 'upload';
          const isFolders = item.id === 'folders';
          const isMission = item.id === 'mission';

          // Icon sizes: active = 50px, inactive = 36px
          const iconSize = isCenter ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE;
          // Wrapper padding: gives breathing room around the icon
          const wrapperPad = isCenter ? 20 : 16;

          // Tap feedback: scale-down to 0.95 for 120ms on any tap
          const isTapped = tappedIndex === index;

          // Color tokens
          let iconColorClass = 'text-primary';
          if (item.id === 'mission') iconColorClass = 'text-missions-accent';
          if (item.id === 'folders') iconColorClass = 'text-sky-500 dark:text-sky-400';

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(index)}
              disabled={disabled}
              aria-label={item.label}
              data-transition-source={
                item.id === 'folders' ? 'folders' : item.id === 'mission' ? 'missions' : undefined
              }
              className={`absolute flex flex-col items-center gap-1 focus:outline-none select-none ${
                !disabled ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                transform,
                opacity,
                // All icons are pointer-events enabled so side icons can be tapped to rotate
                pointerEvents: disabled ? 'none' : 'auto',
                transition: prefersReducedMotion
                  ? 'opacity 0.15s ease'
                  : `transform ${ROTATION_DURATION_MS}ms cubic-bezier(0.34, 1.20, 0.64, 1), opacity ${ROTATION_DURATION_MS}ms ease-in-out`,
                bottom: 0,
                left: '50%',
                marginLeft: `-${Math.round((iconSize + wrapperPad) / 2)}px`,
                width: `${iconSize + wrapperPad}px`,
              }}
            >
              {/* Icon wrapper with micro-interaction effects */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: iconSize + wrapperPad,
                  height: iconSize + wrapperPad,
                  // Tap feedback: subtle scale-down on any icon press
                  transform: isTapped ? 'scale(0.95)' : 'scale(1)',
                  transition: isTapped
                    ? 'transform 60ms ease-out'
                    : 'transform 120ms ease-in',
                  // Ensure crisp rendering — use will-change only on active icon
                  willChange: isCenter ? 'transform' : 'auto',
                  imageRendering: 'crisp-edges',
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
                    // Use explicit integer pixel dimensions for crisp vector rendering
                    width: iconSize,
                    height: iconSize,
                    minWidth: iconSize,
                    minHeight: iconSize,
                    // No transition on icon itself — transitions are on the container
                    transition: 'none',
                    filter:
                      isCenter
                        ? isMission
                          ? 'drop-shadow(0 2px 6px oklch(var(--missions-accent) / 0.4))'
                          : isFolders
                          ? 'drop-shadow(0 2px 6px oklch(0.55 0.15 220 / 0.35))'
                          : 'drop-shadow(0 2px 6px oklch(var(--primary) / 0.35))'
                        : 'brightness(0.75)',
                    // Ensure crisp SVG rendering
                    shapeRendering: 'geometricPrecision',
                  } as React.CSSProperties}
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
                    width: '32px',
                    height: '2px',
                    borderRadius: '2px',
                    marginTop: '2px',
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
