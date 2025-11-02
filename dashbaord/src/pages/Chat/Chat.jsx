/**
 * Chat Page
 * 
 * Chat interface for HR to communicate with employees
 * Displays employee list and chat window side-by-side
 * Responsive: conversations list is toggleable on mobile
 * 
 * @component
 */

import React from 'react';
import useChat from '../../hooks/useChat'; // Real Firebase hook
import { ConversationsListProvider, useConversationsList } from '../../contexts/ConversationsListContext';
import EmployeeList from '../../components/chat/EmployeeList';
import ChatWindow from '../../components/chat/ChatWindow';
import './Chat.module.css';

/**
 * Chat page component
 * 
 * @returns {JSX.Element} Chat page
 */
const Chat = () => {
  // Get chat functionality - read-only from Firebase
  const {
    selectedEmployee,
    employeeList,
    messages,
    currentConversation,
    loading: chatLoading,
    isLoadingMessages,
    sendingMessage,
    sendHRMessage,
    selectEmployee,
    error,
  } = useChat({ realtime: true });
  
  /**
   * Available employees - only from existing conversations in Firebase
   * No connection to feedback data
   */
  const availableEmployees = React.useMemo(() => {
    // Only show employees who already have conversations in Firebase
    return employeeList;
  }, [employeeList]);
  
  /**
   * Handles employee selection
   * 
   * @param {Object} employee - Employee object with id and name
   */
  const handleSelectEmployee = async (employee) => {
    // Prevent selection during loading or if employee is invalid
    if (chatLoading || !employee || !employee.name) {
      console.warn('Cannot select employee during loading or invalid employee');
      return;
    }
    
    try {
      // Pass the entire employee object so we can use the correct conversation ID
      await selectEmployee(employee);
    } catch (error) {
      console.error('Error selecting employee:', error);
      // Error is already handled by the hook
    }
  };
  
  /**
   * Handles message send
   * 
   * @param {string} messageText - Message text
   */
  const handleSendMessage = async (messageText) => {
    try {
      await sendHRMessage(messageText);
    } catch (err) {
      console.error('Error sending message:', err);
      // Error handling is managed by the hook
    }
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
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Chat</h3>
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
    <ConversationsListProvider>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time messaging with employees
          </p>
        </div>
      </div>
      
      {/* Chat Interface */}
        <ChatInterface
          availableEmployees={availableEmployees}
          selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              messages={messages}
              onSendMessage={handleSendMessage}
          loading={chatLoading}
          isLoadingMessages={isLoadingMessages}
              sendingMessage={sendingMessage}
              currentConversation={currentConversation}
            />
      </div>
    </ConversationsListProvider>
  );
};

/**
 * Chat Interface Component
 * Handles responsive layout with toggleable conversations list
 */
const ChatInterface = ({
  availableEmployees,
  selectedEmployee,
  onSelectEmployee,
  messages,
  onSendMessage,
  loading,
  isLoadingMessages,
  sendingMessage,
  currentConversation,
}) => {
  const { isOpen, close, open } = useConversationsList();
  
  /**
   * Handle employee selection - close conversations list on mobile
   */
  const handleSelectEmployee = async (employee) => {
    await onSelectEmployee(employee);
    // Close conversations list on mobile after selection
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => close(), 150);
    }
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden relative chat-interface-container" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
      <div className="flex h-full relative">
        {/* Employee List Sidebar - Desktop visible, Mobile overlay within chat container */}
        <div
          className={`
            absolute md:relative inset-y-0 left-0 z-40 md:z-auto transform transition-transform duration-300 ease-in-out
            border-r border-gray-200 overflow-hidden bg-white shadow-lg md:shadow-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
          style={{ width: '320px' }}
          aria-hidden={typeof window !== 'undefined' && window.innerWidth < 768 ? !isOpen : false}
        >
          <EmployeeList
            employees={availableEmployees}
            selectedEmployeeId={selectedEmployee && typeof selectedEmployee === 'object' && selectedEmployee.id
              ? selectedEmployee.id
              : selectedEmployee && typeof selectedEmployee === 'string'
              ? `emp_${selectedEmployee.toLowerCase().replace(/\s+/g, '_')}`
              : null}
            onSelectEmployee={handleSelectEmployee}
            loading={loading}
          />
        </div>
        
        {/* Mobile Backdrop - Only covers chat area */}
        <div
          className={`
            md:hidden absolute inset-0 bg-gray-900 z-30 transition-opacity duration-300
            ${isOpen ? 'opacity-50 visible' : 'opacity-0 invisible'}
          `}
          onClick={handleBackdropClick}
          aria-hidden={!isOpen}
        />
        
        {/* Chat Window */}
        <div className="flex-1 overflow-hidden w-full md:w-auto">
          <ChatWindow
            messages={messages}
            employeeName={selectedEmployee}
            onSendMessage={onSendMessage}
            loading={isLoadingMessages}
            sendingMessage={sendingMessage}
            onToggleConversationsList={open}
            currentConversation={currentConversation}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
