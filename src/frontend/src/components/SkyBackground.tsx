import { useTheme } from "next-themes";

export default function SkyBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: isDark ? "#000000" : "#ffffff",
      }}
    />
  );
}
