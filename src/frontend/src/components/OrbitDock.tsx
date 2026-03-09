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
// Active icon is noticeably larger than inactive icons
const ACTIVE_SIZE = 58; // larger to stand out clearly
const INACTIVE_SIZE = 36; // smaller so contrast is clear
const SWIPE_THRESHOLD = 30; // px — lower threshold for more responsive swipe
const SWIPE_VELOCITY = 0.2; // px/ms — lower velocity threshold for immediate response
const SNAP_DURATION_MS = 260; // CSS transition duration
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
// Swipe RIGHT → ring rotates clockwise → totalRotation -= 90 (ring turns -90°)
// Swipe LEFT  → ring rotates counter-clockwise → totalRotation += 90 (ring turns +90°)

function computeActiveIndex(totalRotation: number): number {
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
  const base = 180 + itemIndex * 90;
  const rawTarget = 180 - base;
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
  // No animation lock — swipe is always immediately responsive
  const lastSwipeTime = useRef(0);

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

  // ── Shared pointer state ─────────────────────────────────────────────────────

  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerStartTime = useRef<number>(0);
  const isDragging = useRef(false);
  const hasSwiped = useRef(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const doSnapRotation = useCallback(
    (dx: number) => {
      // Debounce: allow swipe even mid-animation — only block ultra-rapid double-taps
      const now = Date.now();
      if (now - lastSwipeTime.current < 80) return; // 80ms minimum between swipes
      lastSwipeTime.current = now;

      hasSwiped.current = true;

      let newTotal: number;
      if (dx > 0) {
        // Swipe RIGHT → ring rotates clockwise (left direction visually) → -90°
        newTotal = totalRotationRef.current - STEP_DEG;
      } else {
        // Swipe LEFT → ring rotates counter-clockwise → +90°
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
    },
    [onIndexChange, onRotationChange],
  );

  // ── Full-screen swipe overlay handlers ──────────────────────────────────────

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

  // Legacy dock-container handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || behindOverlay) return;
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
    const colors: Record<string, { light: string; dark: string }> = {
      upload: { light: "#2563EB", dark: "#60A5FA" },
      folders: { light: "#0D9488", dark: "#2DD4BF" },
      mission: { light: "#7C3AED", dark: "#A78BFA" },
      collections: { light: "#D97706", dark: "#FBBF24" },
    };
    const c = colors[itemId] ?? colors.upload;
    if (isActive) {
      return isDark ? c.dark : c.light;
    }
    // Inactive: use theme-appropriate muted color
    return isDark ? "oklch(0.68 0 0)" : "oklch(0.52 0 0)";
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
        {/* Rotating ring — pure rotateZ around screen center */}
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
            // Active icon uses full ACTIVE_SIZE; inactive icons are INACTIVE_SIZE
            const iconSize = isActive ? ACTIVE_SIZE : INACTIVE_SIZE;
            // No scale transform needed — size difference alone creates the contrast
            const opacity = isActive ? 1 : 0.55;
            const color = getItemColor(item.id, isActive);
            // Active icon color for label (inactive gets same muted color as icon)
            const labelColor = getItemColor(item.id, isActive);

            const baseAngle = 180 + idx * 90;
            // Counter-rotate the icon wrapper so it stays upright in screen space.
            const counterRotation = -(baseAngle + totalRotation);

            // Wrapper size must accommodate icon + label underneath
            // Active: iconSize(58) + gap(8) + label(~18) = ~84px total height
            // Inactive: iconSize(36) + gap(6) + label(~14) = ~56px total height
            const wrapperSize = isActive ? 90 : 68;

            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `rotate(${baseAngle}deg) translateY(-${ORBIT_RADIUS}px)`,
                  transformOrigin: "0 0",
                  width: 0,
                  height: 0,
                }}
              >
                {/* Icon wrapper: counter-rotates to stay upright */}
                <div
                  style={{
                    position: "absolute",
                    // Center the wrapper on the orbit point
                    left: -wrapperSize / 2,
                    top: -iconSize / 2,
                    width: wrapperSize,
                    // Height extends downward to hold icon + label
                    height: wrapperSize,
                    transform: `rotate(${counterRotation}deg)`,
                    transformOrigin: `${wrapperSize / 2}px ${iconSize / 2}px`,
                    opacity,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    zIndex: isActive ? 10 : 5,
                    // Smooth size transition so active/inactive change animates smoothly
                    transition: prefersReducedMotion
                      ? "none"
                      : "opacity 200ms ease-in-out",
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    handleItemTap(idx, e);
                  }}
                >
                  {/* Icon SVG */}
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      // Smooth icon size transition
                      transition: prefersReducedMotion
                        ? "none"
                        : `width ${SNAP_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), height ${SNAP_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
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
                  </div>

                  {/* Label — always visible under every icon */}
                  <span
                    style={{
                      fontSize: isActive ? 14 : 11,
                      fontWeight: isActive ? 600 : 500,
                      color: labelColor,
                      lineHeight: 1,
                      marginTop: isActive ? 7 : 5,
                      whiteSpace: "nowrap",
                      display: "block",
                      textAlign: "center",
                      letterSpacing: isActive ? "0.01em" : "0",
                      transition: prefersReducedMotion
                        ? "none"
                        : `font-size ${SNAP_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
