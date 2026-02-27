import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface OrbitDockProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onItemActivate: (index: number) => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

// ── Icon components ──────────────────────────────────────────────────────────

function UploadIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FoldersIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M2 10h20" />
    </svg>
  );
}

function MissionIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CollectionsIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" ry="1.5" />
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS = [
  { id: 'upload', label: 'Upload' },
  { id: 'folders', label: 'Folders' },
  { id: 'mission', label: 'Mission' },
  { id: 'collections', label: 'Collections' },
];

const ITEM_COUNT = ITEMS.length; // 4
const ORBIT_RADIUS = 160;
const ACTIVE_SIZE = 56;
const INACTIVE_SIZE = 42;
const TRANSITION_MS = 225;
const SWIPE_THRESHOLD = 40;
const SWIPE_VELOCITY = 0.3;

// CSS coordinate system: angle 0° = right, 90° = bottom, 180° = left, 270° = top
// Active item sits at the bottom = 90°
// 4 items spaced 90° apart

function angleToPosition(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrbitDock({
  activeIndex,
  onIndexChange,
  onItemActivate,
  disabled = false,
  behindOverlay = false,
}: OrbitDockProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const prefersReducedMotion = useReducedMotion();

  // Continuous rotation offset in degrees (accumulates with each index change)
  const [rotationOffset, setRotationOffset] = useState(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const prevActiveIndex = useRef(activeIndex);

  // Swipe gesture state
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerStartTime = useRef<number>(0);
  const isDragging = useRef(false);
  const hasSwiped = useRef(false);

  // Animate rotation smoothly
  const animateToTarget = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const animate = () => {
      const diff = targetRotation.current - currentRotation.current;
      if (Math.abs(diff) < 0.05) {
        currentRotation.current = targetRotation.current;
        setRotationOffset(targetRotation.current);
        return;
      }
      currentRotation.current += diff * 0.18;
      setRotationOffset(currentRotation.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (prevActiveIndex.current !== activeIndex) {
      const diff = activeIndex - prevActiveIndex.current;
      // Shortest path for 4 items
      let normalizedDiff = diff;
      if (normalizedDiff > ITEM_COUNT / 2) normalizedDiff -= ITEM_COUNT;
      if (normalizedDiff < -ITEM_COUNT / 2) normalizedDiff += ITEM_COUNT;
      // Each step rotates by -90° (moving active item to bottom)
      targetRotation.current = currentRotation.current - normalizedDiff * 90;
      prevActiveIndex.current = activeIndex;
      if (!prefersReducedMotion) {
        animateToTarget();
      } else {
        currentRotation.current = targetRotation.current;
        setRotationOffset(targetRotation.current);
      }
    }
  }, [activeIndex, prefersReducedMotion, animateToTarget]);

  // ── Pointer handlers ────────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled || behindOverlay) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    pointerStartTime.current = Date.now();
    isDragging.current = true;
    hasSwiped.current = false;
  }, [disabled, behindOverlay]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - (pointerStartY.current ?? e.clientY);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    isDragging.current = false;

    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - (pointerStartY.current ?? e.clientY);
    const dt = Math.max(1, Date.now() - pointerStartTime.current);
    const velocity = Math.abs(dx) / dt;

    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
    const isSwipe = isHorizontalSwipe && (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY);

    if (isSwipe) {
      hasSwiped.current = true;
      if (dx < 0) {
        // Swipe left → next item
        onIndexChange((activeIndex + 1) % ITEM_COUNT);
      } else {
        // Swipe right → previous item
        onIndexChange((activeIndex - 1 + ITEM_COUNT) % ITEM_COUNT);
      }
    }

    pointerStartX.current = null;
    pointerStartY.current = null;
  }, [activeIndex, onIndexChange]);

  // ── Item tap handler ────────────────────────────────────────────────────────

  const handleItemTap = useCallback((itemIndex: number, e: React.PointerEvent) => {
    if (disabled || behindOverlay) return;
    if (hasSwiped.current) return;
    // Check it was a small movement (tap, not drag)
    const dx = pointerStartX.current !== null ? e.clientX - pointerStartX.current : 0;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) return;

    if (itemIndex === activeIndex) {
      onItemActivate(itemIndex);
    } else {
      onIndexChange(itemIndex);
    }
  }, [activeIndex, disabled, behindOverlay, onItemActivate, onIndexChange]);

  // ── Color helpers ───────────────────────────────────────────────────────────

  function getItemColor(itemId: string, isActive: boolean): string {
    if (!isActive) {
      return isDark ? 'oklch(0.75 0 0)' : 'oklch(0.55 0 0)';
    }
    switch (itemId) {
      case 'upload':
        return isDark ? '#60A5FA' : '#2563EB';
      case 'folders':
        return isDark ? '#2DD4BF' : '#0D9488';
      case 'mission':
        return isDark ? '#A78BFA' : '#7C3AED';
      case 'collections':
        return isDark ? '#FBBF24' : '#D97706';
      default:
        return isDark ? '#60A5FA' : '#2563EB';
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  // Container: orbit center is at bottom-center
  // We need enough height to show the top of the circle
  // Top item is at -ORBIT_RADIUS from center, center is at bottom
  const containerHeight = ORBIT_RADIUS + ACTIVE_SIZE + 40;
  const containerWidth = ORBIT_RADIUS * 2 + ACTIVE_SIZE + 20;

  // Orbit center position within container
  const centerX = containerWidth / 2;
  const centerY = containerHeight - ACTIVE_SIZE / 2 - 20;

  return (
    <div
      className="relative select-none"
      style={{
        width: containerWidth,
        height: containerHeight,
        touchAction: 'pan-y',
        pointerEvents: disabled || behindOverlay ? 'none' : 'auto',
        opacity: behindOverlay ? 0.4 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {ITEMS.map((item, idx) => {
        const isActive = idx === activeIndex;

        // Base angle: active item at 90° (bottom), others offset by 90° each
        // rotationOffset shifts all items continuously
        const baseAngleDeg = 90 + (idx - activeIndex) * 90 + rotationOffset;
        const pos = angleToPosition(baseAngleDeg, ORBIT_RADIUS);

        const iconSize = isActive ? ACTIVE_SIZE : INACTIVE_SIZE;
        const scale = isActive ? 1 : 0.72;
        const opacity = isActive ? 1 : 0.6;
        const color = getItemColor(item.id, isActive);

        const itemLeft = centerX + pos.x - iconSize / 2;
        const itemTop = centerY + pos.y - iconSize / 2;

        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: itemLeft,
              top: itemTop,
              width: iconSize,
              cursor: 'pointer',
              transition: prefersReducedMotion
                ? 'none'
                : `left ${TRANSITION_MS}ms ease-in-out, top ${TRANSITION_MS}ms ease-in-out, opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              zIndex: isActive ? 10 : 5,
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              handleItemTap(idx, e);
            }}
          >
            {item.id === 'upload' && <UploadIcon color={color} size={iconSize} />}
            {item.id === 'folders' && <FoldersIcon color={color} size={iconSize} />}
            {item.id === 'mission' && <MissionIcon color={color} size={iconSize} />}
            {item.id === 'collections' && <CollectionsIcon color={color} size={iconSize} />}
            {isActive && (
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color,
                  lineHeight: 1,
                  marginTop: 8,
                  whiteSpace: 'nowrap',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
