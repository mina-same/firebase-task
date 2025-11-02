/**
 * MessageBubble Component
 * Displays a single chat message (sent or received)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { formatMessageTime } from '../../../utils/dateFormatter';

/**
 * Message bubble component
 * 
 * @param {Object} message - Message object
 * @param {boolean} isSent - Whether message is sent by current user
 */
const MessageBubble = ({ message, isSent }) => {
  if (!message) return null;
  
  return (
    <View style={[
      styles.container,
      isSent ? styles.sentContainer : styles.receivedContainer
    ]}>
      <View style={[
        styles.bubble,
        isSent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.text,
          isSent ? styles.sentText : styles.receivedText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.time,
          isSent ? styles.sentTime : styles.receivedTime
        ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  sentBubble: {
    backgroundColor: COLORS.messageSent,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  receivedBubble: {
    backgroundColor: COLORS.messageReceived,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
  },
  sentText: {
    color: COLORS.messageSentText,
  },
  receivedText: {
    color: COLORS.messageReceivedText,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
  },
  sentTime: {
    color: COLORS.messageSentText,
    opacity: 0.8,
  },
  receivedTime: {
    color: COLORS.gray600,
  },
});

export default MessageBubble;

