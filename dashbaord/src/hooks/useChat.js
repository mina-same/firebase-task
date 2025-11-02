/**
 * useChat Hook
 * 
 * Custom React hook for managing chat functionality
 * Provides real-time messaging and conversation management
 * 
 * @module hooks/useChat
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  sendMessage,
  sendMessageFromHR,
  subscribeConversations,
  subscribeMessages,
  getEmployeeNameFromId,
} from '../services/chatService';
import { LOADING_STATES, HR_USER } from '../config/constants';
import { generateEmployeeId } from '../utils/helpers';

/**
 * Custom hook for chat management
 * 
 * @param {Object} options - Hook options
 * @param {string} options.employeeName - Employee to chat with
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @returns {Object} Chat state and methods
 * 
 * @example
 * const {
 *   messages,
 *   conversations,
 *   loading,
 *   sendHRMessage,
 *   selectEmployee,
 * } = useChat({ employeeName: 'Jane Doe' });
 */
const useChat = (options = {}) => {
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
   * Uses the conversation ID directly if available, otherwise generates from name
   */
  const currentEmployeeId = useMemo(() => {
    if (!selectedEmployee) return null;
    
    // If selectedEmployee is an object with id, use that (conversation ID)
    if (typeof selectedEmployee === 'object' && selectedEmployee !== null && selectedEmployee.id) {
      return selectedEmployee.id;
    }
    
    // Otherwise, it's a string name, generate ID from it
    if (typeof selectedEmployee === 'string') {
      return generateEmployeeId(selectedEmployee);
    }
    
    return null;
  }, [selectedEmployee]);
  
  /**
   * Selects an employee to chat with
   * 
   * @param {string|Object} employee - Employee name (string) or employee object with id and name
   * Note: Does NOT create conversations - only works with existing conversations
   */
  const selectEmployee = useCallback(async (employee) => {
    // Handle both string (name) and object (employee object with id and name)
    let employeeName;
    let employeeId;
    
    if (typeof employee === 'string') {
      employeeName = employee.trim();
      if (!employeeName) {
        console.warn('Invalid employee name provided:', employee);
        return;
      }
      employeeId = generateEmployeeId(employeeName);
    } else if (employee && typeof employee === 'object' && employee.name) {
      employeeName = employee.name;
      employeeId = employee.id || generateEmployeeId(employee.name);
    } else {
      console.warn('Invalid employee provided:', employee);
      return;
    }
    
    // Don't allow selection if conversations are still loading
    if (conversationsLoading === LOADING_STATES.LOADING) {
      console.warn('Cannot select employee while conversations are loading');
      return;
    }
    
    try {
      // Don't reset if selecting the same employee
      let currentId = null;
      
      if (selectedEmployee) {
        if (typeof selectedEmployee === 'object' && selectedEmployee.id) {
          currentId = selectedEmployee.id;
        } else if (typeof selectedEmployee === 'string') {
          currentId = generateEmployeeId(selectedEmployee);
        }
      }
      
      if (currentId === employeeId) {
        return;
      }
      
      // Clear previous messages when switching
      setMessages([]);
      
      // Store the employee object if provided, otherwise just the name
      // Ensure we store a valid employee object with id and name
      const employeeToStore = typeof employee === 'object' && employee.name && employee.id
        ? employee
        : { id: employeeId, name: employeeName };
      
      setSelectedEmployee(employeeToStore);
      setError(null);
      
      // Don't show loading state when switching - messages will load silently
      // Messages will load silently in the background
      setMessagesLoading(LOADING_STATES.IDLE);
      
      // Only select if conversation already exists - do NOT create new ones
      // The real-time subscription will load messages automatically
    } catch (err) {
      console.error('Error selecting employee:', err);
      setError(err.message || 'Failed to select employee');
      setMessagesLoading(LOADING_STATES.ERROR);
    }
  }, [conversationsLoading, selectedEmployee]);
  
  /**
   * Sends a message from HR to the selected employee
   * Updates conversation's lastMessage and lastMessageTimestamp
   * 
   * @param {string} messageText - Text content of the message
   * @returns {Promise<string>} ID of the sent message
   */
  const sendHRMessage = useCallback(async (messageText) => {
    if (!selectedEmployee) {
      throw new Error('No employee selected');
    }
    
    if (!currentEmployeeId) {
      throw new Error('No conversation selected');
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Send message via chat service using the actual conversation ID
      const messageId = await sendMessageFromHR(
        currentEmployeeId, // Use the actual conversation ID, not the generated one
        messageText
      );
      
      // Message is sent and conversation is updated automatically via Firebase service
      // The real-time subscription will update the UI automatically
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [selectedEmployee, currentEmployeeId]);
  
  /**
   * Sends a generic message (can be from HR or employee)
   * Updates conversation's lastMessage and lastMessageTimestamp
   * 
   * @param {string} senderId - ID of the sender
   * @param {string} messageText - Text content of the message
   * @returns {Promise<string>} ID of the sent message
   */
  const sendChatMessage = useCallback(async (senderId, messageText) => {
    if (!currentEmployeeId) {
      throw new Error('No conversation selected');
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Send message via chat service
      const messageId = await sendMessage(currentEmployeeId, senderId, messageText);
      
      // Message is sent and conversation is updated automatically via Firebase service
      // The real-time subscription will update the UI automatically
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [currentEmployeeId]);
  
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
   * Checks if senderId matches HR name from participantNames or includes "(HR)"
   * 
   * @param {Object} message - Message object
   * @param {Array|string} participantNames - Participant names from conversation (optional)
   * @returns {boolean} True if sent by HR
   */
  const isHRMessage = useCallback((message, participantNames = null) => {
    // Check if senderId includes "(HR)" pattern
    if (message.senderId && message.senderId.includes('(HR)')) {
      return true;
    }
    
    // Check if senderId matches HR_USER.ID (fallback)
    if (message.senderId === HR_USER.ID) {
      return true;
    }
    
    // If participantNames provided, check if senderId matches first element
    if (participantNames) {
      let namesArray = [];
      
      // Handle case where participantNames might be stored as a string array
      if (Array.isArray(participantNames)) {
        if (participantNames.length === 1 && typeof participantNames[0] === 'string' && participantNames[0].startsWith('[')) {
          try {
            const parsed = JSON.parse(participantNames[0]);
            if (Array.isArray(parsed)) {
              namesArray = parsed;
            } else {
              namesArray = participantNames;
            }
          } catch {
            namesArray = participantNames;
          }
        } else {
          namesArray = participantNames;
        }
      } else if (typeof participantNames === 'string' && participantNames.startsWith('[')) {
        try {
          namesArray = JSON.parse(participantNames);
        } catch {
          namesArray = [participantNames];
        }
      }
      
      // Check if senderId matches first element (HR name)
      if (namesArray.length > 0 && typeof namesArray[0] === 'string' && message.senderId === namesArray[0].trim()) {
        return true;
      }
    }
    
    return false;
  }, []);
  
  // Set up real-time listener for conversations list
  useEffect(() => {
    if (!realtime) return;
    
    setConversationsLoading(LOADING_STATES.LOADING);
    
    try {
      const unsubscribe = subscribeConversations((data) => {
        setConversations(data || []);
        setConversationsLoading(LOADING_STATES.SUCCESS);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error subscribing to conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setConversationsLoading(LOADING_STATES.ERROR);
    }
  }, [realtime]);
  
  // Set up real-time listener for messages in selected conversation
  useEffect(() => {
    if (!realtime || !currentEmployeeId) {
      setMessages([]);
      setMessagesLoading(LOADING_STATES.IDLE);
      return;
    }
    
    // Don't show loading spinner when switching - messages load silently
    // Keep messages loading state as IDLE - subscription will update silently
    try {
      const unsubscribe = subscribeMessages(currentEmployeeId, (data) => {
        // Store raw messages from Firebase - sorting happens in useMemo
        // This ensures messages are always sorted before React renders them
        setMessages(data);
        setMessagesLoading(LOADING_STATES.SUCCESS);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error subscribing to messages:', err);
      setError(err.message || 'Failed to load messages');
      setMessagesLoading(LOADING_STATES.ERROR);
    }
  }, [realtime, currentEmployeeId]);
  
  /**
   * Helper function to check if a timestamp is valid (resolved)
   */
  const isValidTimestamp = useCallback((timestamp) => {
    if (!timestamp) return false;
    
    // Check if it's a Firestore Timestamp with valid seconds
    if (timestamp.seconds !== undefined) {
      return timestamp.seconds > 0; // Valid timestamp must have seconds > 0
    }
    
    // Check if it has toMillis method
    if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
      try {
        const ms = timestamp.toMillis();
        return ms > 0; // Valid timestamp must be > 0
      } catch {
        return false;
      }
    }
    
    // Check if it's a Date
    if (timestamp instanceof Date) {
      return !isNaN(timestamp.getTime());
    }
    
    // Check if it's a number
    if (typeof timestamp === 'number') {
      return timestamp > 0;
    }
    
    return false;
  }, []);
  
  /**
   * Helper function to extract timestamp in milliseconds
   */
  const getTimestampMs = useCallback((message) => {
    if (!message || !message.timestamp) return 0;
    
    const ts = message.timestamp;
    
    // Check if timestamp is valid before extracting
    if (!isValidTimestamp(ts)) return 0;
    
    if (ts.toMillis && typeof ts.toMillis === 'function') {
      return ts.toMillis();
    }
    if (ts.seconds !== undefined) {
      return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000;
    }
    if (ts instanceof Date) {
      return ts.getTime();
    }
    if (typeof ts === 'number') {
      return ts;
    }
    return 0;
  }, [isValidTimestamp]);
  
  /**
   * Sorted messages - always sorted by timestamp (oldest first)
   * This ensures messages are never displayed out of order
   * Only includes messages with valid, resolved timestamps
   * This prevents messages from appearing with "N/A" timestamp at the top
   */
  const sortedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    
    // Filter out messages without valid timestamps
    // This prevents messages with unresolved serverTimestamp() from appearing
    const validMessages = messages.filter((msg) => {
      return msg && msg.timestamp && isValidTimestamp(msg.timestamp);
    });
    
    if (validMessages.length === 0) return [];
    
    // Create a copy and sort by timestamp
    // Always sort, even if Firebase claims messages are already sorted
    const sorted = [...validMessages].sort((a, b) => {
      const timeA = getTimestampMs(a);
      const timeB = getTimestampMs(b);
      
      // If timestamps are equal, sort by document ID for stability
      // This prevents messages from jumping around when they have the same timestamp
      if (timeA === timeB) {
        return (a.id || '').localeCompare(b.id || '');
      }
      
      return timeA - timeB;
    });
    
    return sorted;
  }, [messages, getTimestampMs, isValidTimestamp]);
  
  // Computed values
  const isLoadingConversations = conversationsLoading === LOADING_STATES.LOADING;
  const isLoadingMessages = messagesLoading === LOADING_STATES.LOADING;
  const isLoading = isLoadingConversations || isLoadingMessages;
  
  /**
   * List of unique employee names from conversations
   */
  const employeeList = useMemo(() => {
    return conversations.map((conv) => {
      // Get employee name from participantNames (exclude HR)
      // Filter out HR_USER.NAME and get the first employee name
      let employeeName = '';
      
      if (conv.participantNames) {
        let namesArray = [];
        
        // Handle case where participantNames might be stored as a string array
        if (Array.isArray(conv.participantNames)) {
          // Check if first element is a string representation of an array
          if (conv.participantNames.length === 1 && typeof conv.participantNames[0] === 'string' && conv.participantNames[0].startsWith('[')) {
            // Parse the string array (e.g., '["Sarah Connor (HR)", "Alice Johnson"]')
            try {
              const parsed = JSON.parse(conv.participantNames[0]);
              if (Array.isArray(parsed)) {
                namesArray = parsed;
              } else {
                namesArray = conv.participantNames;
              }
            } catch {
              // If parsing fails, use original array
              namesArray = conv.participantNames;
            }
          } else {
            // Normal array format
            namesArray = conv.participantNames;
          }
        } else if (typeof conv.participantNames === 'string' && conv.participantNames.startsWith('[')) {
          // Handle case where participantNames is a string directly
          try {
            namesArray = JSON.parse(conv.participantNames);
          } catch {
            // If parsing fails, create array from string
            namesArray = [conv.participantNames];
          }
        }
        
        // Get the employee name - it's the second element in the array (after HR)
        // participantNames array: ["Sarah Connor (HR)", "Alice Johnson"]
        // We want: "Alice Johnson" (the second element)
        
        if (namesArray.length > 0) {
          // First, try to find the employee name by excluding HR
          const employeeNames = namesArray.filter((name) => {
            if (!name || typeof name !== 'string') return false;
            // Exclude HR user - check both by exact match and by checking if it contains "(HR)"
            return name !== HR_USER.NAME && !name.includes('(HR)');
          });
          
          // If we found employee names, use the first one
          if (employeeNames.length > 0) {
            employeeName = employeeNames[0].trim();
          } else if (namesArray.length >= 2) {
            // Fallback: If filtering didn't work, just take the second element
            // This handles cases where HR might be in a different format
            employeeName = namesArray[1] && typeof namesArray[1] === 'string'
              ? namesArray[1].trim()
              : '';
          }
        }
      }
      
      // Fallback 1: Extract from conversation ID (if it's in emp_ format)
      if (!employeeName || employeeName === '') {
        employeeName = getEmployeeNameFromId(conv.id);
      }
      
      // Fallback 2: If ID doesn't start with 'emp_', try to extract from lastMessage
      // Some conversations might have employee name mentioned in the message
      // Example: "Hello Alice, how are you doing today?" -> "Alice"
      if ((!employeeName || employeeName === '') && conv.lastMessage) {
        // Look for common greeting patterns followed by a name
        const greetings = ['hello', 'hi', 'hey', 'dear'];
        const lowerMessage = conv.lastMessage.toLowerCase();
        
        for (const greeting of greetings) {
          const index = lowerMessage.indexOf(greeting);
          if (index !== -1) {
            // Extract potential name after greeting (case-sensitive from original message)
            const afterGreeting = conv.lastMessage.substring(index + greeting.length).trim();
            // Match capitalized names (e.g., "Alice" or "Alice Johnson")
            const nameMatch = afterGreeting.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
            if (nameMatch && nameMatch[1] && nameMatch[1] !== HR_USER.NAME && !nameMatch[1].includes('(HR)')) {
              employeeName = nameMatch[1].trim();
              break;
            }
          }
        }
        
        // If no greeting pattern found, try to find any capitalized name in the message
        if (!employeeName || employeeName === '') {
          // Match any capitalized name pattern that's not HR
          const allNames = conv.lastMessage.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g);
          if (allNames) {
            for (const name of allNames) {
              if (name !== HR_USER.NAME && !name.includes('(HR)')) {
                employeeName = name.trim();
                break;
              }
            }
          }
        }
      }
      
      // Ensure we never return an array as a string
      if (typeof employeeName !== 'string') {
        employeeName = String(employeeName);
      }
      
      // Final fallback: Use a generic name based on ID
      if (!employeeName || employeeName.trim() === '') {
        // Use first 8 chars of ID as display name
        employeeName = conv.id ? `Conversation ${conv.id.substring(0, 8)}` : 'Conversation';
      }
      
      const employee = {
        id: conv.id,
        name: employeeName.trim(),
        lastMessage: conv.lastMessage || '',
        lastMessageTimestamp: conv.lastMessageTimestamp,
        lastMessageSenderId: conv.lastMessageSenderId || null, // Store sender ID of last message
        participantNames: conv.participantNames || [], // Store participant names for prefix detection
        unreadCount: 0, // Placeholder for future feature
      };
      
      return employee;
    }); // Don't filter - show all conversations, even if name extraction isn't perfect
  }, [conversations]);
  
  /**
   * Count of unread messages (can be extended to track actual unread status)
   */
  const unreadCount = useMemo(() => {
    // This is a placeholder - would need additional logic to track actual unread messages
    return 0;
  }, []);
  
  /**
   * Current conversation object
   */
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
    messages: sortedMessages, // Always return sorted messages
    
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

export default useChat;

