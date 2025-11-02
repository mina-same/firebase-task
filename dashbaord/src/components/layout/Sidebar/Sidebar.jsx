/**
 * Sidebar Component
 * 
 * Vertical navigation sidebar with links to different pages
 * Highlights the active route
 * Responsive with smooth mobile animations
 * 
 * @component
 */

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMobileMenu } from '../../../contexts/MobileMenuContext';
import { ROUTES } from '../../../config/constants';
import './Sidebar.module.css';

/**
 * Sidebar navigation component
 * 
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = () => {
  const location = useLocation();
  const { isOpen, close } = useMobileMenu();
  const sidebarRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  /**
   * Navigation items configuration
   */
  const navItems = [
    {
      to: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      to: ROUTES.CHAT,
      label: 'Chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
  ];
  
  /**
   * Determines if a nav link is active
   * 
   * @param {string} path - Route path to check
   * @returns {boolean} True if the route is active
   */
  const isActive = (path) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path || location.pathname === ROUTES.HOME;
    }
    return location.pathname === path;
  };

  /**
   * Handle click outside to close mobile menu (for backdrop)
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  /**
   * Handle navigation click - close mobile menu on mobile and scroll to top
   */
  const handleNavClick = () => {
    // Close mobile menu on mobile devices
    if (window.innerWidth < 1024) {
      close();
    }
    
    // Scroll to top when navigating to a new page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  /**
   * Focus management for accessibility
   */
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Only focus on mobile devices
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      if (isMobile) {
        // Focus the first nav link when menu opens on mobile
        const firstLink = sidebarRef.current.querySelector('a');
        if (firstLink) {
          setTimeout(() => firstLink.focus(), 100);
        }
      }
    }
  }, [isOpen]);
  
  // Determine if we're on desktop (lg breakpoint = 1024px)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-gray-900 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-50 visible' : 'opacity-0 invisible'
        }`}
        onClick={handleBackdropClick}
        style={{ top: 'var(--header-height)' }}
        aria-hidden={!isOpen}
      />
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 bg-white border-r border-gray-200 h-full overflow-hidden transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          // Mobile: overlay with shadow, Desktop: integrated sidebar without shadow
          isDesktop ? 'z-40' : 'z-50 shadow-lg'
        }`}
        style={{
          width: 'var(--sidebar-width)',
          top: 'var(--header-height)',
          bottom: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0)', // Safe area for mobile devices
        }}
        aria-label="Main navigation"
        aria-hidden={isDesktop ? false : !isOpen}
      >
        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" aria-label="Main navigation" style={{ flex: '1 1 auto', maxHeight: 'calc(100vh - var(--header-height) - 90px)', paddingBottom: '0.5rem' }}>
          {navItems.map((item) => {
            const active = isActive(item.to);
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                  }
                `}
                aria-current={active ? 'page' : undefined}
                onClick={handleNavClick}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 transition-colors duration-200 ${
                  active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'
                }`}>
                  {item.icon}
                </span>
                
                {/* Label */}
                <span className="font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section - Only visible on mobile */}
        <div className="border-t border-gray-200 p-3 pb-3 mt-2 flex-shrink-0 lg:hidden">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/80 transition-all duration-200 active:scale-95 group"
              aria-label="User menu"
            >
              {/* Avatar with gradient */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm">HR</span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">HR Personnel</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
              
              {/* Dropdown Arrow */}
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User Dropdown Menu - Same as header */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">HR Personnel</p>
                    <p className="text-xs text-gray-500 mt-0.5">hr@company.com</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </div>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Preferences
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

