/**
 * useChat Hook
 * Manages: Messages, sending messages, real-time updates
 * Used in: Chat Screen
 * 
 * @module hooks/useChat
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMessages,
  sendMessage,
  subscribeMessages,
  getOrCreateConversation,
} from '../services/chatService';
import { LOADING_STATES, HR_USER, MESSAGE_TYPES } from '../config/constants';
import { generateEmployeeId } from '../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, COLLECTIONS } from '../config/constants';
import { getDocumentById as getDocumentByIdFromFirestore } from '../services/firestoreService';

/**
 * Custom hook for managing chat
 * 
 * Provides:
 * - Messages list for a conversation
 * - Sending messages
 * - Real-time message updates
 * - Loading and error states
 * - Helper functions for message handling
 * 
 * @param {Object} options - Hook options
 * @param {string} options.employeeId - Employee ID (conversation ID)
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch on mount (default: true)
 * @returns {Object} Chat state and methods
 * 
 * @example
 * const {
 *   messages,
 *   loading,
 *   sendChatMessage,
 *   isHRMessage,
 * } = useChat({
 *   employeeId: 'emp_alice_johnson',
 *   realtime: true
 * });
 */
const useChat = (options = {}) => {
  const { employeeId, realtime = true, autoFetch = true } = options;
  
  // State management
  const [messages, setMessages] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [currentEmployeeName, setCurrentEmployeeName] = useState(null);
  const [conversation, setConversation] = useState(null);
  
  /**
   * Parses participantNames and extracts employee name (second participant)
   * 
   * Handles cases where participantNames might be:
   * 1. A proper array: ["Sarah Connor (HR)", "Alice Johnson"]
   * 2. A string representation: "["Sarah Connor (HR)", "Alice Johnson"]"
   * 3. An array where first element is a string: ["["Sarah Connor (HR)", "Alice Johnson"]", ...]
   * 
   * @param {Object} conversation - Conversation object
   * @returns {string|null} Employee name (second participant) or null
   */
  const getEmployeeNameFromParticipantNames = useCallback((conversation) => {
    if (!conversation || !conversation.participantNames) return null;
    
    let namesArray = [];
    
    // Case 1: participantNames is a proper array
    if (Array.isArray(conversation.participantNames) && conversation.participantNames.length > 0) {
      const firstElement = conversation.participantNames[0];
      
      // Case 3: First element is a string representation of an array
      // e.g., participantNames[0] = "["Sarah Connor (HR)", "Alice Johnson"]"
      if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
        try {
          const parsed = JSON.parse(firstElement);
          if (Array.isArray(parsed)) {
            namesArray = parsed;
          } else {
            namesArray = conversation.participantNames;
          }
        } catch (e) {
          namesArray = conversation.participantNames;
        }
      } else {
        // Normal array format
        namesArray = conversation.participantNames;
      }
    } 
    // Case 2: participantNames is a string representation of an array
    else if (typeof conversation.participantNames === 'string' && conversation.participantNames.startsWith('[')) {
      try {
        const parsed = JSON.parse(conversation.participantNames);
        if (Array.isArray(parsed)) {
          namesArray = parsed;
        }
      } catch (e) {
        return null;
      }
    }
    
    // Get the second participant (employee name)
    if (Array.isArray(namesArray) && namesArray.length >= 2) {
      return namesArray[1];
    }
    
    return null;
  }, []);
  
  /**
   * Gets the current employee ID and name from AsyncStorage or conversation
   * 
   * For mobile: employee name is the second participant in participantNames array
   * 
   * @returns {Promise<{employeeId: string|null, employeeName: string|null}>} Employee ID and name
   */
  const getCurrentEmployeeInfo = useCallback(async (convId) => {
    try {
      // Try to get from AsyncStorage first
      const storedId = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_ID);
      const storedName = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_NAME);
      
      // If we have both stored, use them
      if (storedId && storedName) {
        setCurrentEmployeeId(storedId);
        setCurrentEmployeeName(storedName);
        return { employeeId: storedId, employeeName: storedName };
      }
      
      // If we have conversationId, get conversation to extract employee name
      if (convId) {
        try {
          const conv = await getDocumentByIdFromFirestore(COLLECTIONS.CONVERSATIONS, convId);
          if (conv) {
            // Extract employee name using helper function
            const empName = getEmployeeNameFromParticipantNames(conv);
            if (empName) {
              const empId = convId;
              
              // Store in AsyncStorage for future use
              await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, empId);
              await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, empName);
              
              setCurrentEmployeeId(empId);
              setCurrentEmployeeName(empName);
              setConversation(conv);
              return { employeeId: empId, employeeName: empName };
            }
          }
        } catch (err) {
          console.error('❌ Error getting conversation:', err);
        }
      }
      
      // If no ID stored and we have employeeId prop, use that
      if (employeeId) {
        try {
          const conv = await getDocumentByIdFromFirestore(COLLECTIONS.CONVERSATIONS, employeeId);
          if (conv) {
            // Extract employee name using helper function
            const empName = getEmployeeNameFromParticipantNames(conv);
            if (empName) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, employeeId);
              await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, empName);
        setCurrentEmployeeId(employeeId);
              setCurrentEmployeeName(empName);
              setConversation(conv);
              return { employeeId, employeeName: empName };
            }
          }
        } catch (err) {
          console.error('❌ Error getting conversation:', err);
        }
      }
      
      return { employeeId: null, employeeName: null };
    } catch (err) {
      console.error('❌ Error getting employee info:', err);
      return { employeeId: null, employeeName: null };
    }
  }, [employeeId, getEmployeeNameFromParticipantNames]);
  
  /**
   * Fetches messages from Firestore (one-time)
   * 
   * Used when realtime is disabled or for initial fetch.
   * 
   * @param {string} empId - Employee ID to fetch messages for
   */
  const fetchMessages = useCallback(async (empId) => {
    if (!empId) return;
    
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      // Get conversation to extract employee name
      const conv = await getDocumentByIdFromFirestore(COLLECTIONS.CONVERSATIONS, empId);
      if (conv) {
        setConversation(conv);
        // Extract employee name using helper function
        const empName = getEmployeeNameFromParticipantNames(conv);
        if (empName) {
          setCurrentEmployeeName(empName);
          await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, empName);
        }
      }
      
      // Fetch messages
      const data = await getMessages(empId);
      
      setMessages(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Sends a message from the employee (mobile user) to HR
   * 
   * For mobile:
   * - senderId = second participant name (e.g., "Alice Johnson")
   * - Example: participantNames: ["Sarah Connor (HR)", "Alice Johnson"]
   * - When sending: senderId = "Alice Johnson" (the second name in the array)
   * 
   * Message structure:
   * {
   *   senderId: "Alice Johnson" (string) - second in participantNames array
   *   text: "Hello Alice, how are you doing today?" (string)
   *   timestamp: November 2, 2025 at 11:58:22 AM UTC+2 (timestamp)
   * }
   * 
   * @param {string} messageText - Text content of the message
   * @returns {Promise<string>} ID of the sent message
   */
  const sendChatMessage = useCallback(async (messageText) => {
    // Get current employee info (ID and name)
    // employeeName will be the second participant (e.g., "Alice Johnson")
    const { employeeId: empId, employeeName: empName } = await getCurrentEmployeeInfo(employeeId);
    
    if (!empId || !empName) {
      throw new Error('Employee information not found. Please set your employee information.');
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Send message using employee's NAME as senderId (second in participantNames array)
      // Example: senderId = "Alice Johnson" (not "emp_alice_johnson" or "Sarah Connor (HR)")
      const messageId = await sendMessage(empId, empName, messageText);
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [employeeId, getCurrentEmployeeInfo]);
  
  /**
   * Sets up real-time listener for messages
   * 
   * Automatically updates whenever new messages are added.
   */
  useEffect(() => {
    // Use the conversationId (employeeId prop) directly - this is the conversation ID from route params
    if (!employeeId) {
      console.warn('⚠️ No conversation ID provided to useChat');
      return;
    }
      
      if (!autoFetch) return;
      
      let unsubscribe;
      
      if (realtime) {
        // Set up real-time listener
        setLoadingState(LOADING_STATES.LOADING);
        setError(null);
        
        try {
        // Get conversation to extract employee name
        getDocumentByIdFromFirestore(COLLECTIONS.CONVERSATIONS, employeeId)
          .then((conv) => {
            if (conv) {
              setConversation(conv);
              // Extract employee name using helper function
              const empName = getEmployeeNameFromParticipantNames(conv);
              if (empName) {
                setCurrentEmployeeName(empName);
                setCurrentEmployeeId(employeeId);
                AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, empName);
                AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, employeeId);
              }
            }
            
            // Set up listener for messages using the conversation ID
            unsubscribe = subscribeMessages(employeeId, (data) => {
              // Callback is called whenever messages change
              console.log(`✅ Messages received for conversation ${employeeId}:`, data.length);
              setMessages(data);
              setLoadingState(LOADING_STATES.SUCCESS);
            });
          })
          .catch((err) => {
            console.error('❌ Error getting conversation:', err);
            setError(err.message || 'Failed to subscribe to messages');
            setLoadingState(LOADING_STATES.ERROR);
          });
        } catch (err) {
          console.error('❌ Error setting up messages listener:', err);
          setError(err.message || 'Failed to subscribe to messages');
          setLoadingState(LOADING_STATES.ERROR);
        }
      } else {
        // Fetch messages once
      fetchMessages(employeeId);
      }
      
      // Cleanup function
      // Always unsubscribe when component unmounts or employeeId changes
      return () => {
        if (unsubscribe) {
        console.log(`🔌 Unsubscribing from messages for conversation ${employeeId}`);
          unsubscribe();
        }
      };
  }, [employeeId, realtime, autoFetch, fetchMessages, getEmployeeNameFromParticipantNames]);
  
  /**
   * Parses participantNames and extracts HR name (first participant)
   * 
   * Handles the same cases as getEmployeeNameFromParticipantNames.
   * 
   * @param {Object} conversation - Conversation object
   * @returns {string|null} HR name (first participant) or null
   */
  const getHRNameFromParticipantNames = useCallback((conversation) => {
    if (!conversation || !conversation.participantNames) return null;
    
    let namesArray = [];
    
    // Case 1: participantNames is a proper array
    if (Array.isArray(conversation.participantNames) && conversation.participantNames.length > 0) {
      const firstElement = conversation.participantNames[0];
      
      // Case 3: First element is a string representation of an array
      if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
        try {
          const parsed = JSON.parse(firstElement);
          if (Array.isArray(parsed)) {
            namesArray = parsed;
          } else {
            namesArray = conversation.participantNames;
          }
        } catch (e) {
          namesArray = conversation.participantNames;
        }
      } else {
        // Normal array format
        namesArray = conversation.participantNames;
      }
    } 
    // Case 2: participantNames is a string representation of an array
    else if (typeof conversation.participantNames === 'string' && conversation.participantNames.startsWith('[')) {
      try {
        const parsed = JSON.parse(conversation.participantNames);
        if (Array.isArray(parsed)) {
          namesArray = parsed;
        }
      } catch (e) {
        return null;
      }
    }
    
    // Get the first participant (HR name)
    if (Array.isArray(namesArray) && namesArray.length > 0) {
      return namesArray[0];
    }
    
    return null;
  }, []);
  
  /**
   * Determines if a message was sent by HR (not by mobile user)
   * 
   * For mobile:
   * - "Other messages" = messages where senderId = first participant name (e.g., "Sarah Connor (HR)")
   * - "My messages" = messages where senderId = second participant name (e.g., "Alice Johnson")
   * 
   * Example:
   * - participantNames: ["Sarah Connor (HR)", "Alice Johnson"]
   * - Message with senderId = "Sarah Connor (HR)" → isHRMessage = true (other message)
   * - Message with senderId = "Alice Johnson" → isHRMessage = false (my message)
   * 
   * @param {Object} message - Message object
   * @returns {boolean} True if message is from HR (first participant)
   */
  const isHRMessage = useCallback((message) => {
    // Check against HR name from conversation (first participant)
    // senderId should be "Sarah Connor (HR)" for messages from HR
    if (conversation) {
      const hrName = getHRNameFromParticipantNames(conversation);
      if (hrName) {
        return message.senderId === hrName;
      }
    }
    
    // Fallback: check against HR_USER.NAME or HR_USER.ID
    return message.senderId === HR_USER.NAME || message.senderId === HR_USER.ID;
  }, [conversation, getHRNameFromParticipantNames]);
  
  /**
   * Determines if a message was sent by the current employee (mobile user)
   * 
   * For mobile:
   * - "My messages" = messages where senderId = second participant name (e.g., "Alice Johnson")
   * - "Other messages" = messages where senderId = first participant name (e.g., "Sarah Connor (HR)")
   * 
   * Example:
   * - participantNames: ["Sarah Connor (HR)", "Alice Johnson"]
   * - Message with senderId = "Alice Johnson" → isSentMessage = true (my message)
   * - Message with senderId = "Sarah Connor (HR)" → isSentMessage = false (other message)
   * 
   * @param {Object} message - Message object
   * @returns {boolean} True if message is from current employee (sent by mobile user)
   */
  const isSentMessage = useCallback((message) => {
    // Check against current employee name (second in participantNames array)
    // senderId should be "Alice Johnson" for messages sent from mobile
    if (currentEmployeeName && message.senderId === currentEmployeeName) {
      return true;
    }
    
    // Fallback: check conversation's participantNames if available
    if (conversation) {
      const employeeName = getEmployeeNameFromParticipantNames(conversation);
      if (employeeName) {
        return message.senderId === employeeName;
      }
    }
    
    return false;
  }, [currentEmployeeName, conversation, getEmployeeNameFromParticipantNames]);
  
  /**
   * Gets message type (sent or received)
   * 
   * @param {Object} message - Message object
   * @returns {string} MESSAGE_TYPES.SENT or MESSAGE_TYPES.RECEIVED
   */
  const getMessageType = useCallback((message) => {
    return isSentMessage(message) ? MESSAGE_TYPES.SENT : MESSAGE_TYPES.RECEIVED;
  }, [isSentMessage]);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  return {
    // Data
    messages,
    messagesCount: messages.length,
    currentEmployeeId,
    currentEmployeeName,
    conversation,
    
    // Loading states
    loading: isLoading,
    isLoading,
    isError,
    isSuccess,
    loadingState,
    error,
    sendingMessage,
    
    // Methods
    sendChatMessage,
    fetchMessages,
    isHRMessage,
    isSentMessage,
    getMessageType,
    refreshMessages: () => getCurrentEmployeeInfo(employeeId).then(({ employeeId: empId }) => fetchMessages(empId)),
  };
};

export default useChat;

