/**
 * App Component - Root Component
 * 
 * Main entry point for the React Native app
 * Sets up navigation and initial configuration
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import constants
import { STORAGE_KEYS } from './src/config/constants';

/**
 * App Component
 * 
 * Sets up navigation and initializes app
 * Sets default employee ID for testing (can be removed later)
 */
export default function App() {
  /**
   * Initialize default employee ID for testing
   * In production, this would be set after user login/selection
   */
  useEffect(() => {
    const initializeEmployeeId = async () => {
      try {
        // Check if employee ID already exists
        const existingId = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_ID);
        
        // If no employee ID set, set a default one for testing
        if (!existingId) {
          // Default employee for testing
          await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, 'emp_alice_johnson');
          await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, 'Alice Johnson');
          console.log('✅ Default employee ID set for testing');
        }
      } catch (error) {
        console.error('Error initializing employee ID:', error);
      }
    };
    
    initializeEmployeeId();
  }, []);
  
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
