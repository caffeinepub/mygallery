import type { ReactNode } from "react";
import SkyBackground from "./SkyBackground";

interface MobileOnlyLayoutProps {
  children: ReactNode;
}

export default function MobileOnlyLayout({ children }: MobileOnlyLayoutProps) {
  return (
    <div className="mobile-only-container">
      {/* Sky background — always behind all content */}
      <SkyBackground />
      <div
        className="mobile-only-content"
        style={{ position: "relative", zIndex: 1 }}
      >
        {children}
      </div>
    </div>
  );
}
