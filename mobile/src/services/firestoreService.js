/**
 * Firestore Service - Generic Firestore operations
 * 
 * Provides: Read/write data, one-time fetches, real-time listeners
 * Use for: Basic Firestore operations (use chatService.js for chat-specific)
 * 
 * ⚠️ Important: Always unsubscribe real-time listeners to prevent memory leaks
 * 
 * @module services/firestoreService
 */

// Import Firestore functions from Firebase SDK
import {
  collection,        // Get a reference to a collection
  doc,              // Get a reference to a document
  getDoc,           // Get a single document (once)
  getDocs,          // Get multiple documents (once)
  addDoc,           // Add a new document
  updateDoc,        // Update an existing document
  deleteDoc,        // Delete a document
  query,            // Create a query
  where,            // Filter query
  orderBy,          // Sort query
  limit,            // Limit query results
  onSnapshot,       // Real-time listener (updates automatically)
  serverTimestamp,  // Firebase server timestamp
  Timestamp,        // Firebase timestamp type
} from 'firebase/firestore';

// Import our Firebase configuration
import { db, isFirebaseConfigured } from '../config/firebase.config';

/**
 * Gets a reference to a Firestore collection
 * Use before: getDocs(), addDoc(), or listeners
 * 
 * @param {string} collectionName - Collection name
 * @returns {CollectionReference} Reference (not data!)
 */
export const getCollectionRef = (collectionName) => {
  return collection(db, collectionName);
};

/**
 * Gets a reference to a specific document
 * Use when: You know the exact document ID
 * 
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {DocumentReference} Reference (not data!)
 */
export const getDocumentRef = (collectionName, documentId) => {
  return doc(db, collectionName, documentId);
};

/**
 * Gets a reference to a subcollection (nested collection)
 * Path: parentCollection/parentDocId/subCollection
 * Used for: conversations/{id}/messages
 * 
 * param {string} parentCollection - Parent collection name
 * param {string} parentDocId - Parent document ID
 * param {string} subCollection - Subcollection name
 * returns {CollectionReference} Subcollection reference
 */
export const getSubcollectionRef = (parentCollection, parentDocId, subCollection) => {
  return collection(db, parentCollection, parentDocId, subCollection);
};

/**
 * Fetches one document by ID (ONE-TIME, not real-time)
 * Returns: Document data with ID, or null if not found
 * 
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<Object|null>} Document data or null
 */
