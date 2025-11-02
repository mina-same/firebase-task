/**
 * Mobile Menu Context
 * 
 * Provides state management for mobile sidebar menu
 * Allows Header and Sidebar components to communicate menu state
 * 
 * @module MobileMenuContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Mobile Menu Context
 * @type {React.Context<{isOpen: boolean, toggle: Function, close: Function, open: Function}>}
 */
const MobileMenuContext = createContext(null);

/**
 * Mobile Menu Provider Component
 * 
 * Provides mobile menu state management to child components
 * Handles auto-closing on window resize and ESC key press
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} MobileMenuProvider component
 */
export const MobileMenuProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Opens the mobile menu
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Closes the mobile menu
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggles the mobile menu
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Handles ESC key press to close menu
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  /**
   * Auto-close menu when window is resized to desktop size
   */
  useEffect(() => {
    const handleResize = () => {
      // Close menu if window is resized to desktop size (lg breakpoint = 1024px)
      if (window.innerWidth >= 1024 && isOpen) {
        close();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, close]);

  const value = {
    isOpen,
    toggle,
    close,
    open,
  };

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  );
};

/**
 * Custom hook to access mobile menu context
 * 
 * @returns {Object} Mobile menu context value with isOpen, toggle, close, open
 * @throws {Error} If used outside of MobileMenuProvider
 */
export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  
  if (!context) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  
  return context;
};

// Default export
export default MobileMenuContext;

