import { useState, useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

// Check if touch started inside a carousel
const isInsideCarousel = (element: HTMLElement | null): boolean => {
  let current = element;
  while (current) {
    if (
      current.hasAttribute('data-carousel') ||
      current.classList.contains('mobile-carousel-container') ||
      current.classList.contains('embla')
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  // Use refs to avoid stale closure issues
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const isCarouselTouchRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const isHorizontalScrollRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Skip if carousel is currently dragging (class-based coordination)
      if (document.body.classList.contains('carousel-dragging')) {
        isCarouselTouchRef.current = true;
        return;
      }

      // Check if touch started inside a carousel
      const target = e.target as HTMLElement;
      if (isInsideCarousel(target)) {
        isCarouselTouchRef.current = true;
        return;
      }

      isCarouselTouchRef.current = false;

      // Only start pull-to-refresh if at top of page
      if (window.scrollY <= 0) {
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        isPullingRef.current = true;
        isHorizontalScrollRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Skip if this is a carousel touch or carousel is dragging
      if (isCarouselTouchRef.current || document.body.classList.contains('carousel-dragging') || isHorizontalScrollRef.current) {
        return;
      }

      if (!isPullingRef.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const distanceY = currentY - startYRef.current;
      const distanceX = Math.abs(currentX - startXRef.current);

      // Detect horizontal scroll early to prevent pull-to-refresh interference
      if (distanceX > Math.abs(distanceY) && distanceX > 10) {
        isHorizontalScrollRef.current = true;
        setPullDistance(0);
        return;
      }

      const distance = Math.max(0, distanceY);

      // Only allow pull down, not up
      if (distance > 0 && window.scrollY <= 0) {
        // Apply resistance curve
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistedDistance);
        
        // Prevent default scrolling when pulling down to avoid double bounce on iOS
        if (resistedDistance > 5) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      // Skip if this was a carousel touch
      if (isCarouselTouchRef.current) {
        isCarouselTouchRef.current = false;
        return;
      }

      if (!isPullingRef.current) return;

      isPullingRef.current = false;
      isHorizontalScrollRef.current = false;

      const currentPullDistance = pullDistanceRef.current;
      
      if (currentPullDistance >= threshold && !isRefreshingRef.current) {
        setIsRefreshing(true);
        try {
          // Provide visual feedback by keeping the spinner a bit if it was very fast
          const startTime = Date.now();
          await onRefresh();
          const elapsed = Date.now() - startTime;
          if (elapsed < 500) {
            await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
          }
        } catch (error) {
          console.error('[PullToRefresh] Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setPullDistance(0);
    };

    const handleTouchCancel = () => {
      isPullingRef.current = false;
      isHorizontalScrollRef.current = false;
      setPullDistance(0);
    };

    // Use capture phase for touchstart to detect carousel early
    document.body.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.body.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.body.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      document.body.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.body.removeEventListener('touchmove', handleTouchMove);
      document.body.removeEventListener('touchend', handleTouchEnd);
      document.body.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [disabled, threshold, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    isTriggered: pullDistance >= threshold
  };
};
