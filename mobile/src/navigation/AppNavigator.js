/**
 * App Navigator - Main Navigation Setup
 * 
 * Configures React Navigation stack navigator
 * Defines routes: Conversations List → Chat Screen
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ConversationsListScreen from '../screens/ConversationsList/ConversationsList';
import ChatScreen from '../screens/Chat/Chat';

// Import constants and theme
import { ROUTES } from '../config/constants';
import { COLORS } from '../config/theme';

/**
 * Stack Navigator
 * Creates a stack of screens with navigation
 */
const Stack = createNativeStackNavigator();

/**
 * App Navigator Component
 * 
 * Wraps the app with NavigationContainer and defines all routes
 * 
 * Navigation Flow:
 * 1. ConversationsList (initial screen)
 * 2. Chat (pushed on top when user taps a conversation)
 * 
 * @returns {JSX.Element} Navigation container with stack navigator
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.CONVERSATIONS_LIST}
        screenOptions={{
          // Default header styling for all screens
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: COLORS.primary,
          },
          // Animation style
          animation: 'slide_from_right',
        }}
      >
        {/* Conversations List Screen */}
        <Stack.Screen
          name={ROUTES.CONVERSATIONS_LIST}
          component={ConversationsListScreen}
          options={{
            title: 'Conversations',
            headerBackTitleVisible: false, // Hide back button text on iOS
            headerShadowVisible: false, // Remove header shadow/line
          }}
        />
        
        {/* Chat Screen */}
        <Stack.Screen
          name={ROUTES.CHAT}
          component={ChatScreen}
          options={({ route }) => ({
            // Dynamic title based on employee name from route params
            title: route.params?.employeeName || 'Chat',
            headerBackTitleVisible: false,
            headerShadowVisible: false, // Remove header shadow/line
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

