/**
 * useMockFeedback Hook
 * 
 * Mock version of useFeedback hook for development without Firebase
 * Provides fake data and simulates Firebase behavior
 * 
 * @module hooks/useMockFeedback
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockFeedback, delay } from '../data/mockData';
import { LOADING_STATES } from '../config/constants';

/**
 * Custom hook for mock feedback management
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.realtime - Enable simulated real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch data on mount (default: true)
 * @returns {Object} Feedback state and methods
 */
const useMockFeedback = (options = {}) => {
  const { realtime = true, autoFetch = true } = options;
  
  // State management
  const [feedback, setFeedback] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  /**
   * Fetches mock feedback data
   */
  const fetchFeedback = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      // Simulate network delay
      await delay(800);
      
      setFeedback(mockFeedback);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('Error fetching mock feedback:', err);
      setError(err.message || 'Failed to load feedback');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Adds a new feedback entry (simulated)
   */
  const addFeedback = useCallback(async (feedbackData) => {
    try {
      await delay(500);
      
      const newFeedback = {
        id: `feedback_${Date.now()}`,
        date: new Date(),
        ...feedbackData,
      };
      
      setFeedback(prev => [newFeedback, ...prev]);
      return newFeedback.id;
    } catch (err) {
      console.error('Error adding feedback:', err);
      throw err;
    }
  }, []);
  
  /**
   * Updates an existing feedback entry (simulated)
   */
  const editFeedback = useCallback(async (feedbackId, feedbackData) => {
    try {
      await delay(500);
      
      setFeedback(prev =>
        prev.map(item =>
          item.id === feedbackId ? { ...item, ...feedbackData } : item
        )
      );
    } catch (err) {
      console.error('Error updating feedback:', err);
      throw err;
    }
  }, []);
  
  /**
   * Deletes a feedback entry (simulated)
   */
  const removeFeedback = useCallback(async (feedbackId) => {
    try {
      await delay(500);
      
      setFeedback(prev => prev.filter(item => item.id !== feedbackId));
    } catch (err) {
      console.error('Error deleting feedback:', err);
      throw err;
    }
  }, []);
  
  /**
   * Gets a single feedback entry by ID (simulated)
   */
  const getFeedback = useCallback(async (feedbackId) => {
    try {
      await delay(300);
      return mockFeedback.find(item => item.id === feedbackId);
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
  
  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch) {
      fetchFeedback();
    }
  }, [autoFetch, fetchFeedback]);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  const feedbackCount = useMemo(() => feedback.length, [feedback]);
  
  const averageScore = useMemo(() => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + (item.score || 0), 0);
    return Math.round((sum / feedback.length) * 100) / 100;
  }, [feedback]);
  
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

export default useMockFeedback;

