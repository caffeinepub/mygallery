import { useRef, useCallback } from 'react';
import type { PointerEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocityThreshold = 0.3,
}: SwipeGestureOptions) {
  const startXRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    startXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    isDraggingRef.current = true;
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    
    // Prevent default to avoid scrolling during swipe
    e.preventDefault();
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current || startXRef.current === null || startTimeRef.current === null) {
      isDraggingRef.current = false;
      return;
    }

    const deltaX = e.clientX - startXRef.current;
    const deltaTime = Date.now() - startTimeRef.current;
    const velocity = Math.abs(deltaX) / deltaTime;

    if (Math.abs(deltaX) >= threshold || velocity >= velocityThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    startXRef.current = null;
    startTimeRef.current = null;
    isDraggingRef.current = false;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  const handlePointerCancel = useCallback(() => {
    startXRef.current = null;
    startTimeRef.current = null;
    isDraggingRef.current = false;
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
