/**
 * useFeedback Hook
 * 
 * Custom React hook for managing feedback data
 * Provides real-time updates and CRUD operations for feedback
 * 
 * @module hooks/useFeedback
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  subscribeFeedback,
} from '../services/feedbackService';
import { LOADING_STATES } from '../config/constants';

/**
 * Custom hook for feedback management
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch data on mount (default: true)
 * @returns {Object} Feedback state and methods
 * 
 * @example
 * const {
 *   feedback,
 *   loading,
 *   error,
 *   refreshFeedback,
 *   addFeedback,
 * } = useFeedback({ realtime: true });
 */
const useFeedback = (options = {}) => {
  const { realtime = true, autoFetch = true } = options;
  
  // State management
  const [feedback, setFeedback] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  /**
   * Fetches all feedback data from Firestore
   */
  const fetchFeedback = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      const data = await getAllFeedback();
      setFeedback(data);
      
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message || 'Failed to load feedback');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Adds a new feedback entry
   * 
   * @param {Object} feedbackData - Feedback data to add
   * @returns {Promise<string>} ID of the created feedback
   */
  const addFeedback = useCallback(async (feedbackData) => {
    try {
      const feedbackId = await createFeedback(feedbackData);
      
      // If not using realtime, manually refresh
      if (!realtime) {
        await fetchFeedback();
      }
      
      return feedbackId;
    } catch (err) {
      console.error('Error adding feedback:', err);
      throw err;
    }
  }, [realtime, fetchFeedback]);
  
  /**
   * Updates an existing feedback entry
   * 
   * @param {string} feedbackId - ID of the feedback to update
   * @param {Object} feedbackData - Updated feedback data
   */
  const editFeedback = useCallback(async (feedbackId, feedbackData) => {
    try {
      await updateFeedback(feedbackId, feedbackData);
      
      // If not using realtime, manually refresh
      if (!realtime) {
        await fetchFeedback();
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
      throw err;
    }
  }, [realtime, fetchFeedback]);
  
  /**
   * Deletes a feedback entry
   * 
   * @param {string} feedbackId - ID of the feedback to delete
   */
  const removeFeedback = useCallback(async (feedbackId) => {
    try {
      await deleteFeedback(feedbackId);
      
      // If not using realtime, manually refresh
      if (!realtime) {
        await fetchFeedback();
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      throw err;
    }
  }, [realtime, fetchFeedback]);
  
  /**
   * Gets a single feedback entry by ID
   * 
   * @param {string} feedbackId - ID of the feedback
   * @returns {Promise<Object>} Feedback object
   */
  const getFeedback = useCallback(async (feedbackId) => {
    try {
      return await getFeedbackById(feedbackId);
    } catch (err) {
      console.error('Error getting feedback:', err);
      throw err;
    }
  }, []);
  
  /**
   * Refreshes feedback data
   */
  const refreshFeedback = useCallback(() => {
    fetchFeedback();
  }, [fetchFeedback]);
  
  // Set up real-time listener or fetch data once
  useEffect(() => {
    if (!autoFetch) return;
    
    let unsubscribe;
    
    if (realtime) {
      // Set up real-time listener
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      try {
        unsubscribe = subscribeFeedback((data) => {
          setFeedback(data);
          setLoadingState(LOADING_STATES.SUCCESS);
        });
      } catch (err) {
        console.error('Error setting up feedback listener:', err);
        setError(err.message || 'Failed to subscribe to feedback updates');
        setLoadingState(LOADING_STATES.ERROR);
      }
    } else {
      // Fetch data once
      fetchFeedback();
    }
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realtime, autoFetch, fetchFeedback]);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  /**
   * Total count of feedback entries
   */
  const feedbackCount = useMemo(() => feedback.length, [feedback]);
  
  /**
   * Average score across all feedback
   */
  const averageScore = useMemo(() => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + (item.score || 0), 0);
    return Math.round((sum / feedback.length) * 100) / 100;
  }, [feedback]);
  
  /**
   * Score distribution (count per score value)
   */
  const scoreDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach((item) => {
      if (item.score >= 1 && item.score <= 5) {
        distribution[item.score]++;
      }
    });
    return distribution;
  }, [feedback]);
  
  return {
    // Data
    feedback,
    feedbackCount,
    averageScore,
    scoreDistribution,
    
    // Loading states
    loading: isLoading,
    error,
    isLoading,
    isError,
    isSuccess,
    loadingState,
    
    // Methods
    refreshFeedback,
    fetchFeedback,
    addFeedback,
    editFeedback,
    removeFeedback,
    getFeedback,
  };
};

export default useFeedback;

