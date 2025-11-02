/**
 * FeedbackTable Component
 * 
 * Displays feedback data in a sortable, paginated table
 * Shows date, employee name, score, and notes snippet
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatFeedbackDate, timestampToDate } from '../../../utils/dateFormatter';
import { sortByField } from '../../../utils/helpers';
import { SCORE_CONFIG } from '../../../config/constants';
import Loading from '../../common/Loading';
import './FeedbackTable.module.css';

/**
 * Feedback table component with sorting and pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.feedback - Array of feedback objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRowClick - Row click handler
 * @returns {JSX.Element} FeedbackTable component
 */
const FeedbackTable = ({ feedback = [], loading = false, onRowClick }) => {
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  /**
   * Sorts the feedback data based on current sort field and order
   */
  const sortedFeedback = useMemo(() => {
    if (!feedback || feedback.length === 0) return [];
    
    return sortByField(feedback, sortField, sortOrder);
  }, [feedback, sortField, sortOrder]);
  
  /**
   * Handles column header click to change sorting
   * 
   * @param {string} field - Field to sort by
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  /**
   * Handles row click
   * 
   * @param {Object} feedbackItem - Feedback item clicked
   */
  const handleRowClick = (feedbackItem) => {
    if (onRowClick) {
      onRowClick(feedbackItem);
    }
  };
  
  /**
   * Renders sort icon for column headers
   * 
   * @param {string} field - Field name
   * @returns {JSX.Element} Sort icon
   */
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  /**
   * Renders score as text (e.g., "5 stars")
   * 
   * @param {number} score - Score value
   * @returns {JSX.Element} Score text
   */
  const renderScore = (score) => {
    const starText = score === 1 ? 'star' : 'stars';
    
    return (
      <div className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md w-20 min-w-[80px]">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {score} {starText}
        </span>
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" message="Loading feedback data..." />
        </div>
      </div>
    );
  }
  
  // No data state
  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            There is no feedback data available. Try adjusting your search or filters.
          </p>
        </div>
      </div>
    );
  }
  
  // Calculate max height to show approximately 6 rows (6 rows * ~80px per row)
  const rowHeight = 80; // Approximate height per row including spacing
  const maxVisibleRows = 6;
  const maxTableHeight = rowHeight * maxVisibleRows;

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <div className="overflow-y-auto" style={{ maxHeight: `${maxTableHeight}px` }}>
          <table className="min-w-full divide-y divide-gray-100">
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Date Column */}
              <th
                scope="col"
                className="px-3 sm:px-5 py-2.5 text-left cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all duration-200 group"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-900">Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              
              {/* Employee Name Column */}
              <th
                scope="col"
                className="px-3 sm:px-5 py-2.5 text-left cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all duration-200 group"
                onClick={() => handleSort('employeeName')}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-900">
                    <span className="hidden sm:inline">Employee</span>
                    <span className="sm:hidden">Name</span>
                  </span>
                  {renderSortIcon('employeeName')}
                </div>
              </th>
              
              {/* Score Column */}
              <th
                scope="col"
                className="px-3 sm:px-5 py-2.5 text-left cursor-pointer bg-amber-50 hover:bg-amber-100 transition-all duration-200 group w-28"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-900">Score</span>
                  {renderSortIcon('score')}
                </div>
              </th>
              
              {/* Notes Column */}
              <th
                scope="col"
                className="hidden md:table-cell px-3 sm:px-5 py-2.5 text-left group bg-green-50 hover:bg-green-100 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-900">Notes</span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFeedback.map((item, index) => (
              <React.Fragment key={item.id || index}>
                {/* Main Row */}
                <tr
                  className={`
                    transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer hover:bg-gray-50/50' : ''}
                  `}
                  onClick={() => handleRowClick(item)}
                >
                  {/* Date */}
                  <td className="px-3 sm:px-5 py-2 whitespace-nowrap text-sm text-gray-600">
                    {item.date ? (
                      <>
                        <span className="hidden sm:inline">
                          {formatFeedbackDate(item.date)}
                        </span>
                        <span className="sm:hidden">
                          {(() => {
                            const dateObj = timestampToDate(item.date);
                            return dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
                          })()}
                        </span>
                      </>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  
                  {/* Employee Name */}
                  <td className="px-3 sm:px-5 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {item.employeeName || 'Unknown'}
                    </span>
                  </td>
                  
                  {/* Score */}
                  <td className="px-3 sm:px-5 py-2 whitespace-nowrap w-28">
                    {renderScore(item.score)}
                  </td>
                  
                  {/* Notes - Desktop only */}
                  <td className="hidden md:table-cell px-3 sm:px-5 py-2 text-sm text-gray-600 max-w-md">
                    <p className="leading-relaxed line-clamp-2">
                      {item.notes || 'No notes provided'}
                    </p>
                  </td>
                </tr>
                
                {/* Notes Row - Mobile only */}
                {item.notes && (
                  <tr className="md:hidden bg-gray-50/30">
                    <td colSpan="3" className="px-3 sm:px-5 py-1.5 text-sm text-gray-600 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 text-xs uppercase tracking-wide mt-0.5 flex-shrink-0">Notes:</span>
                        <p className="flex-1 line-clamp-1 break-words">{item.notes}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
        
        {/* Scroll Indicator */}
        {sortedFeedback.length > maxVisibleRows && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {sortedFeedback.length} total records
              <span className="block mt-1 text-gray-400">Scroll to see more</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Prop types for type checking
FeedbackTable.propTypes = {
  feedback: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.any,
      employeeName: PropTypes.string,
      score: PropTypes.number,
      notes: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default FeedbackTable;

