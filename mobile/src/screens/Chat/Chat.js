/**
 * Chat Screen
 * 
 * Displays messages and allows sending new messages
 * Shows conversation with HR personnel
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

// Import Firebase hook
import useChat from '../../hooks/useChat';

import MessageBubble from '../../components/common/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import Loading from '../../components/common/Loading';
import { COLORS, SPACING, TYPOGRAPHY } from '../../config/theme';
import { getMessageDateLabel } from '../../utils/dateFormatter';
import { truncateString } from '../../utils/helpers';

/**
 * Chat Screen Component
 * 
 * Shows messages in a conversation with HR
 * Allows employee to send messages
 */
const ChatScreen = () => {
  const route = useRoute();
  const flatListRef = useRef(null);
  
  // Get employee info from navigation params
  const conversationId = route.params?.conversationId;
  const employeeName = route.params?.employeeName;
  
  // Fetch messages using Firebase
  const {
    messages,
    loading,
    error,
    sendingMessage,
    sendChatMessage,
    isSentMessage,
  } = useChat({
    employeeId: conversationId,
    realtime: true,
  });
  
  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Small delay to ensure list is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  /**
   * Handles message send
   */
  const handleSendMessage = async (messageText) => {
    try {
      await sendChatMessage(messageText);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  /**
   * Groups messages by date for date separators
   * Adds date labels between messages from different days
   */
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach((message) => {
      const messageDate = getMessageDateLabel(message.timestamp);
      
      // Add date separator if date changed
      if (messageDate !== currentDate && messageDate) {
        groups.push({ type: 'date', date: messageDate });
        currentDate = messageDate;
      }
      
      // Add message
      groups.push({ type: 'message', message });
    });
    
    return groups;
  };
  
  /**
   * Renders list item (message or date separator)
   */
  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{item.date}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }
    
    return (
      <MessageBubble
        message={item.message}
        isSent={isSentMessage(item.message)}
      />
    );
  };
  
  /**
   * Renders empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptyText}>
        Start the conversation by sending a message to {employeeName || 'HR'}.
      </Text>
    </View>
  );
  
  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Loading message="Loading messages..." />
    </View>
  );
  
  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
  
  const groupedItems = groupMessagesByDate();
  
  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderLoading()}
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderError()}
      </SafeAreaView>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={groupedItems}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'date' ? `date-${item.date}` : item.message.id
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            groupedItems.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          inverted={false}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!conversationId}
            loading={sendingMessage}
            placeholder={(() => {
              const name = employeeName || 'HR';
              // Truncate name to max 15 characters, then add "..." at the end
              const maxNameLength = 15;
              if (name.length > maxNameLength) {
                return `Message ${name.substring(0, maxNameLength)}...`;
              }
              return `Message ${name}...`;
            })()}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: SPACING.lg,
  },
  inputContainer: {
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    textAlign: 'center',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
  dateSeparatorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginHorizontal: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default ChatScreen;

