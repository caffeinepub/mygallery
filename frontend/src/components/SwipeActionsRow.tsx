import { useRef, useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeActionsRowProps {
  children: React.ReactNode;
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  const SWIPE_THRESHOLD = 80;
  const ACTION_WIDTH = 160;

  useEffect(() => {
    if (isOpen) {
      setTranslateX(-ACTION_WIDTH);
    } else {
      setTranslateX(0);
    }
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setCurrentX(e.clientX);
    const deltaX = e.clientX - startX;
    const newTranslateX = isOpen ? -ACTION_WIDTH + deltaX : deltaX;
    
    if (newTranslateX <= 0) {
      setTranslateX(Math.max(newTranslateX, -ACTION_WIDTH));
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease-out';
    }
    
    const deltaX = currentX - startX;
    
    if (isOpen) {
      if (deltaX > SWIPE_THRESHOLD / 2) {
        onOpenChange(false);
      } else {
        setTranslateX(-ACTION_WIDTH);
      }
    } else {
      if (deltaX < -SWIPE_THRESHOLD) {
        onOpenChange(true);
      } else {
        setTranslateX(0);
      }
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    setTimeout(() => onEdit(), 100);
  };

  const handleDelete = () => {
    // Proactively close the swipe row state before delegating delete
    onOpenChange(false);
    // Small delay to allow the close animation to start
    setTimeout(() => onDelete(), 50);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      data-swipe-row="true"
    >
      {/* Actions (revealed on swipe) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-20 rounded-none bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleEdit}
          disabled={disabled}
        >
          <Edit2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-20 rounded-none bg-destructive hover:bg-destructive/90 text-white"
          onClick={handleDelete}
          disabled={disabled}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative bg-background touch-pan-y"
      >
        {children}
      </div>
    </div>
  );
}
