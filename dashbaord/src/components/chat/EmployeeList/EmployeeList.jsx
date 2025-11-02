/**
 * EmployeeList Component
 * 
 * Displays a list of employees to chat with
 * Modern design with enhanced visual hierarchy and interactions
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useConversationsList } from '../../../contexts/ConversationsListContext';
import { formatChatDate } from '../../../utils/dateFormatter';
import { truncateString, getInitials } from '../../../utils/helpers';
import Loading from '../../common/Loading';
import './EmployeeList.module.css';

/**
 * Get avatar gradient color based on name
 */
const getAvatarColor = (name) => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-green-500',
    'from-yellow-500 to-orange-500',
    'from-violet-500 to-purple-500',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Employee list component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.employees - Array of employee objects
 * @param {string} props.selectedEmployeeId - Currently selected employee ID
 * @param {Function} props.onSelectEmployee - Employee selection callback
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} EmployeeList component
 */
const EmployeeList = ({
  employees = [],
  selectedEmployeeId,
  onSelectEmployee,
  loading = false,
}) => {
  // Get context - this component is always used within ConversationsListProvider in Chat page
  const { close } = useConversationsList();
  
  /**
   * Handles employee selection
   * 
   * @param {Object} employee - Employee object
   */
  const handleSelect = (employee) => {
    // Prevent selection during loading
    if (loading || !employee || !employee.name) {
      return;
    }
    
    if (onSelectEmployee) {
      onSelectEmployee(employee);
    }
  };
  
  /**
   * Handles close button click (mobile only)
   */
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      close();
    }
  };
  
  // Initial loading state only - don't show when clicking conversations
  if (loading && (!employees || employees.length === 0)) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-64 pointer-events-none select-none"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Loading size="sm" message="" />
      </div>
    );
  }
  
  // No employees state
  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
          <div className="relative bg-white rounded-full p-5 shadow-lg">
            <svg
              className="w-14 h-14 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">No Conversations</h3>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
          No active conversations yet. Conversations will appear here once you start chatting with employees.
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto h-full bg-white employee-list">
      {/* Employee List Header - Enhanced */}
      <div className="px-4 py-[19px] border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Conversations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{employees.length} active</p>
        </div>
        {/* Close Button (Mobile Only) */}
        <button
          type="button"
          onClick={handleClose}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Close conversations list"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Employee Items */}
      <div className="py-2">
        {employees.map((employee, index) => {
          const isSelected = employee.id === selectedEmployeeId;
          const avatarColor = getAvatarColor(employee.name);
          
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => handleSelect(employee)}
              className={`
                w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left
                employee-item
                ${isSelected
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-900'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
              aria-current={isSelected ? 'true' : 'false'}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              {/* Avatar - Enhanced with gradient */}
              <div className="flex-shrink-0 relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm
                  bg-gradient-to-br ${avatarColor}
                  shadow-lg ring-2 ${isSelected ? 'ring-gray-900' : 'ring-white'}
                  transition-all duration-200
                  ${isSelected ? 'scale-110' : 'scale-100'}
                `}>
                  {getInitials(employee.name)}
                </div>
                {/* Unread badge - placeholder for future feature */}
                {/* {employee.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {employee.unreadCount > 9 ? '9+' : employee.unreadCount}
                  </div>
                )} */}
              </div>
              
              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Time Row */}
                <div className="flex items-baseline justify-between mb-1">
                  <p className={`
                    text-sm font-semibold truncate transition-colors duration-200
                    ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                  `}>
                    {employee.name}
                  </p>
                  {employee.lastMessageTimestamp && (
                    <p className={`
                      text-xs ml-2 flex-shrink-0 transition-colors duration-200
                      ${isSelected ? 'text-gray-500' : 'text-gray-400'}
                    `}>
                      {formatChatDate(employee.lastMessageTimestamp)}
                    </p>
                  )}
                </div>
                
                {/* Last Message */}
                <div className="flex items-center gap-2">
                  {employee.lastMessage && (() => {
                    /**
                     * Gets the sender prefix for the last message
                     * 
                     * For dashboard:
                     * - If senderId = first participant (HR name) → show "You:"
                     * - If senderId = second participant (employee name) → show employee name
                     * 
                     * @returns {string} Prefix to show before message (e.g., "You:" or "Alice Johnson:")
                     */
                    const getLastMessagePrefix = () => {
                      if (!employee.lastMessageSenderId || !employee.participantNames || employee.participantNames.length === 0) {
                        return '';
                      }
                      
                      let namesArray = [];
                      
                      // Parse participantNames to get the array
                      if (Array.isArray(employee.participantNames)) {
                        // Check if first element is a string representation of an array
                        if (employee.participantNames.length > 0 && typeof employee.participantNames[0] === 'string' && employee.participantNames[0].startsWith('[')) {
                          try {
                            const parsed = JSON.parse(employee.participantNames[0]);
                            if (Array.isArray(parsed)) {
                              namesArray = parsed;
                            } else {
                              namesArray = employee.participantNames;
                            }
                          } catch {
                            namesArray = employee.participantNames;
                          }
                        } else {
                          namesArray = employee.participantNames;
                        }
                      } else if (typeof employee.participantNames === 'string' && employee.participantNames.startsWith('[')) {
                        try {
                          const parsed = JSON.parse(employee.participantNames);
                          if (Array.isArray(parsed)) {
                            namesArray = parsed;
                          }
                        } catch {
                          // Ignore
                        }
                      }
                      
                      if (namesArray.length >= 2) {
                        const hrName = namesArray[0]; // First participant (HR name)
                        const employeeName = namesArray[1]; // Second participant (employee name)
                        
                        // If senderId equals HR name (first participant), show "You:"
                        if (employee.lastMessageSenderId === hrName) {
                          return 'You: ';
                        }
                        
                        // If senderId equals employee name (second participant), show employee name
                        if (employee.lastMessageSenderId === employeeName) {
                          return `${truncateString(employeeName, 15)}: `;
                        }
                      }
                      
                      return '';
                    };
                    
                    const prefix = getLastMessagePrefix();
                    const displayMessage = prefix + employee.lastMessage;
                    
                    return (
                      <p className={`
                        text-xs truncate transition-colors duration-200
                        ${isSelected ? 'text-gray-600 font-medium' : 'text-gray-500'}
                      `}>
                        {truncateString(displayMessage, 40)}
                      </p>
                    );
                  })()}
                </div>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Prop types for type checking
EmployeeList.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      lastMessage: PropTypes.string,
      lastMessageTimestamp: PropTypes.any,
      lastMessageSenderId: PropTypes.string,
      participantNames: PropTypes.array,
      unreadCount: PropTypes.number,
    })
  ),
  selectedEmployeeId: PropTypes.string,
  onSelectEmployee: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default EmployeeList;
