/**
 * MessageBubble Component
 * 
 * Displays a single message in the chat
 * Modern design with smooth animations and better visual hierarchy
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { formatChatTime } from '../../../utils/dateFormatter';
import { HR_USER } from '../../../config/constants';
import './MessageBubble.module.css';

/**
 * Extracts the first element (HR name) from participantNames
 * Handles both array and string array formats
 * 
 * @param {Array|string} participantNames - Participant names from conversation
 * @returns {string|null} First element (HR name) or null if not found
 */
const getHRNameFromParticipantNames = (participantNames) => {
  if (!participantNames) return null;
  
  let namesArray = [];
  
  // Handle case where participantNames might be stored as a string array
  if (Array.isArray(participantNames)) {
    // Check if first element is a string representation of an array
    if (participantNames.length === 1 && typeof participantNames[0] === 'string' && participantNames[0].startsWith('[')) {
      // Parse the string array (e.g., '["Sarah Connor (HR)", "Alice Johnson"]')
      try {
        const parsed = JSON.parse(participantNames[0]);
        if (Array.isArray(parsed)) {
          namesArray = parsed;
        } else {
          namesArray = participantNames;
        }
      } catch {
        // If parsing fails, use original array
        namesArray = participantNames;
      }
    } else {
      // Normal array format
      namesArray = participantNames;
    }
  } else if (typeof participantNames === 'string' && participantNames.startsWith('[')) {
    // Handle case where participantNames is a string directly
    try {
      namesArray = JSON.parse(participantNames);
    } catch {
      // If parsing fails, create array from string
      namesArray = [participantNames];
    }
  }
  
  // Get the first element (HR name)
  if (namesArray.length > 0 && typeof namesArray[0] === 'string') {
    return namesArray[0].trim();
  }
  
  return null;
};

/**
 * Message bubble component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object
 * @param {boolean} props.isHR - Whether the message is from HR
 * @param {boolean} props.isConsecutive - Whether this message is consecutive from same sender
 * @param {boolean} props.showSpacing - Whether to show extra spacing below
 * @param {Array|string} props.participantNames - Participant names from conversation
 * @param {string} props.employeeName - Employee name (conversation name) for avatar initial
 * @returns {JSX.Element} MessageBubble component
 */
const MessageBubble = ({ message, isHR, isConsecutive = false, showSpacing = false, participantNames, employeeName }) => {
  // Get HR name from participantNames (first element)
  const hrName = participantNames ? getHRNameFromParticipantNames(participantNames) : null;
  
  // Check if message is from HR: senderId matches HR name from participantNames OR includes "(HR)"
  const isFromHR = isHR || 
    (hrName && message.senderId === hrName) || 
    (message.senderId && message.senderId.includes('(HR)')) ||
    message.senderId === HR_USER.ID;
  
  return (
    <div
      className={`
        flex items-end gap-2 mb-1 transition-all duration-200 message-bubble
        ${isFromHR ? 'justify-end' : 'justify-start'}
        ${isConsecutive ? 'mt-1' : 'mt-3'}
        ${showSpacing ? 'mb-4' : ''}
      `}
    >
      {/* Avatar - Only show for received messages and first in sequence */}
      {!isFromHR && !isConsecutive && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-white" style={{ backgroundColor: '#010028' }}>
          {employeeName?.charAt(0)?.toUpperCase() || message.senderName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
      
      {/* Spacer for consecutive messages */}
      {!isFromHR && isConsecutive && <div className="w-8"></div>}
      
      {/* Message Content */}
      <div
        className={`
          max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2.5 relative
          transition-all duration-200 transform hover:scale-[1.01]
          message-content
          ${isFromHR
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg'
            : 'bg-white border border-gray-200 text-gray-900 shadow-md hover:shadow-lg'
          }
        `}
      >
        {/* Message Text */}
        <p className={`
          text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isFromHR ? 'text-white' : 'text-gray-800'}
        `}>
          {message.text}
        </p>
        
        {/* Timestamp and Status Row */}
        <div className={`
          flex items-center gap-1.5 mt-1.5
          ${isFromHR ? 'justify-end' : 'justify-start'}
        `}>
          <p className={`
            text-xs
            ${isFromHR ? 'text-gray-300' : 'text-gray-500'}
          `}>
          {formatChatTime(message.timestamp)}
        </p>
          {/* Read status indicator for sent messages - Modern double checkmark */}
          {isFromHR && (
            <div className="message-status-indicator sent flex items-center -ml-0.5">
              {/* First checkmark */}
              <svg 
                className="w-3.5 h-3.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ marginRight: '-3px' }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd"
                />
              </svg>
              {/* Second checkmark (slightly offset) */}
              <svg 
                className="w-3.5 h-3.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ marginLeft: '-4px' }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Spacer for sent messages */}
      {isFromHR && <div className="w-0 md:w-8"></div>}
    </div>
  );
};

// Prop types for type checking
MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    senderId: PropTypes.string.isRequired,
    senderName: PropTypes.string,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.any.isRequired,
  }).isRequired,
  isHR: PropTypes.bool,
  isConsecutive: PropTypes.bool,
  showSpacing: PropTypes.bool,
  participantNames: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]),
  employeeName: PropTypes.string,
};

export default MessageBubble;
