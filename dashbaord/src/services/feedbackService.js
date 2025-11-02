/**
 * Feedback Service
 * 
 * Handles all operations related to employee feedback data
 * Provides methods for CRUD operations and real-time updates
 * 
 * @module services/feedbackService
 */

import { addDoc } from 'firebase/firestore';
import {
  getAllDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  subscribeToCollection,
  getCollectionRef,
  getServerTimestamp,
} from './firestoreService';
import { COLLECTIONS } from '../config/constants';
import { validateFeedback } from '../utils/validators';

/**
 * Fetches all feedback records from Firestore
 * 
 * @returns {Promise<Array>} Array of feedback objects
 * 
 * @example
 * const allFeedback = await getAllFeedback();
 */
export const getAllFeedback = async () => {
  try {
    const feedback = await getAllDocuments(COLLECTIONS.FEEDBACK);
    
    // Sort by date (newest first)
    return feedback.sort((a, b) => {
      const dateA = a.date?.toMillis ? a.date.toMillis() : 0;
      const dateB = b.date?.toMillis ? b.date.toMillis() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    throw new Error('Failed to fetch feedback data');
  }
};

/**
 * Fetches a single feedback record by ID
 * 
 * @param {string} feedbackId - ID of the feedback document
 * @returns {Promise<Object|null>} Feedback object or null if not found
 * 
 * @example
 * const feedback = await getFeedbackById('abc123');
 */
export const getFeedbackById = async (feedbackId) => {
  try {
    return await getDocumentById(COLLECTIONS.FEEDBACK, feedbackId);
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    throw new Error('Failed to fetch feedback');
  }
};

/**
 * Creates a new feedback record
 * Validates the data before adding to Firestore
 * 
 * @param {Object} feedbackData - Feedback data to create
 * @param {string} feedbackData.employeeName - Name of the employee
 * @param {number} feedbackData.score - Score (1-5)
 * @param {string} feedbackData.notes - Feedback notes
 * @param {Date|Timestamp} feedbackData.date - Date of feedback
 * @returns {Promise<string>} ID of the created feedback document
 * 
 * @example
 * const id = await createFeedback({
 *   employeeName: 'Jane Doe',
 *   score: 5,
 *   notes: 'Excellent work on the project!',
 *   date: new Date()
 * });
 */
export const createFeedback = async (feedbackData) => {
  try {
    // Validate feedback data
    const validation = validateFeedback(feedbackData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }
    
    // Prepare the data
    const dataToAdd = {
      employeeName: feedbackData.employeeName.trim(),
      score: parseInt(feedbackData.score, 10),
      notes: feedbackData.notes.trim(),
      date: feedbackData.date || getServerTimestamp(),
    };
    
    const feedbackId = await addDocument(COLLECTIONS.FEEDBACK, dataToAdd);
    console.log('Feedback created successfully:', feedbackId);
    return feedbackId;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error('Failed to create feedback');
  }
};

/**
 * Updates an existing feedback record
 * 
 * @param {string} feedbackId - ID of the feedback document
 * @param {Object} feedbackData - Updated feedback data
 * @returns {Promise<void>}
 * 
 * @example
 * await updateFeedback('abc123', { score: 4, notes: 'Updated notes' });
 */
export const updateFeedback = async (feedbackId, feedbackData) => {
  try {
    // Validate if provided
    if (feedbackData.employeeName || feedbackData.score || feedbackData.notes) {
      const currentFeedback = await getFeedbackById(feedbackId);
      const updatedFeedback = { ...currentFeedback, ...feedbackData };
      
      const validation = validateFeedback(updatedFeedback);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
      }
    }
    
    await updateDocument(COLLECTIONS.FEEDBACK, feedbackId, feedbackData);
    console.log('Feedback updated successfully:', feedbackId);
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Failed to update feedback');
  }
};

/**
 * Deletes a feedback record
 * 
 * @param {string} feedbackId - ID of the feedback document
 * @returns {Promise<void>}
 * 
 * @example
 * await deleteFeedback('abc123');
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    await deleteDocument(COLLECTIONS.FEEDBACK, feedbackId);
    console.log('Feedback deleted successfully:', feedbackId);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Failed to delete feedback');
  }
};

/**
 * Queries feedback by employee name
 * 
 * @param {string} employeeName - Name of the employee
 * @returns {Promise<Array>} Array of feedback for the specified employee
 * 
 * @example
 * const feedback = await getFeedbackByEmployee('Jane Doe');
 */
export const getFeedbackByEmployee = async (employeeName) => {
  try {
    return await queryDocuments(COLLECTIONS.FEEDBACK, {
      filters: [['employeeName', '==', employeeName]],
      orderByField: 'date',
      orderDirection: 'desc',
    });
  } catch (error) {
    console.error('Error fetching feedback by employee:', error);
    throw new Error('Failed to fetch employee feedback');
  }
};

/**
 * Queries feedback by score
 * 
 * @param {number} score - Score to filter by (1-5)
 * @returns {Promise<Array>} Array of feedback with the specified score
 * 
 * @example
 * const excellentFeedback = await getFeedbackByScore(5);
 */
export const getFeedbackByScore = async (score) => {
  try {
    return await queryDocuments(COLLECTIONS.FEEDBACK, {
      filters: [['score', '==', score]],
      orderByField: 'date',
      orderDirection: 'desc',
    });
  } catch (error) {
    console.error('Error fetching feedback by score:', error);
    throw new Error('Failed to fetch feedback by score');
  }
};

/**
 * Queries feedback within a date range
 * 
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of feedback within the date range
 * 
 * @example
 * const recentFeedback = await getFeedbackByDateRange(
 *   new Date('2025-01-01'),
 *   new Date('2025-12-31')
 * );
 */
export const getFeedbackByDateRange = async (startDate, endDate) => {
  try {
    return await queryDocuments(COLLECTIONS.FEEDBACK, {
      filters: [
        ['date', '>=', startDate],
        ['date', '<=', endDate],
      ],
      orderByField: 'date',
      orderDirection: 'desc',
    });
  } catch (error) {
    console.error('Error fetching feedback by date range:', error);
    throw new Error('Failed to fetch feedback by date range');
  }
};

/**
 * Sets up a real-time listener for feedback collection
 * Automatically updates when feedback data changes
 * 
 * @param {Function} callback - Callback function called with updated data
 * @returns {Function} Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeFeedback((feedback) => {
 *   console.log('Feedback updated:', feedback);
 *   setFeedbackData(feedback);
 * });
 * 
 * // Later: unsubscribe();
 */
export const subscribeFeedback = (callback) => {
  try {
    return subscribeToCollection(
      COLLECTIONS.FEEDBACK,
      (feedback) => {
        // Sort by date (newest first)
        const sortedFeedback = feedback.sort((a, b) => {
          const dateA = a.date?.toMillis ? a.date.toMillis() : 0;
          const dateB = b.date?.toMillis ? b.date.toMillis() : 0;
          return dateB - dateA;
        });
        
        callback(sortedFeedback);
      },
      {
        orderByField: 'date',
        orderDirection: 'desc',
      }
    );
  } catch (error) {
    console.error('Error subscribing to feedback:', error);
    throw new Error('Failed to subscribe to feedback updates');
  }
};

/**
 * Adds sample feedback data to Firestore
 * Useful for testing and development
 * 
 * @returns {Promise<void>}
 */
export const addSampleFeedback = async () => {
  try {
    const sampleData = [
      {
        employeeName: 'Alice Johnson',
        score: 5,
        notes: 'Excellent performance on the Q4 project. Demonstrated strong leadership skills and delivered ahead of schedule.',
        date: new Date('2025-10-15'),
      },
      {
        employeeName: 'Bob Smith',
        score: 4,
        notes: 'Good work on client presentations. Could improve on documentation practices.',
        date: new Date('2025-10-20'),
      },
      {
        employeeName: 'Carol Williams',
        score: 3,
        notes: 'Average performance. Meeting basic requirements but needs to show more initiative.',
        date: new Date('2025-10-22'),
      },
      {
        employeeName: 'David Brown',
        score: 5,
        notes: 'Outstanding problem-solving skills. Successfully resolved critical production issues.',
        date: new Date('2025-10-24'),
      },
      {
        employeeName: 'Alice Johnson',
        score: 4,
        notes: 'Continued strong performance. Great team collaboration.',
        date: new Date('2025-10-28'),
      },
    ];
    
    const collectionRef = getCollectionRef(COLLECTIONS.FEEDBACK);
    
    for (const data of sampleData) {
      await addDoc(collectionRef, data);
    }
    
    console.log('Sample feedback data added successfully');
  } catch (error) {
    console.error('Error adding sample feedback:', error);
    throw new Error('Failed to add sample feedback');
  }
};

