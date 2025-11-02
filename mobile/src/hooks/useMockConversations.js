/**
 * useMockConversations Hook
 * Mock version for development without Firebase
 * 
 * Provides same interface as useConversations but with fake data
 */

import { useState, useEffect, useCallback } from 'react';
import { mockConversations, delay } from '../data/mockData';
import { LOADING_STATES, HR_USER } from '../config/constants';

const useMockConversations = (options = {}) => {
  const { realtime = true, autoFetch = true } = options;
  
  const [conversations, setConversations] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      await delay(600);
      setConversations(mockConversations);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  const refreshConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  useEffect(() => {
    if (!autoFetch) return;
    fetchConversations();
  }, [autoFetch, fetchConversations]);
  
  const getEmployeeNameFromConversation = useCallback((conversation) => {
    if (!conversation?.participantNames) return '';
    return conversation.participantNames.find(name => name !== HR_USER.NAME) || '';
  }, []);
  
  const processedConversations = conversations.map((conv) => ({
    id: conv.id,
    employeeName: getEmployeeNameFromConversation(conv),
    lastMessage: conv.lastMessage || '',
    lastMessageTimestamp: conv.lastMessageTimestamp,
    participantNames: conv.participantNames || [],
  }));
  
  return {
    conversations: processedConversations,
    conversationsCount: processedConversations.length,
    loading: loadingState === LOADING_STATES.LOADING,
    isLoading: loadingState === LOADING_STATES.LOADING,
    isError: loadingState === LOADING_STATES.ERROR,
    isSuccess: loadingState === LOADING_STATES.SUCCESS,
    loadingState,
    error,
    refreshConversations,
    fetchConversations,
    getEmployeeNameFromConversation,
  };
};

export default useMockConversations;

