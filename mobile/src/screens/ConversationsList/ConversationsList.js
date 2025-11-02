/**
 * Conversations List Screen
 * 
 * Displays list of all conversations
 * Tap on a conversation to navigate to Chat screen
 */

import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Import Firebase hook
import useConversations from '../../hooks/useConversations';

import ConversationItem from '../../components/chat/ConversationItem';
import Loading from '../../components/common/Loading';
import { COLORS, SPACING, TYPOGRAPHY } from '../../config/theme';
import { ROUTES } from '../../config/constants';

/**
 * Conversations List Screen Component
 * 
 * Shows all conversations where the employee is a participant
 */
const ConversationsListScreen = () => {
  const navigation = useNavigation();
  
  // Fetch conversations using Firebase
  const {
    conversations,
    loading,
    error,
    refreshConversations,
  } = useConversations({ realtime: true });
  
  /**
   * Handles conversation item press
   * Navigates to Chat screen with employee info
   * 
   * @param {Object} conversation - Conversation object
   */
  const handleConversationPress = (conversation) => {
    navigation.navigate(ROUTES.CHAT, {
      conversationId: conversation.id,
      employeeName: conversation.employeeName,
    });
  };
  
  /**
   * Renders conversation item
   */
  const renderConversationItem = ({ item }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );
  
  /**
   * Renders empty state when no conversations
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Conversations</Text>
      <Text style={styles.emptyText}>
        Your conversations will appear here once you start chatting with HR.
      </Text>
    </View>
  );
  
  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={refreshConversations}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderError()}
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading && conversations.length === 0 ? (
        <Loading message="Loading conversations..." />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshConversations}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyListContainer : styles.listContentContainer
          }
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingTop: 0,
    paddingBottom: 0,
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
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    textAlign: 'center',
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
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default ConversationsListScreen;

