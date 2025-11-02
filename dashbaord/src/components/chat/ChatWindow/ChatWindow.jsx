/**
 * ChatWindow Component
 * 
 * Main chat interface displaying messages and input
 * Auto-scrolls to bottom on new messages
 * Modern design with smooth animations
 * 
 * @component
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MessageBubble from '../MessageBubble';
import MessageInput from '../MessageInput';
import Loading from '../../common/Loading';
import { getChatDateLabel } from '../../../utils/dateFormatter';
import './ChatWindow.module.css';

/**
 * Chat window component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.employeeName - Name of the employee being chatted with
 * @param {Function} props.onSendMessage - Send message callback
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.sendingMessage - Message sending state
 * @param {Function} props.onToggleConversationsList - Toggle conversations list (mobile)
 * @returns {JSX.Element} ChatWindow component
 */
const ChatWindow = ({
  messages = [],
  employeeName,
  onSendMessage,
  loading = false,
  sendingMessage = false,
  onToggleConversationsList,
  currentConversation,
}) => {
  // Handle both string and object for employeeName
  const displayName = employeeName && typeof employeeName === 'object' && employeeName.name
    ? employeeName.name
    : employeeName || '';
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  
  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = (force = false) => {
    if (force || isScrolledToBottom) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  /**
   * Checks if user is scrolled to bottom
   */
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledToBottom(isAtBottom);
  };
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Monitor scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);
  
  /**
   * Groups messages by date
   */
  const groupMessagesByDate = (messagesList) => {
    const groups = {};
    
    messagesList.forEach((message) => {
      const dateLabel = getChatDateLabel(message.timestamp);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  // No employee selected
  if (!displayName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 text-center px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white rounded-full p-6 shadow-lg">
        <svg
              className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
                strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Conversation
        </h2>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          Choose an employee from the list to start or continue a conversation.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-white chat-window">
      {/* Chat Header - Enhanced Design */}
      <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Toggle Conversations List Button (Mobile Only) */}
          {onToggleConversationsList && (
            <button
              type="button"
              onClick={onToggleConversationsList}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 -ml-2 active:scale-95"
              aria-label="Open conversations list"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Avatar - Enhanced */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-lg ring-2 ring-white" style={{ backgroundColor: '#010028' }}>
              {displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {displayName || 'Select a Conversation'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hidden md:block"
              aria-label="More options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area - Enhanced */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 bg-gradient-to-b from-gray-50 to-white messages-container"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-full p-5 shadow-xl">
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Messages Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Start the conversation by sending a message to <span className="font-medium text-gray-700">{displayName}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(messageGroups).map(([dateLabel, dateMessages], groupIndex) => (
              <div key={dateLabel} className="message-group">
                {/* Date Separator - Enhanced */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white rounded-full px-4 py-2 shadow-md border border-gray-200 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {dateLabel}
                    </p>
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
                    const isConsecutive = prevMessage && prevMessage.senderId === message.senderId;
                    const showSpacing = nextMessage && nextMessage.senderId !== message.senderId;
                    
                    return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                        isConsecutive={isConsecutive}
                        showSpacing={showSpacing}
                        participantNames={currentConversation?.participantNames}
                        employeeName={displayName}
                  />
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
        
        {/* Scroll to bottom button */}
        {!isScrolledToBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-24 right-6 md:right-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-20"
            aria-label="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={!displayName}
        loading={sendingMessage}
        placeholder={`Message ${displayName}...`}
      />
    </div>
  );
};

// Prop types for type checking
ChatWindow.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      senderId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.any.isRequired,
    })
  ),
  employeeName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onSendMessage: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  sendingMessage: PropTypes.bool,
  onToggleConversationsList: PropTypes.func,
  currentConversation: PropTypes.object,
};

export default ChatWindow;
