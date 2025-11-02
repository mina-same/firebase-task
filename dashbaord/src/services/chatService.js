/**
 * Chat Service
 * 
 * Handles all operations related to the chat functionality
 * Manages conversations and messages between HR and employees
 * 
 * @module services/chatService
 */

import { addDoc, setDoc, getDocs } from 'firebase/firestore';
import {
  getDocumentById,
  getDocumentRef,
  updateDocument,
  subscribeToCollection,
  subscribeToSubcollection,
  getCollectionRef,
  getSubcollectionRef,
  getServerTimestamp,
} from './firestoreService';
import { COLLECTIONS, HR_USER } from '../config/constants';
import { validateMessage } from '../utils/validators';
import { generateEmployeeId } from '../utils/helpers';

/**
 * Gets or creates a conversation document for an employee
 * 
 * @param {string} employeeName - Name of the employee
 * @returns {Promise<Object>} Conversation document data
 * 
 * @example
 * const conversation = await getOrCreateConversation('Jane Doe');
 */
export const getOrCreateConversation = async (employeeName) => {
  try {
    const employeeId = generateEmployeeId(employeeName);
    
    // Try to get existing conversation
    let conversation = await getDocumentById(COLLECTIONS.CONVERSATIONS, employeeId);
    
    // If it doesn't exist, create it
    if (!conversation) {
      const conversationData = {
        participantNames: [HR_USER.NAME, employeeName],
        lastMessage: '',
        lastMessageTimestamp: getServerTimestamp(),
      };
      
      // Use setDoc with specific ID instead of addDoc
      const docRef = getDocumentRef(COLLECTIONS.CONVERSATIONS, employeeId);
      await setDoc(docRef, conversationData);
      
      conversation = {
        id: employeeId,
        ...conversationData,
      };
      
      console.log('Conversation created:', employeeId);
    }
    
    return conversation;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw new Error('Failed to initialize conversation');
  }
};

/**
 * Fetches all conversations from Firestore
 * 
 * @returns {Promise<Array>} Array of conversation objects
 * 
 * @example
 * const conversations = await getAllConversations();
 */
