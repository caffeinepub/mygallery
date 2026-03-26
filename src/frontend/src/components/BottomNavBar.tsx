import { useTheme } from "next-themes";

interface BottomNavBarProps {
  activeIndex: number;
  onItemPress: (index: number) => void;
  disabled?: boolean;
}

// Index mapping: 0=Upload, 1=Collection, 2=Folders, 3=Missions

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
      <title>Upload</title>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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
      aria-label="Collection"
    >
      <title>Collection</title>
      <rect x="3" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" ry="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" ry="1.5" />
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
      <title>Folders</title>
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
      aria-label="Missions"
    >
      <title>Missions</title>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    id: "upload",
    label: "Upload",
    lightColor: "#2563EB",
    darkColor: "#60A5FA",
  },
  {
    id: "collection",
    label: "Collection",
    lightColor: "#D97706",
    darkColor: "#FBBF24",
  },
  {
    id: "folders",
    label: "Folders",
    lightColor: "#0D9488",
    darkColor: "#2DD4BF",
  },
  {
    id: "missions",
    label: "Missions",
    lightColor: "#7C3AED",
    darkColor: "#A78BFA",
  },
];

export default function BottomNavBar({
  activeIndex,
  onItemPress,
  disabled = false,
}: BottomNavBarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <nav
      data-ocid="bottom_nav.panel"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        background: isDark
          ? "rgba(15, 15, 20, 0.92)"
          : "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {NAV_ITEMS.map((item, idx) => {
        const isActive = idx === activeIndex;
        const color = isDark ? item.darkColor : item.lightColor;
        const iconSize = isActive ? 36 : 30;
        const opacity = isActive ? 1 : 0.6;

        return (
          <button
            key={item.id}
            data-ocid={`bottom_nav.${item.id}.button`}
            type="button"
            onClick={() => !disabled && onItemPress(idx)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "4px 12px",
              background: "none",
              border: "none",
              cursor: disabled ? "default" : "pointer",
              opacity,
              transition: "opacity 180ms ease, transform 180ms ease",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              WebkitTapHighlightColor: "transparent",
              outline: "none",
            }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <div
              style={{
                width: iconSize,
                height: iconSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "width 180ms ease, height 180ms ease",
              }}
            >
              {item.id === "upload" && (
                <UploadIcon color={color} size={iconSize} />
              )}
              {item.id === "collection" && (
                <CollectionsIcon color={color} size={iconSize} />
              )}
              {item.id === "folders" && (
                <FoldersIcon color={color} size={iconSize} />
              )}
              {item.id === "missions" && (
                <MissionIcon color={color} size={iconSize} />
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 500,
                color,
                lineHeight: 1,
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
