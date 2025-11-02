/**
 * Chat Service - Chat-specific Firestore operations
 * 
 * Provides: Conversations, messages, sending messages
 * Uses: firestoreService.js for actual database operations
 * 
 * @module services/chatService
 */

// Import generic Firestore functions
import {
  getDocumentById,
  getAllDocuments,
  addSubcollectionDocument,
  subscribeToCollection,
  subscribeToSubcollection,
  getServerTimestamp,
  getDocumentRef,
  getSubcollectionRef,
} from './firestoreService';

// Import Firebase functions directly
import { setDoc, updateDoc, getDocs } from 'firebase/firestore';

// Import constants
import { COLLECTIONS, HR_USER } from '../config/constants';
import { generateEmployeeId } from '../utils/helpers';
import { validateMessage } from '../utils/helpers';

/**
 * Gets or creates a conversation document for an employee
 * 
 * If a conversation doesn't exist, creates it.
 * If it exists, just returns it.
 * 
 * @param {string} employeeName - Name of the employee
 * @returns {Promise<Object>} Conversation document data
 * 
 * @example
 * const conversation = await getOrCreateConversation('Alice Johnson');
 */
export const getOrCreateConversation = async (employeeName) => {
  try {
    // Generate employee ID from name
    // e.g., "Alice Johnson" -> "emp_alice_johnson"
    const employeeId = generateEmployeeId(employeeName);
    
    // Try to get existing conversation
    let conversation = await getDocumentById(COLLECTIONS.CONVERSATIONS, employeeId);
    
    // If conversation doesn't exist, create it
    if (!conversation) {
      // Prepare conversation data
      const conversationData = {
        participantNames: [HR_USER.NAME, employeeName],
        lastMessage: '',
        lastMessageTimestamp: getServerTimestamp(),
      };
      
      // Create the conversation document with specific ID
      const docRef = getDocumentRef(COLLECTIONS.CONVERSATIONS, employeeId);
      await setDoc(docRef, conversationData);
      
      // Return the created conversation
      conversation = {
        id: employeeId,
        ...conversationData,
      };
      
      console.log('✅ Conversation created:', employeeId);
    }
    
    return conversation;
  } catch (error) {
    console.error('❌ Error getting or creating conversation:', error);
    throw error;
  }
};

/**
 * Fetches all conversations for an employee
 * 
 * Gets all conversations where the employee is a participant.
 * Returns conversations sorted by last message time (newest first).
 * 
 * @returns {Promise<Array>} Array of conversation objects
 * 
 * @example
 * const conversations = await getAllConversations();
 */
export const getAllConversations = async () => {
  try {
    // Get all conversations from Firestore
    const conversations = await getAllDocuments(COLLECTIONS.CONVERSATIONS);
    
    // Sort by last message timestamp (newest first)
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : 0;
      const timeB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : 0;
      return timeB - timeA; // Newest first
    });
    
    return conversations;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Fetches all messages for a specific conversation
 * 
 * Gets all messages from the messages subcollection within a conversation.
 * 
 * @param {string} employeeId - Employee ID (conversation ID)
 * @returns {Promise<Array>} Array of message objects
 * 
 * @example
 * const messages = await getMessages('emp_alice_johnson');
 */
