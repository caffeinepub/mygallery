import { useEffect, useRef, useState } from 'react';

interface TransitionState {
  type: 'opening' | 'closing' | null;
  source: 'folders' | 'missions' | null;
  sourceRect: DOMRect | null;
  targetRect: DOMRect | null;
}

interface HomeSharedElementTransitionLayerProps {
  isActive: boolean;
  transitionType: 'opening' | 'closing' | null;
  source: 'folders' | 'missions' | null;
  onTransitionComplete: () => void;
}

export default function HomeSharedElementTransitionLayer({
  isActive,
  transitionType,
  source,
  onTransitionComplete,
}: HomeSharedElementTransitionLayerProps) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    type: null,
    source: null,
    sourceRect: null,
    targetRect: null,
  });
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !transitionType || !source) {
      return;
    }

    // Capture source and target positions
    const sourceElement = document.querySelector(`[data-transition-source="${source}"]`);
    const targetElement = document.querySelector(`[data-transition-target="${source}"]`);

    if (!sourceElement || !targetElement) {
      onTransitionComplete();
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    setTransitionState({
      type: transitionType,
      source,
      sourceRect,
      targetRect,
    });

    // Start animation
    animationFrameRef.current = requestAnimationFrame(() => {
      timeoutRef.current = window.setTimeout(() => {
        onTransitionComplete();
        setTransitionState({
          type: null,
          source: null,
          sourceRect: null,
          targetRect: null,
        });
      }, 350); // 350ms duration
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, transitionType, source, onTransitionComplete]);

  if (!transitionState.type || !transitionState.sourceRect || !transitionState.targetRect) {
    return null;
  }

  const { type, sourceRect, targetRect } = transitionState;
  const isOpening = type === 'opening';

  // Calculate transform values
  const startRect = isOpening ? sourceRect : targetRect;
  const endRect = isOpening ? targetRect : sourceRect;

  const scaleX = startRect.width / endRect.width;
  const scaleY = startRect.height / endRect.height;
  const translateX = startRect.left - endRect.left;
  const translateY = startRect.top - endRect.top;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 z-[100] transition-backdrop-blur"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          animation: isOpening ? 'fadeIn 350ms ease-in-out' : 'fadeOut 350ms ease-in-out',
          pointerEvents: 'none',
        }}
      />

      {/* Shared element clone */}
      <div
        className="fixed z-[101] pointer-events-none"
        style={{
          left: `${endRect.left}px`,
          top: `${endRect.top}px`,
          width: `${endRect.width}px`,
          height: `${endRect.height}px`,
          transform: isOpening
            ? `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
            : 'translate(0, 0) scale(1, 1)',
          opacity: isOpening ? 0.8 : 1,
          animation: isOpening
            ? 'sharedElementOpen 350ms ease-in-out forwards'
            : 'sharedElementClose 350ms ease-in-out forwards',
          borderRadius: '0.75rem',
          backgroundColor: source === 'folders' 
            ? 'oklch(var(--sky-100))' 
            : 'oklch(var(--missions-bg))',
        }}
      />
    </>
  );
}
