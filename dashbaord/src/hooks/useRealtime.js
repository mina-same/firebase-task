/**
 * useRealtime Hook
 * 
 * Generic custom hook for setting up real-time Firestore listeners
 * Provides a reusable pattern for any real-time data needs
 * 
 * @module hooks/useRealtime
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeToCollection, subscribeToSubcollection } from '../services/firestoreService';
import { LOADING_STATES } from '../config/constants';

/**
 * Custom hook for real-time Firestore data
 * 
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Enable the listener (default: true)
 * @param {Object} options.queryOptions - Query options for filtering and sorting
 * @param {Function} options.onData - Callback when data updates
 * @param {Function} options.onError - Callback when error occurs
 * @returns {Object} Real-time data state
 * 
 * @example
 * const { data, loading, error } = useRealtime('feedback', {
 *   queryOptions: { orderByField: 'date', orderDirection: 'desc' }
 * });
 */
export const useRealtime = (collectionName, options = {}) => {
  const {
    enabled = true,
    queryOptions = {},
    onData,
    onError,
  } = options;
  
  const [data, setData] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!enabled || !collectionName) {
      return;
    }
    
    setLoadingState(LOADING_STATES.LOADING);
    setError(null);
    
    try {
      const unsubscribe = subscribeToCollection(
        collectionName,
        (updatedData) => {
          setData(updatedData);
          setLoadingState(LOADING_STATES.SUCCESS);
          
          if (onData) {
            onData(updatedData);
          }
        },
        queryOptions
      );
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error(`Error setting up real-time listener for ${collectionName}:`, err);
      const errorMessage = err.message || 'Failed to set up real-time listener';
      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      
      if (onError) {
        onError(err);
      }
    }
  }, [collectionName, enabled, JSON.stringify(queryOptions), onData, onError]);
  
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  return {
    data,
    loading: isLoading,
    error,
    isLoading,
    isError,
    isSuccess,
    loadingState,
  };
};

/**
 * Custom hook for real-time Firestore subcollection data
 * 
 * @param {string} parentCollection - Name of the parent collection
 * @param {string} parentDocId - ID of the parent document
 * @param {string} subCollection - Name of the subcollection
 * @param {Object} options - Hook options
 * @returns {Object} Real-time data state
 * 
 * @example
 * const { data: messages, loading } = useRealtimeSubcollection(
 *   'conversations', 'emp_jane_doe', 'messages',
 *   { queryOptions: { orderByField: 'timestamp' } }
 * );
 */
export const useRealtimeSubcollection = (
  parentCollection,
  parentDocId,
  subCollection,
  options = {}
) => {
  const {
    enabled = true,
    queryOptions = {},
    onData,
    onError,
  } = options;
  
  const [data, setData] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!enabled || !parentCollection || !parentDocId || !subCollection) {
      return;
    }
    
    setLoadingState(LOADING_STATES.LOADING);
    setError(null);
    
    try {
      const unsubscribe = subscribeToSubcollection(
        parentCollection,
        parentDocId,
        subCollection,
        (updatedData) => {
          setData(updatedData);
          setLoadingState(LOADING_STATES.SUCCESS);
          
          if (onData) {
            onData(updatedData);
          }
        },
        queryOptions
      );
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error(
        `Error setting up real-time listener for ${parentCollection}/${parentDocId}/${subCollection}:`,
        err
      );
      const errorMessage = err.message || 'Failed to set up real-time listener';
      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      
      if (onError) {
        onError(err);
      }
    }
  }, [
    parentCollection,
    parentDocId,
    subCollection,
    enabled,
    JSON.stringify(queryOptions),
    onData,
    onError,
  ]);
  
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  return {
    data,
    loading: isLoading,
    error,
    isLoading,
    isError,
    isSuccess,
    loadingState,
  };
};

/**
 * Custom hook for managing multiple real-time listeners
 * Useful when you need to listen to multiple collections simultaneously
 * 
 * @param {Array} listeners - Array of listener configurations
 * @returns {Object} Combined state for all listeners
 * 
 * @example
 * const { data, loading, error } = useMultipleRealtime([
 *   { collection: 'feedback', key: 'feedback' },
 *   { collection: 'conversations', key: 'conversations' }
 * ]);
 */
export const useMultipleRealtime = (listeners = []) => {
  const [combinedData, setCombinedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const updateData = useCallback((key, data) => {
    setCombinedData((prev) => ({ ...prev, [key]: data }));
  }, []);
  
  const updateError = useCallback((key, error) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, []);
  
  useEffect(() => {
    if (listeners.length === 0) {
      setLoading(false);
      return;
    }
    
    const unsubscribers = [];
    let loadedCount = 0;
    
    listeners.forEach(({ collection, key, queryOptions = {} }) => {
      try {
        const unsubscribe = subscribeToCollection(
          collection,
          (data) => {
            updateData(key, data);
            loadedCount++;
            
            if (loadedCount === listeners.length) {
              setLoading(false);
            }
          },
          queryOptions
        );
        
        unsubscribers.push(unsubscribe);
      } catch (err) {
        console.error(`Error setting up listener for ${collection}:`, err);
        updateError(key, err.message);
      }
    });
    
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [listeners, updateData, updateError]);
  
  return {
    data: combinedData,
    loading,
    errors,
    hasErrors: Object.keys(errors).length > 0,
  };
};

export default useRealtime;

