/**
 * FeedbackDetailModal Component
 * 
 * Professional modal displaying detailed feedback record information
 * Shows other feedback for the same employee with smooth navigation
 * 
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../common/Modal';
import { formatFeedbackDate, timestampToDate } from '../../../utils/dateFormatter';
import { SCORE_CONFIG } from '../../../config/constants';
import './FeedbackDetailModal.module.css';


const FeedbackDetailModal = ({ isOpen, onClose, feedback, allFeedback = [], onNavigateFeedback }) => {
  const [isOtherFeedbackExpanded, setIsOtherFeedbackExpanded] = useState(false);

  /**
   * Get all other feedback for the same employee (excluding current one)
   */
  const otherEmployeeFeedback = useMemo(() => {
    if (!feedback || !feedback.employeeName || !allFeedback || allFeedback.length === 0) {
      return [];
    }

    return allFeedback
      .filter(item => 
        item.id !== feedback.id && 
        item.employeeName === feedback.employeeName
      )
      .sort((a, b) => {
        const dateA = timestampToDate(a.date);
        const dateB = timestampToDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
  }, [feedback, allFeedback]);

  /**
   * Reset expanded state when feedback changes
   */
  React.useEffect(() => {
    setIsOtherFeedbackExpanded(false);
  }, [feedback?.id]);

  if (!feedback) return null;

  const score = feedback.score || 0;
  const dateObj = timestampToDate(feedback.date);

  /**
   * Handles clicking on another feedback record
   * 
   * @param {Object} otherFeedback - The feedback record to navigate to
   */
  const handleOtherFeedbackClick = (otherFeedback) => {
    if (onNavigateFeedback) {
      onNavigateFeedback(otherFeedback);
    }
  };

  /**
   * Renders score badge with color
   */
  const renderScoreBadge = (feedbackScore = score) => {
    const scoreColor = SCORE_CONFIG.COLORS[feedbackScore] || '#6B7280';
    
    return (
      <div
        className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md font-medium text-white text-xs sm:text-sm"
        style={{ backgroundColor: scoreColor }}
      >
        <span>
          {feedbackScore} {feedbackScore === 1 ? 'Star' : 'Stars'}
        </span>
      </div>
    );
  };

  /**
   * Get avatar initial color based on employee name
   */
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feedback Details"
      size="md"
    >
      <div className="space-y-3 sm:space-y-6">
        {/* Employee Name Section */}
        <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-4 border-b border-gray-200">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getAvatarColor(feedback.employeeName)} flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0`}>
            {(feedback.employeeName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {feedback.employeeName || 'Unknown Employee'}
            </h3>
            <p className="text-xs text-gray-500 hidden sm:block">Employee Feedback</p>
          </div>
        </div>

        {/* Date and Score Section - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* Date Section */}
          <div className="bg-blue-50/30 rounded-lg p-2.5 sm:p-4 border border-blue-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
              Date
            </label>
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs sm:text-base font-medium break-words">
                {dateObj ? formatFeedbackDate(feedback.date) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Score Section */}
          <div className="bg-purple-50/30 rounded-lg p-2.5 sm:p-4 border border-purple-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
              Score
            </label>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {renderScoreBadge()}
              {score && SCORE_CONFIG?.LABELS?.[score] && (
                <span className="text-xs text-gray-600 font-medium">
                  ({SCORE_CONFIG.LABELS[score]})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
            Notes
          </label>
          <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4 border border-gray-200">
            <p className="text-xs sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
              {feedback.notes || 'No notes provided for this feedback.'}
            </p>
          </div>
        </div>

        {/* Other Feedback Section */}
        {otherEmployeeFeedback.length > 0 && (
          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            {!isOtherFeedbackExpanded ? (
              /* Collapsed State - Show Count */
              <button
                type="button"
                onClick={() => setIsOtherFeedbackExpanded(true)}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98] group touch-manipulation"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {otherEmployeeFeedback.length} {otherEmployeeFeedback.length === 1 ? 'more other feedback' : 'more other feedbacks'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Tap to view all feedback</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ) : (
              /* Expanded State - Show All Records */
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide truncate pr-2">
                    Other Feedback
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOtherFeedbackExpanded(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors touch-manipulation flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="hidden sm:inline">Collapse</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {otherEmployeeFeedback.map((otherFeedback) => {
                    const otherDateObj = timestampToDate(otherFeedback.date);
                    return (
                      <button
                        key={otherFeedback.id}
                        type="button"
                        onClick={() => handleOtherFeedbackClick(otherFeedback)}
                        className="w-full text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md active:scale-[0.98] group touch-manipulation"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-gray-500 font-medium">
                                {otherDateObj ? formatFeedbackDate(otherFeedback.date) : 'N/A'}
                              </span>
                            </div>
                            {otherFeedback.notes && (
                              <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 mb-2 break-words">
                                {otherFeedback.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {renderScoreBadge(otherFeedback.score)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 group-hover:text-gray-600 transition-colors">
                          <span>View details</span>
                          <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 sm:pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg touch-manipulation text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Prop types for type checking
FeedbackDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feedback: PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.any,
    employeeName: PropTypes.string,
    score: PropTypes.number,
    notes: PropTypes.string,
  }),
  allFeedback: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.any,
      employeeName: PropTypes.string,
      score: PropTypes.number,
      notes: PropTypes.string,
    })
  ),
  onNavigateFeedback: PropTypes.func,
};

export default FeedbackDetailModal;
