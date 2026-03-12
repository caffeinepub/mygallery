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

  const cloudColor = isDark ? "#1e3a60" : "white";
  const cloudShadow = isDark ? "none" : "0 4px 12px rgba(180,210,240,0.4)";

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

      {/* Cloud 1 — large, drifts right slowly */}
      <div
        className="sky-cloud sky-cloud-1"
        style={{
          position: "absolute",
          top: "8%",
          opacity: isDark ? 0.18 : 0.82,
          filter:
            cloudShadow !== "none" ? `drop-shadow(${cloudShadow})` : "none",
        }}
      >
        <svg
          viewBox="0 0 260 100"
          width="260"
          height="100"
          fill={cloudColor}
          aria-hidden="true"
          role="presentation"
        >
          <ellipse cx="130" cy="62" rx="105" ry="34" />
          <ellipse cx="92" cy="54" rx="68" ry="30" />
          <ellipse cx="165" cy="52" rx="72" ry="28" />
          <ellipse cx="130" cy="42" rx="78" ry="34" />
        </svg>
      </div>

      {/* Cloud 2 — medium, drifts left */}
      <div
        className="sky-cloud sky-cloud-2"
        style={{
          position: "absolute",
          top: "20%",
          opacity: isDark ? 0.14 : 0.65,
          filter:
            cloudShadow !== "none" ? `drop-shadow(${cloudShadow})` : "none",
        }}
      >
        <svg
          viewBox="0 0 200 78"
          width="200"
          height="78"
          fill={cloudColor}
          aria-hidden="true"
          role="presentation"
        >
          <ellipse cx="100" cy="48" rx="82" ry="26" />
          <ellipse cx="70" cy="42" rx="52" ry="24" />
          <ellipse cx="128" cy="40" rx="58" ry="22" />
          <ellipse cx="100" cy="32" rx="62" ry="26" />
        </svg>
      </div>

      {/* Cloud 3 — small, drifts right fast */}
      <div
        className="sky-cloud sky-cloud-3"
        style={{
          position: "absolute",
          top: "5%",
          opacity: isDark ? 0.12 : 0.55,
          filter:
            cloudShadow !== "none" ? `drop-shadow(${cloudShadow})` : "none",
        }}
      >
        <svg
          viewBox="0 0 150 60"
          width="150"
          height="60"
          fill={cloudColor}
          aria-hidden="true"
          role="presentation"
        >
          <ellipse cx="75" cy="37" rx="60" ry="20" />
          <ellipse cx="52" cy="32" rx="38" ry="18" />
          <ellipse cx="96" cy="31" rx="42" ry="17" />
          <ellipse cx="75" cy="24" rx="44" ry="20" />
        </svg>
      </div>

      {/* Cloud 4 — medium-large, drifts left slowly */}
      <div
        className="sky-cloud sky-cloud-4"
        style={{
          position: "absolute",
          top: "32%",
          opacity: isDark ? 0.12 : 0.48,
          filter:
            cloudShadow !== "none" ? `drop-shadow(${cloudShadow})` : "none",
        }}
      >
        <svg
          viewBox="0 0 220 86"
          width="220"
          height="86"
          fill={cloudColor}
          aria-hidden="true"
          role="presentation"
        >
          <ellipse cx="110" cy="54" rx="90" ry="30" />
          <ellipse cx="76" cy="47" rx="60" ry="27" />
          <ellipse cx="140" cy="46" rx="65" ry="24" />
          <ellipse cx="110" cy="36" rx="68" ry="30" />
        </svg>
      </div>
    </div>
  );
}
