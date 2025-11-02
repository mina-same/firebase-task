/**
 * Conversations List Context
 * 
 * Provides state management for conversations list visibility on mobile
 * Allows toggling the conversations list overlay on mobile devices
 * 
 * @module ConversationsListContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Conversations List Context
 * @type {React.Context<{isOpen: boolean, toggle: Function, close: Function, open: Function}>}
 */
const ConversationsListContext = createContext(null);

/**
 * Conversations List Provider Component
 * 
 * Provides conversations list state management to child components
 * Handles auto-closing on window resize and ESC key press
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} ConversationsListProvider component
 */
export const ConversationsListProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Opens the conversations list
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Closes the conversations list
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggles the conversations list
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Handles ESC key press to close list
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  /**
   * Auto-close list when window is resized to desktop size
   */
  useEffect(() => {
    const handleResize = () => {
      // Close list if window is resized to desktop size (md breakpoint = 768px)
      if (window.innerWidth >= 768 && isOpen) {
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
    <ConversationsListContext.Provider value={value}>
      {children}
    </ConversationsListContext.Provider>
  );
};

/**
 * Custom hook to access conversations list context
 * 
 * @returns {Object} Conversations list context value with isOpen, toggle, close, open
 * @throws {Error} If used outside of ConversationsListProvider
 */
export const useConversationsList = () => {
  const context = useContext(ConversationsListContext);
  
  if (!context) {
    throw new Error('useConversationsList must be used within a ConversationsListProvider');
  }
  
  return context;
};

// Default export
export default ConversationsListContext;

