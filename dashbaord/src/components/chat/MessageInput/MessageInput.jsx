/**
 * MessageInput Component
 * 
 * Input field for composing and sending messages
 * Modern design with auto-resize and smooth interactions
 * 
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MessageInput.module.css';

/**
 * Message input component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Send message callback
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.loading - Whether message is being sent
 * @param {string} props.placeholder - Placeholder text
 * @returns {JSX.Element} MessageInput component
 */
const MessageInput = ({
  onSendMessage,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const maxHeight = 120;
  const minHeight = 44;
  
  /**
   * Auto-resize textarea
   */
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${Math.max(newHeight, minHeight)}px`;
    }
  };
  
  /**
   * Handles message send
   */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || loading || disabled) return;
    
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = `${minHeight}px`;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  /**
   * Handles textarea change
   */
  const handleChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };
  
  /**
   * Handles key press (Enter to send, Shift+Enter for new line)
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Adjust height on mount
  useEffect(() => {
    adjustTextareaHeight();
  }, []);
  
  const canSend = message.trim().length > 0 && !loading && !disabled;
  
  return (
    <div className={`
      border-t border-gray-200 bg-white px-4 md:px-6 py-4 message-input-container
      ${isFocused ? 'border-gray-300' : ''}
      transition-colors duration-200
    `}>
      <div className="flex items-start gap-3">
        {/* Textarea Container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className={`
              w-full px-4 py-3 border rounded-2xl resize-none
              focus:outline-none transition-all duration-200 text-sm
              message-textarea
              ${isFocused
                ? 'border-gray-400 bg-white shadow-sm'
                : 'border-gray-300 bg-gray-50 hover:bg-white'
              }
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
            `}
            style={{ 
              minHeight: `${minHeight}px`,
              maxHeight: `${maxHeight}px`,
              lineHeight: '1.5',
              overflowY: 'auto',
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE/Edge */
            }}
            aria-label="Message input"
          />
          {/* Character count - optional for future */}
        </div>
        
        {/* Send Button - Enhanced */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`
            flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center
            transition-all duration-200 transform active:scale-95 mt-0.5
            send-button
            ${canSend
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-2 px-1">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
};

// Prop types for type checking
MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default MessageInput;
