import { ReactNode } from 'react';

interface MobileOnlyLayoutProps {
  children: ReactNode;
}

export default function MobileOnlyLayout({ children }: MobileOnlyLayoutProps) {
  return (
    <div className="mobile-only-container">
      <div className="mobile-only-content">
        {children}
      </div>
    </div>
  );
}
