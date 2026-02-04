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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    // Check if touch started on action buttons
    if (actionsRef.current && actionsRef.current.contains(e.target as Node)) {
      return; // Let button handle the touch
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(translateX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const touch = e.touches[0];
    const diff = touch.clientX - startX;
    const newTranslate = currentX + diff;

    // Only allow swiping left (negative values)
    if (newTranslate <= 0 && newTranslate >= -MAX_SWIPE) {
      setTranslateX(newTranslate);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    // Check if mouse down started on action buttons
    if (actionsRef.current && actionsRef.current.contains(e.target as Node)) {
      return; // Let button handle the click
    }
    
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(translateX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;

    const diff = e.clientX - startX;
    const newTranslate = currentX + diff;

    // Only allow swiping left (negative values)
    if (newTranslate <= 0 && newTranslate >= -MAX_SWIPE) {
      setTranslateX(newTranslate);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;
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

  const handleEditClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
    onOpenChange(false);
  };

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    onOpenChange(false);
  };

  const handleEditTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
    onOpenChange(false);
  };

  const handleDeleteTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    onOpenChange(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Action buttons (revealed on swipe) - positioned above content */}
      <div 
        ref={actionsRef}
        className="absolute right-0 top-0 bottom-0 flex items-stretch z-10 pointer-events-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          onTouchEnd={handleEditTouch}
          className="h-full rounded-none px-4 bg-muted hover:bg-muted/80 border-l touch-manipulation"
          style={{ pointerEvents: 'auto' }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          onTouchEnd={handleDeleteTouch}
          className="h-full rounded-none px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground touch-manipulation"
          style={{ pointerEvents: 'auto' }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Swipeable content */}
      <div
        ref={contentRef}
        className="relative bg-background z-0"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}
