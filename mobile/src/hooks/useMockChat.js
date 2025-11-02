/**
 * useMockChat Hook
 * Mock version for development without Firebase
 * 
 * Provides same interface as useChat but with fake data
 */

import { useState, useEffect, useCallback } from 'react';
import { mockMessages, delay } from '../data/mockData';
import { LOADING_STATES, HR_USER, MESSAGE_TYPES } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

const useMockChat = (options = {}) => {
  const { employeeId, realtime = true, autoFetch = true } = options;
  
  const [messages, setMessages] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  const getCurrentEmployeeId = useCallback(async () => {
    try {
      const storedId = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_ID);
      if (storedId) {
        setCurrentEmployeeId(storedId);
        return storedId;
      }
      if (employeeId) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, employeeId);
        setCurrentEmployeeId(employeeId);
        return employeeId;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, [employeeId]);
  
  const fetchMessages = useCallback(async (empId) => {
    if (!empId) return;
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      await delay(500);
      const data = mockMessages[empId] || [];
      setMessages(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  const sendChatMessage = useCallback(async (messageText) => {
    const empId = await getCurrentEmployeeId();
    if (!empId) throw new Error('Employee ID not found');
    
    try {
      setSendingMessage(true);
      await delay(500);
      
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: empId,
        text: messageText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setSendingMessage(false);
      return newMessage.id;
    } catch (err) {
      setSendingMessage(false);
      throw err;
    }
  }, [getCurrentEmployeeId]);
  
  useEffect(() => {
    getCurrentEmployeeId().then((empId) => {
      if (!empId || !autoFetch) return;
      if (realtime) {
        fetchMessages(empId);
        // Simulate real-time by checking every 2 seconds
        const interval = setInterval(() => {
          fetchMessages(empId);
        }, 2000);
        return () => clearInterval(interval);
      } else {
        fetchMessages(empId);
      }
    });
  }, [employeeId, realtime, autoFetch, getCurrentEmployeeId, fetchMessages]);
  
  const isHRMessage = useCallback((message) => {
    return message.senderId === HR_USER.ID;
  }, []);
  
  const isSentMessage = useCallback((message) => {
    return message.senderId === currentEmployeeId;
  }, [currentEmployeeId]);
  
  const getMessageType = useCallback((message) => {
    return isSentMessage(message) ? MESSAGE_TYPES.SENT : MESSAGE_TYPES.RECEIVED;
  }, [isSentMessage]);
  
  return {
    messages,
    messagesCount: messages.length,
    currentEmployeeId,
    loading: loadingState === LOADING_STATES.LOADING,
    isLoading: loadingState === LOADING_STATES.LOADING,
    isError: loadingState === LOADING_STATES.ERROR,
    isSuccess: loadingState === LOADING_STATES.SUCCESS,
    loadingState,
    error,
    sendingMessage,
    sendChatMessage,
    fetchMessages,
    isHRMessage,
    isSentMessage,
    getMessageType,
    refreshMessages: () => getCurrentEmployeeId().then(fetchMessages),
  };
};

export default useMockChat;

