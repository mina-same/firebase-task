/**
 * useConversations Hook
 * Manages: Conversations list with real-time updates
 * Used in: Conversations List screen
 * 
 * @module hooks/useConversations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllConversations,
  subscribeConversations,
} from '../services/chatService';
import { LOADING_STATES } from '../config/constants';
import { HR_USER } from '../config/constants';

/**
 * Custom hook for managing conversations list
 * 
 * Provides:
 * - Conversations list data
 * - Loading states
 * - Error handling
 * - Real-time updates
 * - Helper functions
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch on mount (default: true)
 * @returns {Object} Conversations state and methods
 * 
 * @example
 * const {
 *   conversations,
 *   loading,
 *   error,
 *   refreshConversations,
 * } = useConversations({ realtime: true });
 */
const useConversations = (options = {}) => {
  const { realtime = true, autoFetch = true } = options;
  
  // State management
  const [conversations, setConversations] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  /**
   * Fetches conversations from Firestore (one-time)
   * 
   * This is used when realtime is disabled or for initial fetch.
   */
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      // Fetch conversations from Firestore
      const data = await getAllConversations();
      
      setConversations(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Refreshes conversations manually
   * 
   * Useful for pull-to-refresh functionality.
   */
  const refreshConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Set up real-time listener or fetch once
  useEffect(() => {
    if (!autoFetch) return;
    
    let unsubscribe;
    
    if (realtime) {
      // Set up real-time listener
      // This automatically updates whenever conversations change
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      try {
        unsubscribe = subscribeConversations((data) => {
          // Callback is called whenever conversations change
          setConversations(data);
          setLoadingState(LOADING_STATES.SUCCESS);
        });
      } catch (err) {
        console.error('❌ Error setting up conversations listener:', err);
        setError(err.message || 'Failed to subscribe to conversations');
        setLoadingState(LOADING_STATES.ERROR);
      }
    } else {
      // Fetch data once (not real-time)
      fetchConversations();
    }
    
    // Cleanup function
    // This runs when the component unmounts or dependencies change
    // Important: Always unsubscribe to prevent memory leaks
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realtime, autoFetch, fetchConversations]);
  
  /**
   * Gets HR name from a conversation (first participant)
   * 
   * For mobile: conversation name should be the FIRST participant (HR name)
   * 
   * Handles cases where participantNames might be:
   * 1. A proper array: ["Sarah Connor (HR)", "Alice Johnson"]
   * 2. A string representation: "["Sarah Connor (HR)", "Alice Johnson"]"
   * 3. An array where first element is a string: ["["Sarah Connor (HR)", "Alice Johnson"]", ...]
   * 
   * @param {Object} conversation - Conversation object
   * @returns {string} HR name (first participant)
   */
  const getHRNameFromConversation = useCallback((conversation) => {
    if (!conversation || !conversation.participantNames) return '';
    
    // Case 1: participantNames is a proper array
    if (Array.isArray(conversation.participantNames) && conversation.participantNames.length > 0) {
      const firstElement = conversation.participantNames[0];
      
      // Case 3: First element is a string representation of an array
      if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
        try {
          const parsed = JSON.parse(firstElement);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0]; // Return first name from parsed array
          }
        } catch (e) {
          console.warn('Failed to parse participantNames string:', e);
        }
      }
      
      // First element is already a valid string name
      if (typeof firstElement === 'string') {
        return firstElement;
      }
    }
    
    // Case 2: participantNames is a string representation of an array
    if (typeof conversation.participantNames === 'string' && conversation.participantNames.startsWith('[')) {
      try {
        const parsed = JSON.parse(conversation.participantNames);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0]; // Return first name from parsed array
        }
      } catch (e) {
        console.warn('Failed to parse participantNames string:', e);
      }
    }
    
    return '';
  }, []);
  
  /**
   * Gets employee name from a conversation (second participant)
   * 
   * Handles the same cases as getHRNameFromConversation for parsing participantNames.
   * 
   * @param {Object} conversation - Conversation object
   * @returns {string} Employee name (second participant)
   */
  const getEmployeeNameFromConversation = useCallback((conversation) => {
    if (!conversation || !conversation.participantNames) return '';
    
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
        // If parsing fails, return empty
        return '';
      }
    }
    
    // Get the second participant (employee name)
    if (Array.isArray(namesArray) && namesArray.length >= 2) {
      return namesArray[1];
    }
    
    // Fallback: find the name that's not HR
    if (namesArray.length > 0) {
      const employeeName = namesArray.find(
      (name) => name !== HR_USER.NAME
    );
      return employeeName || '';
    }
    
    return '';
  }, []);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  /**
   * Processes conversations for display
   * 
   * For mobile:
   * - Conversation name = FIRST participant (HR name, e.g., "Sarah Connor (HR)")
   * - Example: participantNames: ["Sarah Connor (HR)", "Alice Johnson"]
   * - Displayed name: "Sarah Connor (HR)" (not the full array, just the first name)
   */
  const processedConversations = conversations.map((conv) => {
    // Extract HR name (first participant) - this is what we'll display as conversation name
    let hrName = getHRNameFromConversation(conv); // First participant (HR, e.g., "Sarah Connor (HR)")
    
    // Safety check: if hrName is still an array or invalid, extract from participantNames
    if (!hrName || Array.isArray(hrName) || hrName.includes('[') || hrName.includes(',')) {
      if (conv.participantNames && Array.isArray(conv.participantNames) && conv.participantNames.length > 0) {
        hrName = conv.participantNames[0];
      }
    }
    
    // Extract employee name (second participant)
    const employeeName = getEmployeeNameFromConversation(conv); // Second participant (Employee, e.g., "Alice Johnson")
    
    return {
      id: conv.id,
      employeeName: hrName || 'Conversation', // Always use HR name (first participant) as conversation name
      hrName, // Store HR name
      employeeNameInConv: employeeName, // Store actual employee name (second participant)
      lastMessage: conv.lastMessage || '',
      lastMessageTimestamp: conv.lastMessageTimestamp,
      lastMessageSenderId: conv.lastMessageSenderId || null, // Store sender ID of last message
      participantNames: conv.participantNames || [],
    };
  });
  
  return {
    // Data
    conversations: processedConversations,
    conversationsCount: processedConversations.length,
    
    // Loading states
    loading: isLoading,
    isLoading,
    isError,
    isSuccess,
    loadingState,
    error,
    
    // Methods
    refreshConversations,
    fetchConversations,
    getEmployeeNameFromConversation,
  };
};

export default useConversations;

