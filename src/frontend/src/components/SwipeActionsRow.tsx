import { useRef, useState, useEffect, ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeActionsRowProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export default function SwipeActionsRow({
  children,
  onEdit,
  onDelete,
  isOpen,
  onOpenChange,
  disabled = false,
}: SwipeActionsRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const activePointerIdRef = useRef<number | null>(null);

  const SWIPE_THRESHOLD = 60; // Minimum swipe distance to reveal actions
  const MAX_SWIPE = 140; // Maximum swipe distance (width of action buttons)

  useEffect(() => {
    // Reset position when isOpen changes externally
    if (!isOpen) {
      setTranslateX(0);
      setCurrentX(0);
    } else {
      setTranslateX(-MAX_SWIPE);
    }
  }, [isOpen]);

  useEffect(() => {
    // Close on outside click
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    
    // Check if pointer started on action buttons - if so, don't start swipe gesture
    if (actionsRef.current && actionsRef.current.contains(e.target as Node)) {
      return;
    }
    
    // Capture the pointer to receive all subsequent events
    if (contentRef.current) {
      contentRef.current.setPointerCapture(e.pointerId);
    }
    
    activePointerIdRef.current = e.pointerId;
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(translateX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled || activePointerIdRef.current !== e.pointerId) return;

    const diff = e.clientX - startX;
    const newTranslate = currentX + diff;

    // Only allow swiping left (negative values)
    if (newTranslate <= 0 && newTranslate >= -MAX_SWIPE) {
      setTranslateX(newTranslate);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || disabled || activePointerIdRef.current !== e.pointerId) return;
    
    // Release pointer capture
    if (contentRef.current) {
      contentRef.current.releasePointerCapture(e.pointerId);
    }
    
    activePointerIdRef.current = null;
    setIsDragging(false);

    // Determine if we should open or close based on swipe distance
    if (translateX < -SWIPE_THRESHOLD) {
      // Open actions
      setTranslateX(-MAX_SWIPE);
      onOpenChange(true);
    } else {
      // Close actions
      setTranslateX(0);
      onOpenChange(false);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    
    // Release pointer capture
    if (contentRef.current) {
      contentRef.current.releasePointerCapture(e.pointerId);
    }
    
    activePointerIdRef.current = null;
    setIsDragging(false);
    
    // Reset to closed state on cancel
    setTranslateX(0);
    onOpenChange(false);
  };

  const handleEditClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
    // Close the row after action
    setTranslateX(0);
    onOpenChange(false);
  };

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    // Don't close the row - let parent handle exit animation
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Action buttons (hidden by default, revealed on left swipe) */}
      <div 
        ref={actionsRef}
        className="absolute right-0 top-0 bottom-0 flex items-stretch z-10"
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0,
          transition: isDragging ? 'none' : 'opacity 0.3s ease-out',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          onTouchEnd={handleEditClick}
          className="h-full rounded-none px-4 bg-muted hover:bg-muted/80 border-l touch-manipulation"
          tabIndex={isOpen ? 0 : -1}
          disabled={disabled}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          onTouchEnd={handleDeleteClick}
          className="h-full rounded-none px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground touch-manipulation"
          tabIndex={isOpen ? 0 : -1}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Swipeable content */}
      <div
        ref={contentRef}
        className="relative bg-background z-20"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          touchAction: 'pan-y',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {children}
      </div>
    </div>
  );
}
