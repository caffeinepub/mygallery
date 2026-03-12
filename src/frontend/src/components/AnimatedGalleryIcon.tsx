import { useTheme } from "next-themes";

export default function AnimatedGalleryIcon() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  // Explicit colors that are clearly visible in both modes
  const color = isDark ? "#A78BFA" : "#7C3AED";
  const fillColor = isDark ? "#A78BFA" : "#7C3AED";

  return (
    <div className="relative h-10 w-10 group cursor-pointer">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="MYL"
      >
        {/* Outer target ring */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Middle target ring */}
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Inner target ring */}
        <circle
          cx="32"
          cy="32"
          r="12"
          fill="none"
          stroke={color}
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* Center bullseye */}
        <circle
          cx="32"
          cy="32"
          r="6"
          fill={fillColor}
          className="transition-all duration-300 group-hover:animate-pulse"
        />

        {/* Crosshair vertical line */}
        <line
          x1="32"
          y1="4"
          x2="32"
          y2="60"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Crosshair horizontal line */}
        <line
          x1="4"
          y1="32"
          x2="60"
          y2="32"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Corner markers - top left */}
        <path
          d="M 8 8 L 8 14 M 8 8 L 14 8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Corner markers - top right */}
        <path
          d="M 56 8 L 56 14 M 56 8 L 50 8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Corner markers - bottom left */}
        <path
          d="M 8 56 L 8 50 M 8 56 L 14 56"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Corner markers - bottom right */}
        <path
          d="M 56 56 L 56 50 M 56 56 L 50 56"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 rounded-full bg-transparent group-hover:bg-current/10 transition-all duration-300 blur-sm"
        style={{ color }}
      />
    </div>
  );
}
