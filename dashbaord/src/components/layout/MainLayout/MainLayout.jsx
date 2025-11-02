/**
 * MainLayout Component
 * 
 * Main layout wrapper that includes Header, Sidebar, and content area
 * Provides consistent structure for all pages
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MobileMenuProvider } from '../../../contexts/MobileMenuContext';
import Header from '../Header';
import Sidebar from '../Sidebar';
import './MainLayout.module.css';

/**
 * Main layout component that wraps page content
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {JSX.Element} MainLayout component
 */
const MainLayout = ({ children }) => {
  return (
    <MobileMenuProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main
        className="transition-all duration-300 lg:ml-[var(--sidebar-width)]"
        style={{
          marginTop: 'var(--header-height)',
          minHeight: 'calc(100vh - var(--header-height))',
        }}
      >
        {/* Content Container */}
        <div className="px-4 pta-6 sm:px-8 md:px-12 md:py-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
    </MobileMenuProvider>
  );
};

// Prop types for type checking
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;