export const getAllConversations = async () => {
  try {
    const collectionRef = getCollectionRef(COLLECTIONS.CONVERSATIONS);
    const snapshot = await getDocs(collectionRef);
    
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by last message timestamp (most recent first)
    return conversations.sort((a, b) => {
      const timeA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : 0;
      const timeB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
};

/**
 * Fetches all messages for a specific conversation
 * 
 * @param {string} employeeId - ID of the employee (conversation ID)
 * @returns {Promise<Array>} Array of message objects
 * 
 * @example
 * const messages = await getMessages('emp_jane_doe');
 */
export const getMessages = async (employeeId) => {
  try {
    const subcollectionRef = getSubcollectionRef(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES
    );
    
    const snapshot = await getDocs(subcollectionRef);
    
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by timestamp (oldest first for chat display)
    return messages.sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
      return timeA - timeB;
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
};

/**
 * Sends a message in a conversation
 * Updates both the messages subcollection and the conversation metadata
 * 
 * @param {string} employeeId - ID of the employee (conversation ID)
 * @param {string} senderId - ID of the sender (HR_USER.ID or employeeId)
 * @param {string} messageText - Text content of the message
 * @returns {Promise<string>} ID of the created message
 * 
 * @example
 * await sendMessage('emp_jane_doe', HR_USER.ID, 'Hello, how can I help?');
 */
export const sendMessage = async (employeeId, senderId, messageText) => {
  try {
    // Validate message
    const validation = validateMessage(messageText);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Prepare message data
    const messageData = {
      senderId,
      text: messageText.trim(),
      timestamp: getServerTimestamp(),
    };
    
    // Add message to subcollection
    const subcollectionRef = getSubcollectionRef(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES
    );
    const messageRef = await addDoc(subcollectionRef, messageData);
    
    // Update conversation metadata
    await updateDocument(COLLECTIONS.CONVERSATIONS, employeeId, {
      lastMessage: messageText.trim().substring(0, 100), // Store first 100 chars
      lastMessageTimestamp: getServerTimestamp(),
      lastMessageSenderId: senderId, // Store sender ID to show sender name in conversation list
    });
    
    console.log('Message sent successfully:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

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
 * Sends a message from HR to an employee
 * Uses the first element of participantNames as senderId
 * 
 * @param {string} conversationId - ID of the conversation (conversation document ID)
 * @param {string} messageText - Text content of the message
 * @returns {Promise<string>} ID of the created message
 * 
 * @example
 * await sendMessageFromHR('emp_jane_doe', 'Great work on the project!');
 */
export const sendMessageFromHR = async (conversationId, messageText) => {
  try {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    // Check if conversation exists first - don't create new ones
    const conversation = await getDocumentById(COLLECTIONS.CONVERSATIONS, conversationId);
    
    // Only send message if conversation already exists
    if (!conversation) {
      throw new Error(`Conversation not found with ID: ${conversationId}. Cannot send message. Only existing conversations from Firebase can be used.`);
    }
    
    // Get HR name from participantNames (first element)
    const hrSenderId = getHRNameFromParticipantNames(conversation.participantNames);
    
    if (!hrSenderId) {
      throw new Error('Could not determine HR sender ID from participantNames');
    }
    
    // Use HR name from participantNames as senderId instead of HR_USER.ID
    return await sendMessage(conversationId, hrSenderId, messageText);
  } catch (error) {
    console.error('Error sending message from HR:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for all conversations
 * 
 * @param {Function} callback - Callback function called with updated conversations
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeConversations((conversations) => {
 *   setConversationList(conversations);
 * });
 */
export const subscribeConversations = (callback) => {
  try {
    return subscribeToCollection(
      COLLECTIONS.CONVERSATIONS,
      (conversations) => {
        // Sort by last message timestamp (most recent first)
        const sortedConversations = conversations.sort((a, b) => {
          const timeA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : 0;
          const timeB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : 0;
          return timeB - timeA;
        });
        
        callback(sortedConversations);
      },
      {
        orderByField: 'lastMessageTimestamp',
        orderDirection: 'desc',
      }
    );
  } catch (error) {
    console.error('Error subscribing to conversations:', error);
    throw new Error('Failed to subscribe to conversations');
  }
};

/**
 * Sets up a real-time listener for messages in a specific conversation
 * 
 * @param {string} employeeId - ID of the employee (conversation ID)
 * @param {Function} callback - Callback function called with updated messages
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeMessages('emp_jane_doe', (messages) => {
 *   setMessages(messages);
 * });
 */
export const subscribeMessages = (employeeId, callback) => {
  try {
    return subscribeToSubcollection(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES,
      (messages) => {
        // Sort by timestamp (oldest first for chat display)
        // Handle both Firestore Timestamp objects and other formats
        const sortedMessages = [...messages].sort((a, b) => {
          let timeA = 0;
          let timeB = 0;
          
          // Handle Firestore Timestamp
          if (a.timestamp) {
            if (a.timestamp.toMillis && typeof a.timestamp.toMillis === 'function') {
              timeA = a.timestamp.toMillis();
            } else if (a.timestamp.seconds) {
              timeA = a.timestamp.seconds * 1000 + (a.timestamp.nanoseconds || 0) / 1000000;
            } else if (a.timestamp instanceof Date) {
              timeA = a.timestamp.getTime();
            } else if (typeof a.timestamp === 'number') {
              timeA = a.timestamp;
            }
          }
          
          // Handle Firestore Timestamp
          if (b.timestamp) {
            if (b.timestamp.toMillis && typeof b.timestamp.toMillis === 'function') {
              timeB = b.timestamp.toMillis();
            } else if (b.timestamp.seconds) {
              timeB = b.timestamp.seconds * 1000 + (b.timestamp.nanoseconds || 0) / 1000000;
            } else if (b.timestamp instanceof Date) {
              timeB = b.timestamp.getTime();
            } else if (typeof b.timestamp === 'number') {
              timeB = b.timestamp;
            }
          }
          
          // Fallback: use document ID if timestamps are equal or missing
          if (timeA === timeB) {
            return (a.id || '').localeCompare(b.id || '');
          }
          
          return timeA - timeB;
        });
        
        callback(sortedMessages);
      },
      {
        orderByField: 'timestamp',
        orderDirection: 'asc',
      }
    );
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    throw new Error('Failed to subscribe to messages');
  }
};

/**
 * Gets the employee name from a conversation ID
 * 
 * @param {string} employeeId - Employee ID (conversation ID)
 * @returns {string} Employee name extracted from the ID
 * 
 * @example
 * getEmployeeNameFromId('emp_jane_doe') // "Jane Doe"
 */
export const getEmployeeNameFromId = (employeeId) => {
  if (!employeeId || !employeeId.startsWith('emp_')) {
    return '';
  }
  
  return employeeId
    .substring(4) // Remove 'emp_' prefix
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Adds sample chat data to Firestore
 * Useful for testing and development
 * 
 * @returns {Promise<void>}
 */
export const addSampleChatData = async () => {
  try {
    const employees = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'];
    
    for (const employeeName of employees) {
      // Create conversation
      await getOrCreateConversation(employeeName);
      
      const employeeId = generateEmployeeId(employeeName);
      
      // Add sample messages
      await sendMessage(employeeId, HR_USER.ID, `Hello ${employeeName}, how are you doing?`);
      await sendMessage(employeeId, employeeId, 'Hi! I\'m doing well, thank you for asking.');
      await sendMessage(
        employeeId,
        HR_USER.ID,
        'Great! I wanted to discuss your recent performance review.'
      );
    }
    
    console.log('Sample chat data added successfully');
  } catch (error) {
    console.error('Error adding sample chat data:', error);
    throw new Error('Failed to add sample chat data');
  }
};

