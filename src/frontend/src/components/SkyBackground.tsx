import { useTheme } from "next-themes";

const STARS = [
  { left: 8, top: 4, size: 1.5, opacity: 0.7 },
  { left: 22, top: 9, size: 1, opacity: 0.5 },
  { left: 38, top: 3, size: 2, opacity: 0.6 },
  { left: 52, top: 11, size: 1.5, opacity: 0.4 },
  { left: 67, top: 6, size: 1, opacity: 0.7 },
  { left: 80, top: 2, size: 2, opacity: 0.5 },
  { left: 91, top: 8, size: 1.5, opacity: 0.6 },
  { left: 14, top: 18, size: 1, opacity: 0.4 },
  { left: 30, top: 22, size: 1.5, opacity: 0.5 },
  { left: 46, top: 16, size: 1, opacity: 0.6 },
  { left: 62, top: 20, size: 2, opacity: 0.4 },
  { left: 76, top: 14, size: 1, opacity: 0.5 },
  { left: 88, top: 19, size: 1.5, opacity: 0.7 },
  { left: 5, top: 28, size: 1, opacity: 0.3 },
  { left: 96, top: 25, size: 1.5, opacity: 0.4 },
];

export default function SkyBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const skyGradient = isDark
    ? "linear-gradient(180deg, #070d1a 0%, #0a1628 25%, #0d2040 55%, #142848 100%)"
    : "linear-gradient(180deg, #6bbee8 0%, #90d0f0 25%, #bce6f9 60%, #e2f4ff 100%)";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Sky gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: skyGradient,
        }}
      />

      {/* Stars (dark mode only) */}
      {isDark &&
        STARS.map((s) => (
          <div
            key={s.left * 100 + s.top}
            style={{
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "white",
              opacity: s.opacity,
            }}
          />
        ))}
    </div>
  );
}
