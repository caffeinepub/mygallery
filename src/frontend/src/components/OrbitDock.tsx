import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface OrbitDockProps {
  activeIndex: number;
  initialRotation?: number;
  onIndexChange: (index: number) => void;
  onItemActivate: (index: number) => void;
  onRotationChange?: (totalRotation: number) => void;
  disabled?: boolean;
  behindOverlay?: boolean;
}

// ── Icon components ──────────────────────────────────────────────────────────

function UploadIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Upload"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FoldersIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Folders"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M2 10h20" />
    </svg>
  );
}

function MissionIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Mission"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CollectionsIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Collections"
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" ry="1.5" />
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS = [
  { id: "upload", label: "Upload" },
  { id: "folders", label: "Folders" },
  { id: "mission", label: "Mission" },
  { id: "collections", label: "Collections" },
];

const ITEM_COUNT = ITEMS.length; // 4
const ORBIT_RADIUS = 160;
const ACTIVE_SIZE = 56;
const INACTIVE_SIZE = 42;
const SWIPE_THRESHOLD = 40; // px
const SWIPE_VELOCITY = 0.3; // px/ms
const SNAP_DURATION_MS = 280; // CSS transition duration
const STEP_DEG = 90; // degrees per swipe

// ── Geometry ──────────────────────────────────────────────────────────────────
//
// 4 icons are fixed on the ring at 90° spacing:
//   item[0] (Upload)      → baseAngle 180°  → at 6 o'clock when ring = 0°
//   item[1] (Folders)     → baseAngle 270°
//   item[2] (Mission)     → baseAngle 0°
//   item[3] (Collections) → baseAngle 90°
//
// The ring accumulates rotation: totalRotation += ±90° per swipe.
// Active icon = the icon whose effective angle is closest to 270° (6 o'clock)
// after the ring rotation is applied.
//
// Effective angle of item i = (baseAngle + totalRotation) mod 360
// 6 o'clock = 270° in screen space (since rotate(θ) translateY(-R) puts item at
// screen position (R·sin θ, -R·cos θ); 6 o'clock means y = +R → θ = 180° in
// the rotated frame, which maps to 270° in the non-rotated convention used here).
//
// Swipe RIGHT → ring rotates clockwise → totalRotation -= 90 (ring turns -90°)
// Swipe LEFT  → ring rotates counter-clockwise → totalRotation += 90 (ring turns +90°)
//
// After each snap, compute which item lands closest to the 6-o'clock slot and
// update activeIndex accordingly.

