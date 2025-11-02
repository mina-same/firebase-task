/**
 * Header Component
 * 
 * Top navigation bar with logo and title
 * Displays the application branding and navigation
 * Responsive with mobile menu toggle
 * 
 * @component
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMobileMenu } from '../../../contexts/MobileMenuContext';
import { ROUTES } from '../../../config/constants';
import logoImage from '../../../assets/logo.png';
import './Header.module.css';

/**
 * Header component for the top navigation bar
 * 
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  const { toggle, isOpen } = useMobileMenu();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 header-modern" 
      style={{ height: 'var(--header-height)' }}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm"></div>
      
      {/* Border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      
      <div className="relative h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Section: Logo (on mobile) / Logo + Title (on desktop) */}
        <Link 
          to={ROUTES.DASHBOARD} 
          className="flex items-center gap-3 group relative flex-1 lg:flex-none"
        >
          {/* Logo Container with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="">
              <img 
                src={logoImage} 
                alt="Logo" 
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
          
          {/* Title - bigger on mobile, larger on desktop */}
          <div>
            <h1 className="text-base sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              HR Feedback Admin Panel
            </h1>
            <p className="text-xs text-gray-500 hidden md:block mt-0.5">Employee Feedback Management</p>
          </div>
        </Link>
        
        {/* Right Section: Mobile Menu Toggle (mobile) / Notifications + User Profile (desktop) */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle - Only on mobile */}
          <button
            type="button"
            onClick={toggle}
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 active:scale-95 relative group"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            {isOpen ? (
              <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop: Notifications Icon */}
          <button
            type="button"
            className="hidden lg:flex relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 active:scale-95 group"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* Desktop: User Profile with Info */}
          <div className="hidden lg:block relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 active:scale-95 group"
              aria-label="User menu"
            >
              {/* User Info */}
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">HR Personnel</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              {/* Avatar with gradient border */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: '#010028' }}>
                  <span className="text-white font-bold text-sm">HR</span>
                </div>
              </div>
              
              {/* Dropdown Arrow */}
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
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
      </div>
    </header>
  );
};

export default Header;