export const getDocumentById = async (collectionName, documentId) => {
  try {
    // Get reference to the document
    const docRef = getDocumentRef(collectionName, documentId);
    
    // Fetch the document
    const docSnap = await getDoc(docRef);
    
    // Check if document exists
    if (docSnap.exists()) {
      // Return document data with ID included
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    
    // Document doesn't exist
    return null;
  } catch (error) {
    console.error(`Error fetching document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Fetches ALL documents from a collection (ONE-TIME, not real-time)
 * ⚠️ Gets ALL documents - use filters/limits for large collections
 * 
 * @param {string} collectionName - Collection name
 * @returns {Promise<Array>} Array of documents (each has id + data)
 */
export const getAllDocuments = async (collectionName) => {
  try {
    // Get reference to the collection
    const collectionRef = getCollectionRef(collectionName);
    
    // Fetch all documents
    const snapshot = await getDocs(collectionRef);
    
    // Convert snapshot to array of document objects
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Adds a new document to a collection
 * Auto-generates: Unique ID, createdAt timestamp
 * Returns: New document ID
 * 
 * @param {string} collectionName - Collection name
 * @param {Object} data - Data to store
 * @returns {Promise<string>} New document ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    // Get reference to the collection
    const collectionRef = getCollectionRef(collectionName);
    
    // Add document (Firebase generates ID automatically)
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(), // Add timestamp automatically
    });
    
    // Return the ID of the created document
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Adds a document to a subcollection
 * 
 * Adds a document to a nested collection inside a document.
 * Used for adding messages to conversations.
 * 
 * @param {string} parentCollection - Name of the parent collection
 * @param {string} parentDocId - ID of the parent document
 * @param {string} subCollection - Name of the subcollection
 * @param {Object} data - Data to add
 * @returns {Promise<string>} ID of the created document
 * 
 * @example
 * const messageId = await addSubcollectionDocument(
 *   'conversations',
 *   'emp_alice_johnson',
 *   'messages',
 *   { text: 'Hello!', senderId: 'emp_alice_johnson' }
 * );
 */
export const addSubcollectionDocument = async (
  parentCollection,
  parentDocId,
  subCollection,
  data
) => {
  try {
    // Get reference to the subcollection
    const subcollectionRef = getSubcollectionRef(
      parentCollection,
      parentDocId,
      subCollection
    );
    
    // Add document to subcollection
    const docRef = await addDoc(subcollectionRef, {
      ...data,
      timestamp: serverTimestamp(), // Add timestamp automatically
    });
    
    return docRef.id;
  } catch (error) {
    console.error(
      `Error adding document to ${parentCollection}/${parentDocId}/${subCollection}:`,
      error
    );
    throw error;
  }
};

/**
 * Sets up REAL-TIME listener (auto-updates on changes)
 * ⚠️ CRITICAL: Must call unsubscribe() in useEffect cleanup to prevent memory leaks
 * 
 * @param {string} collectionName - Collection to listen to
 * @param {Function} callback - Called with updated documents array
 * @param {Object} options - Query options (filters, sorting, limit)
 * @returns {Function} unsubscribe() - Call this to stop listening
 * 
 * @example
 * useEffect(() => {
 *   const unsubscribe = subscribeToCollection('conversations', setConversations);
 *   return () => unsubscribe(); // Cleanup!
 * }, []);
 */
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  try {
    // Get reference to the collection
    const collectionRef = getCollectionRef(collectionName);
    
    // Build query with filters and sorting
    const constraints = [];
    
    // Add filters (e.g., where('score', '>', 3))
    if (options.filters && Array.isArray(options.filters)) {
      options.filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    // Add sorting (e.g., orderBy('timestamp', 'desc'))
    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }
    
    // Add limit (e.g., limit(10))
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    // Create query
    const q = query(collectionRef, ...constraints);
    
    // Set up real-time listener
    // onSnapshot automatically fires whenever data changes
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Convert snapshot to array of documents
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Call the callback with updated data
        callback(documents);
      },
      (error) => {
        // Handle errors
        console.error(`Error in real-time listener for ${collectionName}:`, error);
      }
    );
    
    // Return unsubscribe function
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up real-time listener for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Sets up REAL-TIME listener for a subcollection (nested collection)
 * Used for: conversations/{id}/messages
 * ⚠️ Must call unsubscribe() in useEffect cleanup
 * 
 * @param {string} parentCollection - Parent collection name
 * @param {string} parentDocId - Parent document ID
 * @param {string} subCollection - Subcollection name
 * @param {Function} callback - Called with updated documents array
 * @param {Object} options - Query options (sorting, limit)
 * @returns {Function} unsubscribe() - Call to stop listening
 */
export const subscribeToSubcollection = (
  parentCollection,
  parentDocId,
  subCollection,
  callback,
  options = {}
) => {
  try {
    // Get reference to the subcollection
    const subcollectionRef = getSubcollectionRef(
      parentCollection,
      parentDocId,
      subCollection
    );
    
    // Build query
    const constraints = [];
    
    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }
    
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    // Create query
    const q = query(subcollectionRef, ...constraints);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`✅ Real-time update for ${parentCollection}/${parentDocId}/${subCollection}:`, documents.length, 'documents');
        callback(documents);
      },
      (error) => {
        console.error(
          `❌ Error in real-time listener for ${parentCollection}/${parentDocId}/${subCollection}:`,
          error
        );
        // Call callback with empty array on error to handle gracefully
        callback([]);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error(
      `Error setting up real-time listener for ${parentCollection}/${parentDocId}/${subCollection}:`,
      error
    );
    throw error;
  }
};

/**
 * Returns Firebase server timestamp (consistent across all devices)
 * Use for: Message timestamps, creation dates
 * 
 * @returns {FieldValue} Server timestamp
 */
export const getServerTimestamp = () => {
  return serverTimestamp();
};