export const getMessages = async (employeeId) => {
  try {
    // Get all documents from the messages subcollection
    // This uses getAllDocuments but for a subcollection
    // For now, we'll use subscribeToSubcollection pattern
    // Note: getDocs can work directly with subcollection refs
    const subcollectionRef = getSubcollectionRef(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES
    );
    
    // Get all documents from subcollection
    const snapshot = await getDocs(subcollectionRef);
    
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by timestamp (oldest first for chat display)
    return messages.sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
      return timeA - timeB; // Oldest first
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
};

/**
 * Sends a message in a conversation
 * 
 * Adds a new message to the messages subcollection and updates
 * the conversation's last message metadata.
 * 
 * @param {string} employeeId - Employee ID (conversation ID)
 * @param {string} senderId - ID of the sender (HR_USER.ID or employeeId)
 * @param {string} messageText - Text content of the message
 * @returns {Promise<string>} ID of the created message
 * 
 * @example
 * await sendMessage(
 *   'emp_alice_johnson',
 *   'emp_alice_johnson',
 *   'Hello, I have a question.'
 * );
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
    const messageId = await addSubcollectionDocument(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES,
      messageData
    );
    
    // Update conversation metadata
    // This updates the "last message" shown in conversations list
    const conversationRef = getDocumentRef(COLLECTIONS.CONVERSATIONS, employeeId);
    await updateDoc(conversationRef, {
      lastMessage: messageText.trim().substring(0, 100), // First 100 chars
      lastMessageTimestamp: getServerTimestamp(),
      lastMessageSenderId: senderId, // Store sender ID to show "You:" or sender name
    });
    
    console.log('✅ Message sent successfully:', messageId);
    return messageId;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for conversations
 * 
 * Automatically updates whenever conversations change.
 * Perfect for showing live updates in the conversations list.
 * 
 * @param {Function} callback - Function called with updated conversations
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeConversations((conversations) => {
 *   setConversations(conversations);
 * });
 */
export const subscribeConversations = (callback) => {
  try {
    return subscribeToCollection(
      COLLECTIONS.CONVERSATIONS,
      (conversations) => {
        // Sort by last message timestamp (newest first)
        const sorted = conversations.sort((a, b) => {
          const timeA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : 0;
          const timeB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : 0;
          return timeB - timeA;
        });
        
        callback(sorted);
      },
      {
        orderByField: 'lastMessageTimestamp',
        orderDirection: 'desc',
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to conversations:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for messages in a conversation
 * 
 * Automatically updates whenever new messages are sent or received.
 * Perfect for real-time chat experience.
 * 
 * @param {string} employeeId - Employee ID (conversation ID)
 * @param {Function} callback - Function called with updated messages
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeMessages('emp_alice_johnson', (messages) => {
 *   setMessages(messages);
 * });
 */
export const subscribeMessages = (employeeId, callback) => {
  try {
    console.log(`📡 Setting up message subscription for conversation: ${employeeId}`);
    
    return subscribeToSubcollection(
      COLLECTIONS.CONVERSATIONS,
      employeeId,
      COLLECTIONS.MESSAGES,
      (messages) => {
        // Filter out messages without valid timestamps
        // This prevents messages from appearing with "N/A" time and then jumping
        // Only show messages that have resolved Firebase timestamps
        const validMessages = messages.filter((message) => {
          if (!message.timestamp) {
            console.warn('⚠️ Message without timestamp:', message.id);
            return false;
          }
          
          // Check if timestamp is a valid Firebase Timestamp that has been resolved
          if (message.timestamp.toMillis && typeof message.timestamp.toMillis === 'function') {
            try {
              const millis = message.timestamp.toMillis();
              // Ensure timestamp is valid (not 0, not NaN, positive number)
              if (millis && !isNaN(millis) && millis > 0 && millis < Number.MAX_SAFE_INTEGER) {
                // Check if timestamp is not too far in the future (within 1 hour margin for clock differences)
                const maxFutureTime = Date.now() + 60 * 60 * 1000; // 1 hour in future
                if (millis > maxFutureTime) {
                  console.warn('⚠️ Message with future timestamp:', message.id, new Date(millis));
                  return false;
                }
                // Timestamp is valid
                return true;
              }
            } catch (e) {
              console.warn('⚠️ Error converting timestamp toMillis:', message.id, e);
              return false;
            }
          }
          
          // If timestamp doesn't have toMillis or isn't a Date, it might be a server timestamp placeholder
          // Don't show it until Firebase resolves it with a real timestamp
          console.warn('⚠️ Message with unresolved timestamp:', message.id);
          return false;
        });
        
        // Remove duplicates by ID (in case same message comes multiple times in same update)
        const messageMap = new Map();
        validMessages.forEach((message) => {
          if (message.id) {
            // If we already have this message, keep the one with the latest timestamp
            const existing = messageMap.get(message.id);
            if (existing) {
              const existingTime = existing.timestamp?.toMillis ? existing.timestamp.toMillis() : 0;
              const newTime = message.timestamp?.toMillis ? message.timestamp.toMillis() : 0;
              if (newTime > existingTime) {
                messageMap.set(message.id, message);
              }
            } else {
              messageMap.set(message.id, message);
            }
          } else {
            // Messages without ID shouldn't happen, but include them
            messageMap.set(`temp_${Math.random()}`, message);
          }
        });
        
        const uniqueMessages = Array.from(messageMap.values());
        
        // Sort by timestamp (oldest first for chat display)
        const sorted = uniqueMessages.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeA - timeB;
        });
        
        console.log(`✅ Messages callback for ${employeeId}:`, sorted.length, 'valid messages (filtered from', messages.length, 'total)');
        callback(sorted);
      },
      {
        orderByField: 'timestamp',
        orderDirection: 'asc',
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to messages:', error);
    throw error;
  }
};

