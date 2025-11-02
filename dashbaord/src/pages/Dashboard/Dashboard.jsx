/**
 * Dashboard Page
 * 
 * Main dashboard view displaying feedback data and analytics
 * Includes real-time score chart and feedback table
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import useFeedback from '../../hooks/useFeedback'; // Real Firebase hook
import { filterFeedback } from '../../utils/helpers';
import ScoreChart from '../../components/dashboard/ScoreChart';
import FeedbackTable from '../../components/dashboard/FeedbackTable';
import FeedbackDetailModal from '../../components/dashboard/FeedbackDetailModal';
import SearchBar from '../../components/dashboard/SearchBar';
import Loading from '../../components/common/Loading';
import './Dashboard.module.css';

/**
 * Dashboard page component
 * 
 * @returns {JSX.Element} Dashboard page
 */
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch feedback data with real-time updates
  const {
    feedback,
    loading,
    error,
    scoreDistribution,
    feedbackCount,
  } = useFeedback({ realtime: true });
  
  /**
   * Filters feedback based on search query
   */
  const filteredFeedback = useMemo(() => {
    return filterFeedback(feedback, searchQuery);
  }, [feedback, searchQuery]);
  
  /**
   * Handles search query change
   * 
   * @param {string} query - Search query
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  /**
   * Handles feedback row click - Opens detail modal
   * 
   * @param {Object} feedbackItem - Feedback item clicked
   */
  const handleFeedbackClick = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setIsModalOpen(true);
  };
  
  /**
   * Handles modal close
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
  };

  /**
   * Handles navigation to another feedback record
   * 
   * @param {Object} feedbackItem - Feedback item to navigate to
   */
  const handleNavigateFeedback = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    // Modal stays open, just update the selected feedback
  };
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Employee feedback overview and analytics
          </p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Score Distribution Chart */}
        <ScoreChart
          scoreDistribution={scoreDistribution}
          loading={loading}
        />
      </div>
      
      {/* Feedback Records Section - Modern Compact Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header and Search - Ultra Compact */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-5 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            Feedback Records
          </h2>
          
            {/* Search Bar - Compact */}
            <div className="w-full sm:w-auto sm:min-w-[220px] md:w-72">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
          {/* Results Count - Minimal */}
        {searchQuery && (
            <div className="mt-1.5 text-xs text-gray-400">
            {filteredFeedback.length === 0 ? (
                <span>No results for "{searchQuery}"</span>
            ) : (
              <span>
                  {filteredFeedback.length} of {feedbackCount}
                {filteredFeedback.length !== feedbackCount && (
                  <button
                    onClick={() => setSearchQuery('')}
                      className="ml-1.5 text-gray-500 hover:text-gray-700 font-medium"
                  >
                      Clear
                  </button>
                )}
              </span>
            )}
          </div>
        )}
      </div>
      
        {/* Feedback Table - Attached */}
      <FeedbackTable
        feedback={filteredFeedback}
        loading={loading}
        onRowClick={handleFeedbackClick}
      />
      </div>
      
      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        feedback={selectedFeedback}
        allFeedback={feedback}
        onNavigateFeedback={handleNavigateFeedback}
      />
    </div>
  );
};

export default Dashboard;

