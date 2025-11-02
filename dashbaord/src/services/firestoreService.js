/**
 * Generic Firestore Service
 * 
 * Provides reusable CRUD operations and real-time listeners for Firestore
 * This service abstracts common database operations for use throughout the app
 * 
 * @module services/firestoreService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Gets a reference to a Firestore collection
 * 
 * @param {string} collectionName - Name of the collection
 * @returns {CollectionReference} Firestore collection reference
 */
export const getCollectionRef = (collectionName) => {
  return collection(db, collectionName);
};

/**
 * Gets a reference to a specific document
 * 
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {DocumentReference} Firestore document reference
 */
export const getDocumentRef = (collectionName, documentId) => {
  return doc(db, collectionName, documentId);
};

/**
 * Gets a reference to a subcollection within a document
 * 
 * @param {string} parentCollection - Name of the parent collection
 * @param {string} parentDocId - ID of the parent document
 * @param {string} subCollection - Name of the subcollection
 * @returns {CollectionReference} Firestore subcollection reference
 */
export const getSubcollectionRef = (parentCollection, parentDocId, subCollection) => {
  return collection(db, parentCollection, parentDocId, subCollection);
};

/**
 * Fetches all documents from a collection
 * 
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} Array of documents with their IDs
 * 
 * @example
 * const feedback = await getAllDocuments('feedback');
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = getCollectionRef(collectionName);
    const snapshot = await getDocs(collectionRef);
    
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
 * Fetches a single document by ID
 * 
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {Promise<Object|null>} Document data with ID, or null if not found
 * 
 * @example
 * const feedback = await getDocumentById('feedback', 'doc123');
 */
export const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = getDocumentRef(collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Adds a new document to a collection
 * 
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Data to add
 * @returns {Promise<string>} ID of the created document
 * 
 * @example
 * const id = await addDocument('feedback', { score: 5, notes: 'Great!' });
 */
export const addDocument = async (collectionName, data) => {
  try {
    const collectionRef = getCollectionRef(collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Updates an existing document
 * 
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 * 
 * @example
 * await updateDocument('feedback', 'doc123', { score: 4 });
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = getDocumentRef(collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Deletes a document from a collection
 * 
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {Promise<void>}
 * 
 * @example
 * await deleteDocument('feedback', 'doc123');
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = getDocumentRef(collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Queries documents with filters and sorting
 * 
 * @param {string} collectionName - Name of the collection
 * @param {Object} options - Query options
 * @param {Array} options.filters - Array of filter conditions [field, operator, value]
 * @param {string} options.orderByField - Field to order by
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc')
 * @param {number} options.limitCount - Maximum number of documents to return
 * @returns {Promise<Array>} Array of documents matching the query
 * 
 * @example
 * const feedback = await queryDocuments('feedback', {
 *   filters: [['score', '>=', 4]],
 *   orderByField: 'date',
 *   orderDirection: 'desc',
 *   limitCount: 10
 * });
 */
export const queryDocuments = async (collectionName, options = {}) => {
  try {
    const collectionRef = getCollectionRef(collectionName);
    const constraints = [];
    
    // Add filters
    if (options.filters && Array.isArray(options.filters)) {
      options.filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    // Add ordering
    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }
    
    // Add limit
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a collection
 * Calls the callback function whenever data changes
 * 
 * @param {string} collectionName - Name of the collection
 * @param {Function} callback - Callback function to handle data changes
 * @param {Object} options - Query options (same as queryDocuments)
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeToCollection('feedback', (data) => {
 *   console.log('Feedback updated:', data);
 * });
 * // Later: unsubscribe();
 */
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  try {
    const collectionRef = getCollectionRef(collectionName);
    const constraints = [];
    
    // Add filters
    if (options.filters && Array.isArray(options.filters)) {
      options.filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    // Add ordering
    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }
    
    // Add limit
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    const q = query(collectionRef, ...constraints);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(documents);
      },
      (error) => {
        console.error(`Error in real-time listener for ${collectionName}:`, error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up real-time listener for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a subcollection
 * 
 * @param {string} parentCollection - Name of the parent collection
 * @param {string} parentDocId - ID of the parent document
 * @param {string} subCollection - Name of the subcollection
 * @param {Function} callback - Callback function to handle data changes
 * @param {Object} options - Query options
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeToSubcollection(
 *   'conversations', 'emp_john_123', 'messages',
 *   (messages) => console.log('Messages:', messages),
 *   { orderByField: 'timestamp', orderDirection: 'asc' }
 * );
 */
export const subscribeToSubcollection = (
  parentCollection,
  parentDocId,
  subCollection,
  callback,
  options = {}
) => {
  try {
    const subcollectionRef = getSubcollectionRef(parentCollection, parentDocId, subCollection);
    const constraints = [];
    
    // Add filters
    if (options.filters && Array.isArray(options.filters)) {
      options.filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    // Add ordering
    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }
    
    // Add limit
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    const q = query(subcollectionRef, ...constraints);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(documents);
      },
      (error) => {
        console.error(
          `Error in real-time listener for ${parentCollection}/${parentDocId}/${subCollection}:`,
          error
        );
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
 * Returns server timestamp for consistent timestamping
 * 
 * @returns {FieldValue} Server timestamp
 */
export const getServerTimestamp = () => {
  return serverTimestamp();
};

