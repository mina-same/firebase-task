/**
 * App Component
 * 
 * Root application component with routing configuration
 * Wraps the application with ErrorBoundary for error handling
 * 
 * @component
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/constants';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import './App.css';

/**
 * Main App component
 * Sets up routing and layout structure
 * 
 * @returns {JSX.Element} App component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Root route - redirect to dashboard */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          
          {/* Dashboard route */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          
          {/* Chat route */}
          <Route
            path={ROUTES.CHAT}
            element={
              <MainLayout>
                <Chat />
              </MainLayout>
            }
          />
          
          {/* 404 Not Found route */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
