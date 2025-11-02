/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to top of page when route changes
 * Ensures users start at the top when navigating to a new page
 * 
 * @component
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Watches for route changes and scrolls window to top
 * 
 * @returns {null} This component doesn't render anything
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // Smooth scroll animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

