/**
 * ConversationItem Component
 * Displays one conversation in the list
 * Shows: HR name (first participant), last message preview, timestamp
 * For mobile: conversation name is the HR name (first participant in participantNames array)
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { formatConversationTime } from '../../../utils/dateFormatter';
import { truncateString, getInitials } from '../../../utils/helpers';

/**
 * Avatar color palette - different colors for different conversations
 */
const avatarColors = [
  COLORS.primary,           // #01002C
  '#2563EB',               // Blue
  '#7C3AED',               // Purple
  '#059669',               // Green
  '#DC2626',               // Red
  '#EA580C',               // Orange
  '#0891B2',               // Cyan
  '#BE185D',               // Pink
  '#9333EA',               // Violet
  '#CA8A04',               // Amber
];

/**
 * Gets avatar color based on conversation ID
 * Ensures same conversation always gets same color
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {string} Color for avatar
 */
const getAvatarColor = (conversationId) => {
  if (!conversationId) return avatarColors[0];
  
  // Simple hash function to get consistent color per conversation
  let hash = 0;
  for (let i = 0; i < conversationId.length; i++) {
    hash = conversationId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

/**
 * Conversation item component
 * 
 * @param {Object} conversation - Conversation object
 * @param {Function} onPress - Called when item is pressed
 */
const ConversationItem = ({ conversation, onPress }) => {
  if (!conversation) return null;
  
  /**
   * Gets the conversation name (HR name - first participant)
   * 
   * Handles cases where participantNames might be:
   * 1. A proper array: ["Sarah Connor (HR)", "Alice Johnson"]
   * 2. A string representation: "["Sarah Connor (HR)", "Alice Johnson"]"
   * 3. An array where first element is a string: ["["Sarah Connor (HR)", "Alice Johnson"]", ...]
   * 
   * Always extracts the first participant name (HR name) from participantNames.
   * 
   * @returns {string} HR name (first participant)
   */
  const getConversationName = () => {
    // If employeeName is already a string and looks correct, use it
    if (typeof conversation.employeeName === 'string' && conversation.employeeName !== '') {
      // Double-check it's not the array representation
      if (!conversation.employeeName.startsWith('[') && !conversation.employeeName.includes('", "')) {
        return conversation.employeeName;
      }
    }
    
    // Extract from participantNames array (first participant = HR name)
    if (conversation.participantNames) {
      // Case 1: participantNames is a proper array
      if (Array.isArray(conversation.participantNames) && conversation.participantNames.length > 0) {
        const firstElement = conversation.participantNames[0];
        
        // Case 3: First element is a string representation of an array
        // e.g., participantNames[0] = "["Sarah Connor (HR)", "Alice Johnson"]"
        if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
          try {
            const parsed = JSON.parse(firstElement);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0]; // Return first name: "Sarah Connor (HR)"
            }
          } catch (e) {
            console.warn('Failed to parse participantNames string:', e);
          }
        }
        
        // First element is already a valid string name
        if (typeof firstElement === 'string') {
          return firstElement;
        }
      }
      
      // Case 2: participantNames is a string representation of an array
      if (typeof conversation.participantNames === 'string' && conversation.participantNames.startsWith('[')) {
        try {
          const parsed = JSON.parse(conversation.participantNames);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0]; // Return first name: "Sarah Connor (HR)"
          }
        } catch (e) {
          console.warn('Failed to parse participantNames string:', e);
        }
      }
    }
    
    // Fallback: use employeeName if it's a string
    if (typeof conversation.employeeName === 'string') {
      return conversation.employeeName;
    }
    
    // Last resort fallback
    return 'Conversation';
  };
  
  const conversationName = getConversationName();
  
  // Get unique avatar color for this conversation
  const avatarColor = useMemo(
    () => getAvatarColor(conversation.id),
    [conversation.id]
  );
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>
          {getInitials(conversationName)}
        </Text>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversationName}
          </Text>
          {conversation.lastMessageTimestamp && (
            <Text style={styles.time}>
              {formatConversationTime(conversation.lastMessageTimestamp)}
            </Text>
          )}
        </View>
        
        {/* Last Message Preview */}
        {conversation.lastMessage && (() => {
          /**
           * Gets the sender prefix for the last message
           * 
           * For mobile:
           * - If senderId = second participant (employee name) → show "You:"
           * - If senderId = first participant (HR name) → show HR name
           * 
           * @returns {string} Prefix to show before message (e.g., "You:" or "Sarah Connor (HR):")
           */
          const getLastMessagePrefix = () => {
            if (!conversation.lastMessageSenderId || !conversation.participantNames) {
              return '';
            }
            
            let namesArray = [];
            
            // Parse participantNames to get the array
            if (Array.isArray(conversation.participantNames) && conversation.participantNames.length > 0) {
              const firstElement = conversation.participantNames[0];
              
              // Case: First element is a string representation of an array
              if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
                try {
                  const parsed = JSON.parse(firstElement);
                  if (Array.isArray(parsed)) {
                    namesArray = parsed;
                  } else {
                    namesArray = conversation.participantNames;
                  }
                } catch (e) {
                  namesArray = conversation.participantNames;
                }
              } else {
                namesArray = conversation.participantNames;
              }
            } else if (typeof conversation.participantNames === 'string' && conversation.participantNames.startsWith('[')) {
              try {
                const parsed = JSON.parse(conversation.participantNames);
                if (Array.isArray(parsed)) {
                  namesArray = parsed;
                }
              } catch (e) {
                // Ignore
              }
            }
            
            if (namesArray.length >= 2) {
              const hrName = namesArray[0]; // First participant (HR name)
              const employeeName = namesArray[1]; // Second participant (employee name)
              
              // If senderId equals employee name (second participant), show "You:"
              if (conversation.lastMessageSenderId === employeeName) {
                return 'You: ';
              }
              
              // If senderId equals HR name (first participant), show HR name
              if (conversation.lastMessageSenderId === hrName) {
                return `${truncateString(hrName, 15)}: `;
              }
            }
            
            return '';
          };
          
          const prefix = getLastMessagePrefix();
          const displayMessage = prefix + conversation.lastMessage;
          
          return (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {truncateString(displayMessage, 50)}
            </Text>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    flex: 1,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginLeft: SPACING.sm,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
});

export default ConversationItem;

