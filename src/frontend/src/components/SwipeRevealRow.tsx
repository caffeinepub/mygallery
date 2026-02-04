import { useRef, useState, useEffect, ReactNode } from 'react';

interface SwipeRevealRowProps {
  children: ReactNode;
  actions: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  disabled?: boolean;
}

export default function SwipeRevealRow({
  children,
  actions,
  onOpen,
  onClose,
  isOpen = false,
  disabled = false,
}: SwipeRevealRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [actionsWidth, setActionsWidth] = useState(0);

  // Measure actions width
  useEffect(() => {
    if (actionsRef.current) {
      setActionsWidth(actionsRef.current.offsetWidth);
    }
  }, [actions]);

  // Sync external isOpen state
  useEffect(() => {
    if (isOpen) {
      setTranslateX(-actionsWidth);
    } else {
      setTranslateX(0);
    }
  }, [isOpen, actionsWidth]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to touch input
    if (e.pointerType !== 'touch' || disabled) return;

    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerType !== 'touch') return;

    setCurrentX(e.clientX);
    const deltaX = e.clientX - startX;
    
    // Calculate new position
    let newTranslateX = translateX + deltaX;
    
    // Constrain movement: can't swipe right beyond 0, can't swipe left beyond -actionsWidth
    newTranslateX = Math.max(-actionsWidth, Math.min(0, newTranslateX));
    
    if (contentRef.current) {
      contentRef.current.style.transform = `translateX(${newTranslateX}px)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerType !== 'touch') return;

    setIsDragging(false);
    
    const deltaX = currentX - startX;
    const threshold = actionsWidth * 0.3; // 30% of actions width
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Determine final state based on swipe direction and current state
    if (translateX === 0) {
      // Currently closed
      if (deltaX < -threshold) {
        // Swipe left to open
        setTranslateX(-actionsWidth);
        onOpen?.();
      } else {
        // Snap back to closed
        setTranslateX(0);
      }
    } else {
      // Currently open
      if (deltaX > threshold) {
        // Swipe right to close
        setTranslateX(0);
        onClose?.();
      } else {
        // Snap back to open
        setTranslateX(-actionsWidth);
      }
    }
  };

  const handlePointerCancel = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      contentRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        translateX !== 0
      ) {
        setTranslateX(0);
        onClose?.();
      }
    };

    if (translateX !== 0) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [translateX, onClose]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Actions container - positioned absolutely on the right */}
      <div
        ref={actionsRef}
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ pointerEvents: translateX !== 0 ? 'auto' : 'none' }}
      >
        {actions}
      </div>

      {/* Main content - slides left to reveal actions */}
      <div
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: 'pan-y',
        }}
        className="relative bg-background"
      >
        {children}
      </div>
    </div>
  );
}
