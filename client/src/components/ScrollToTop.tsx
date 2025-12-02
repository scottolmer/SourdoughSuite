import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

// This component will reset scroll position to top when navigating to a new page
export function ScrollToTop() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);

  useEffect(() => {
    // Only scroll to top if the location actually changed (not on initial render)
    if (prevLocationRef.current !== null && prevLocationRef.current !== location) {
      // Scroll the window to the top
      window.scrollTo(0, 0);
      
      // Also find and scroll any ScrollArea elements
      const scrollAreas = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      scrollAreas.forEach(area => {
        if (area instanceof HTMLElement) {
          area.scrollTop = 0;
        }
      });
      
      console.log('Scrolled to top on navigation to:', location);
    }
    
    // Update the previous location
    prevLocationRef.current = location;
  }, [location]);

  return null;
}

export default ScrollToTop;