function computeActiveIndex(totalRotation: number): number {
  // Each item's base angle on the ring: 180 + idx*90
  // After rotation, screen angle = baseAngle + totalRotation
  // We want screen angle ≡ 180° (mod 360) — 6 o'clock in our coordinate system.
  // (rotate(θ) translateY(-R): 6 o'clock = θ mod 360 = 180)
  let bestIdx = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < ITEM_COUNT; i++) {
    const base = 180 + i * 90;
    const effective = (((base + totalRotation) % 360) + 360) % 360;
    // Distance to 180°
    let dist = Math.abs(effective - 180);
    if (dist > 180) dist = 360 - dist;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// Compute the totalRotation needed to bring itemIndex to 6 o'clock,
// choosing the shortest path from currentTotal.
function targetRotationForIndex(
  itemIndex: number,
  currentTotal: number,
): number {
  // item's base angle
  const base = 180 + itemIndex * 90;
  // We need: (base + newTotal) mod 360 = 180
  // → newTotal = 180 - base + k*360 for some integer k
  const rawTarget = 180 - base;
  // Find the closest k so that rawTarget + k*360 is nearest to currentTotal
  const diff = currentTotal - rawTarget;
  const k = Math.round(diff / 360);
  const target = rawTarget + k * 360;
  return target;
}

export default function OrbitDock({
  activeIndex,
  initialRotation,
  onIndexChange,
  onItemActivate,
  onRotationChange,
  disabled = false,
  behindOverlay = false,
}: OrbitDockProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const prefersReducedMotion = useReducedMotion();

  // ── Rotation state ──────────────────────────────────────────────────────────

  const [totalRotation, setTotalRotation] = useState(
    () => initialRotation ?? 0,
  );
  const totalRotationRef = useRef(initialRotation ?? 0);
  const isAnimating = useRef(false);

  // When activeIndex changes externally (e.g. tap-to-rotate from HomePage),
  // snap the ring to the shortest-path position that puts itemIndex at 6 o'clock.
  const prevActiveIndexRef = useRef(activeIndex);

  useEffect(() => {
    if (prevActiveIndexRef.current === activeIndex) return;
    prevActiveIndexRef.current = activeIndex;

    const target = targetRotationForIndex(
      activeIndex,
      totalRotationRef.current,
    );
    if (target !== totalRotationRef.current) {
      totalRotationRef.current = target;
      setTotalRotation(target);
    }
  }, [activeIndex]);

  // ── Shared pointer state (used by both full-screen overlay and icon taps) ────

  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerStartTime = useRef<number>(0);
  const isDragging = useRef(false);
  const hasSwiped = useRef(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const doSnapRotation = useCallback(
    (dx: number) => {
      if (isAnimating.current) return;
      hasSwiped.current = true;

      let newTotal: number;
      if (dx > 0) {
        // Swipe RIGHT → clockwise → ring rotates -90°
        newTotal = totalRotationRef.current - STEP_DEG;
      } else {
        // Swipe LEFT → counter-clockwise → ring rotates +90°
        newTotal = totalRotationRef.current + STEP_DEG;
      }

      totalRotationRef.current = newTotal;
      setTotalRotation(newTotal);
      onRotationChange?.(newTotal);

      const newActiveIdx = computeActiveIndex(newTotal);
      if (newActiveIdx !== prevActiveIndexRef.current) {
        prevActiveIndexRef.current = newActiveIdx;
        onIndexChange(newActiveIdx);
      }

      isAnimating.current = true;
      setTimeout(() => {
        isAnimating.current = false;
      }, SNAP_DURATION_MS);
    },
    [onIndexChange, onRotationChange],
  );

  // ── Full-screen swipe overlay handlers ──────────────────────────────────────
  // These run on a transparent fixed div covering the whole screen so that
  // swipes anywhere on the page are captured.

  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || behindOverlay) return;
      pointerStartX.current = e.clientX;
      pointerStartY.current = e.clientY;
      pointerStartTime.current = Date.now();
      isDragging.current = true;
      hasSwiped.current = false;
    },
    [disabled, behindOverlay],
  );

  const handleOverlayPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - (pointerStartY.current ?? e.clientY);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
    }
  }, []);

  const handleOverlayPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || pointerStartX.current === null) return;
      isDragging.current = false;

      const dx = e.clientX - pointerStartX.current;
      const dy = e.clientY - (pointerStartY.current ?? e.clientY);
      const dt = Math.max(1, Date.now() - pointerStartTime.current);
      const velocity = Math.abs(dx) / dt;

      const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) * 0.8;
      const isSwipe =
        isHorizontalSwipe &&
        (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY);

      if (isSwipe) {
        doSnapRotation(dx);
      }

      pointerStartX.current = null;
      pointerStartY.current = null;
    },
    [doSnapRotation],
  );

  // Legacy dock-container handlers (kept for backward compat, now no-ops for swipe
  // since the overlay handles everything — only icon taps bubble through)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || behindOverlay) return;
      // Only track if NOT already tracked by overlay (overlay stops propagation on swipe)
      if (pointerStartX.current === null) {
        pointerStartX.current = e.clientX;
        pointerStartY.current = e.clientY;
        pointerStartTime.current = Date.now();
        isDragging.current = true;
        hasSwiped.current = false;
      }
    },
    [disabled, behindOverlay],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - (pointerStartY.current ?? e.clientY);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || pointerStartX.current === null) return;
      isDragging.current = false;

      const dx = e.clientX - pointerStartX.current;
      const dy = e.clientY - (pointerStartY.current ?? e.clientY);
      const dt = Math.max(1, Date.now() - pointerStartTime.current);
      const velocity = Math.abs(dx) / dt;

      const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) * 0.8;
      const isSwipe =
        isHorizontalSwipe &&
        (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY);

      if (isSwipe) {
        doSnapRotation(dx);
      }

      pointerStartX.current = null;
      pointerStartY.current = null;
    },
    [doSnapRotation],
  );

  // ── Item tap handler ────────────────────────────────────────────────────────

  const handleItemTap = useCallback(
    (itemIndex: number, e: React.PointerEvent) => {
      e.stopPropagation();
      if (disabled || behindOverlay) return;
      if (hasSwiped.current) return;

      if (itemIndex === activeIndex) {
        // Icon is at 6 o'clock → activate its function
        onItemActivate(itemIndex);
      } else {
        // Icon is NOT at 6 o'clock → rotate it there (no activation, requires second tap)
        const target = targetRotationForIndex(
          itemIndex,
          totalRotationRef.current,
        );
        totalRotationRef.current = target;
        setTotalRotation(target);
        onRotationChange?.(target);
        onIndexChange(itemIndex);
        prevActiveIndexRef.current = itemIndex;

        isAnimating.current = true;
        setTimeout(() => {
          isAnimating.current = false;
        }, SNAP_DURATION_MS);
      }
    },
    [
      activeIndex,
      disabled,
      behindOverlay,
      onItemActivate,
      onIndexChange,
      onRotationChange,
    ],
  );

  // ── Color helpers ───────────────────────────────────────────────────────────

  function getItemColor(itemId: string, isActive: boolean): string {
    if (!isActive) {
      return isDark ? "oklch(0.75 0 0)" : "oklch(0.55 0 0)";
    }
    switch (itemId) {
      case "upload":
        return isDark ? "#60A5FA" : "#2563EB";
      case "folders":
        return isDark ? "#2DD4BF" : "#0D9488";
      case "mission":
        return isDark ? "#A78BFA" : "#7C3AED";
      case "collections":
        return isDark ? "#FBBF24" : "#D97706";
      default:
        return isDark ? "#60A5FA" : "#2563EB";
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Full-screen transparent overlay — captures swipes from anywhere on the page */}
      {!disabled && !behindOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 15,
            touchAction: "pan-y",
            pointerEvents: "auto",
            background: "transparent",
          }}
          onPointerDown={handleOverlayPointerDown}
          onPointerMove={handleOverlayPointerMove}
          onPointerUp={handleOverlayPointerUp}
          onPointerCancel={() => {
            isDragging.current = false;
            pointerStartX.current = null;
            hasSwiped.current = false;
          }}
        />
      )}
      {/* Zero-size anchor pinned to exact screen center */}
      <div
        className="fixed select-none"
        style={{
          top: "50vh",
          left: "50vw",
          width: 0,
          height: 0,
          touchAction: "none",
          pointerEvents: disabled || behindOverlay ? "none" : "auto",
          opacity: behindOverlay ? 0.4 : 1,
          zIndex: 20,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Rotating ring — pure rotateZ around screen center (its own origin) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            transform: `rotate(${totalRotation}deg)`,
            transformOrigin: "0 0",
            transition: prefersReducedMotion
              ? "none"
              : `transform ${SNAP_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            willChange: "transform",
          }}
        >
          {ITEMS.map((item, idx) => {
            const isActive = idx === activeIndex;
            const iconSize = isActive ? ACTIVE_SIZE : INACTIVE_SIZE;
            const scale = isActive ? 1 : 0.72;
            const opacity = isActive ? 1 : 0.6;
            const color = getItemColor(item.id, isActive);

            // Fixed base angle for this item on the ring.
            // rotate(θ) translateY(−R) → position (R·sin θ, −R·cos θ).
            // For 6 o'clock (y = +R): θ = 180°.
            // item[0]=180°, item[1]=270°, item[2]=0°, item[3]=90°
            const baseAngle = 180 + idx * 90;

            // Counter-rotate the icon wrapper so it stays upright in screen space.
            // The wrapper has been rotated by (totalRotation + baseAngle); negate that.
            const counterRotation = -(baseAngle + totalRotation);

            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  // Place icon on the orbit circumference at its base angle
                  transform: `rotate(${baseAngle}deg) translateY(-${ORBIT_RADIUS}px)`,
                  transformOrigin: "0 0",
                  width: 0,
                  height: 0,
                }}
              >
                {/* Icon wrapper: counter-rotates to stay upright, applies scale/opacity */}
                <div
                  style={{
                    position: "absolute",
                    left: -iconSize / 2,
                    top: -iconSize / 2,
                    width: iconSize,
                    height: iconSize,
                    // counter-rotation tracks totalRotation in real-time;
                    // do NOT add a CSS transition here — it would fight the ring transition
                    transform: `rotate(${counterRotation}deg) scale(${scale})`,
                    transformOrigin: "center center",
                    opacity,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: isActive ? 10 : 5,
                    transition: prefersReducedMotion
                      ? "none"
                      : "opacity 225ms ease-in-out",
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    handleItemTap(idx, e);
                  }}
                >
                  {item.id === "upload" && (
                    <UploadIcon color={color} size={iconSize} />
                  )}
                  {item.id === "folders" && (
                    <FoldersIcon color={color} size={iconSize} />
                  )}
                  {item.id === "mission" && (
                    <MissionIcon color={color} size={iconSize} />
                  )}
                  {item.id === "collections" && (
                    <CollectionsIcon color={color} size={iconSize} />
                  )}
                  {isActive && (
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color,
                        lineHeight: 1,
                        marginTop: 8,
                        whiteSpace: "nowrap",
                        display: "block",
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
