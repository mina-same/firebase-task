/**
 * useMockChat Hook
 * 
 * Mock version of useChat hook for development without Firebase
 * Provides fake chat data and simulates Firebase behavior
 * 
 * @module hooks/useMockChat
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockConversations, mockMessages, delay } from '../data/mockData';
import { LOADING_STATES, HR_USER } from '../config/constants';
import { generateEmployeeId } from '../utils/helpers';

/**
 * Custom hook for mock chat management
 * 
 * @param {Object} options - Hook options
 * @param {string} options.employeeName - Employee to chat with
 * @param {boolean} options.realtime - Enable simulated real-time updates (default: true)
 * @returns {Object} Chat state and methods
 */
const useMockChat = (options = {}) => {
  const { employeeName: initialEmployee, realtime = true } = options;
  
  // State management
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee || null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(LOADING_STATES.IDLE);
  const [messagesLoading, setMessagesLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  /**
   * Current employee ID based on selected employee
   */
  const currentEmployeeId = useMemo(() => {
    return selectedEmployee ? generateEmployeeId(selectedEmployee) : null;
  }, [selectedEmployee]);
  
  /**
   * Selects an employee to chat with
   */
  const selectEmployee = useCallback(async (employeeName) => {
    try {
      setSelectedEmployee(employeeName);
      setMessagesLoading(LOADING_STATES.LOADING);
      setError(null);
      
      // Simulate loading delay
      await delay(500);
      
      const employeeId = generateEmployeeId(employeeName);
      const employeeMessages = mockMessages[employeeId] || [];
      setMessages(employeeMessages);
      setMessagesLoading(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('Error selecting employee:', err);
      setError(err.message || 'Failed to select employee');
      setMessagesLoading(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Sends a message from HR to the selected employee
   */
  const sendHRMessage = useCallback(async (messageText) => {
    if (!selectedEmployee) {
      throw new Error('No employee selected');
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Simulate sending delay
      await delay(500);
      
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: HR_USER.ID,
        text: messageText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentEmployeeId
            ? {
                ...conv,
                lastMessage: messageText,
                lastMessageTimestamp: new Date(),
              }
            : conv
        )
      );
      
      setSendingMessage(false);
      return newMessage.id;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [selectedEmployee, currentEmployeeId]);
  
  /**
   * Sends a generic message
   */
  const sendChatMessage = useCallback(async (senderId, messageText) => {
    return sendHRMessage(messageText);
  }, [sendHRMessage]);
  
  /**
   * Clears the selected employee and messages
   */
  const clearSelection = useCallback(() => {
    setSelectedEmployee(null);
    setMessages([]);
    setError(null);
  }, []);
  
  /**
   * Determines if a message was sent by HR
   */
  const isHRMessage = useCallback((message) => {
    return message.senderId === HR_USER.ID;
  }, []);
  
  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setConversationsLoading(LOADING_STATES.LOADING);
      await delay(600);
      setConversations(mockConversations);
      setConversationsLoading(LOADING_STATES.SUCCESS);
    };
    
    loadConversations();
  }, []);
  
  // Load messages when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      selectEmployee(selectedEmployee);
    }
  }, [selectedEmployee, selectEmployee]);
  
  // Computed values
  const isLoadingConversations = conversationsLoading === LOADING_STATES.LOADING;
  const isLoadingMessages = messagesLoading === LOADING_STATES.LOADING;
  const isLoading = isLoadingConversations || isLoadingMessages;
  
  const employeeList = useMemo(() => {
    return conversations.map((conv) => {
      const employeeName = conv.participantNames.find((name) => name !== HR_USER.NAME);
      return {
        id: conv.id,
        name: employeeName,
        lastMessage: conv.lastMessage,
        lastMessageTimestamp: conv.lastMessageTimestamp,
      };
    });
  }, [conversations]);
  
  const unreadCount = 0;
  
  const currentConversation = useMemo(() => {
    if (!currentEmployeeId) return null;
    return conversations.find((conv) => conv.id === currentEmployeeId);
  }, [currentEmployeeId, conversations]);
  
  return {
    // Selected employee data
    selectedEmployee,
    currentEmployeeId,
    currentConversation,
    
    // Lists
    conversations,
    employeeList,
    messages,
    
    // Loading states
    loading: isLoading,
    isLoadingConversations,
    isLoadingMessages,
    sendingMessage,
    error,
    
    // Computed values
    unreadCount,
    
    // Methods
    selectEmployee,
    sendHRMessage,
    sendChatMessage,
    clearSelection,
    isHRMessage,
  };
};

export default useMockChat;

