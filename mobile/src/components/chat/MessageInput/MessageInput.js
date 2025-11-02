/**
 * MessageInput Component
 * Input field for composing and sending messages
 * Includes send button and handles keyboard
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Modal, Text, Alert, Platform, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, LAYOUT } from '../../../config/theme';
import { validateMessage } from '../../../utils/helpers';

/**
 * Message input component
 * 
 * @param {Function} onSendMessage - Called when user sends message
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} loading - Whether message is being sent
 * @param {string} placeholder - Placeholder text
 */
const MessageInput = ({
  onSendMessage,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Smileys & People');
  
  // Animation values for icons
  const attachIconOpacity = useRef(new Animated.Value(1)).current;
  const attachIconScale = useRef(new Animated.Value(1)).current;
  const emojiIconOpacity = useRef(new Animated.Value(1)).current;
  const emojiIconScale = useRef(new Animated.Value(1)).current;
  
  // Animate icons when typing starts/stops
  useEffect(() => {
    const isTyping = message.trim().length > 0;
    
    // Animate attach icon
    Animated.parallel([
      Animated.timing(attachIconOpacity, {
        toValue: isTyping ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(attachIconScale, {
        toValue: isTyping ? 0 : 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate emoji icon
    Animated.parallel([
      Animated.timing(emojiIconOpacity, {
        toValue: isTyping ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(emojiIconScale, {
        toValue: isTyping ? 0 : 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [message]);
  
  /**
   * Request permissions for camera and media library
   */
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera and photo library permissions to attach images.');
        return false;
      }
    }
    return true;
  };

  /**
   * Handles picking image from camera
   */
  const handlePickImageFromCamera = async () => {
    setShowAttachmentMenu(false);
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // TODO: Upload image and send with message
        console.log('Image selected:', asset.uri);
        Alert.alert('Image Selected', `Image: ${asset.fileName || 'Camera Image'}`);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to pick image from camera.');
    }
  };

  /**
   * Handles picking image from gallery
   */
  const handlePickImageFromGallery = async () => {
    setShowAttachmentMenu(false);
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // TODO: Upload image and send with message
        console.log('Image selected:', asset.uri);
        Alert.alert('Image Selected', `Image: ${asset.fileName || 'Gallery Image'}`);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  /**
   * Handles picking document/file
   */
  const handlePickDocument = async () => {
    setShowAttachmentMenu(false);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // TODO: Upload file and send with message
        console.log('File selected:', asset.uri);
        Alert.alert('File Selected', `File: ${asset.name}`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  /**
   * Handles attachment button press - shows menu
   */
  const handleAttach = () => {
    setShowAttachmentMenu(true);
  };

  /**
   * Handles message send
   */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    // Validate message
    const validation = validateMessage(trimmedMessage);
    if (!validation.isValid || disabled || loading) {
      return;
    }
    
    try {
      await onSendMessage(trimmedMessage);
      setMessage(''); // Clear input
      Keyboard.dismiss(); // Hide keyboard
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const canSend = message.trim().length > 0 && !disabled && !loading;
  
  /**
   * Emoji categories with full emoji list (system-like)
   */
  const emojiCategories = {
    'Smileys & People': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤐', '😌', '😔',
      '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '😎', '🤓', '🧐', '🤠', '😕', '😟', '🙁', '☹️', '😮',
      '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
      '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
      '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
      '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
    ],
    'Gestures & Body': [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌',
      '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
      '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋',
    ],
    'Hearts & Emotions': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    ],
    'Objects & Symbols': [
      '🔥', '💧', '⚡', '☄️', '❄️', '⭐', '🌟', '💫', '✨', '💥',
      '💢', '💯', '💢', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱',
      '🖲', '🕹', '🗜', '💾', '💿', '📀', '📼', '📷', '📸', '📹',
    ],
  };

  /**
   * Handles emoji button press - shows emoji picker
   */
  const handleEmoji = () => {
    setShowEmojiPicker(true);
  };

  /**
   * Handles emoji selection
   */
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Emoji Picker Modal - System-like */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Emoji</Text>
              <TouchableOpacity
                onPress={() => setShowEmojiPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={styles.emojiCategoryTabs}>
              {Object.keys(emojiCategories).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedEmojiCategory === category && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedEmojiCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedEmojiCategory === category && styles.categoryTabTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Emoji Grid - Scrollable */}
            <ScrollView
              style={styles.emojiScrollContainer}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            >
              {emojiCategories[selectedEmojiCategory]?.map((emoji, index) => (
                <View key={`${selectedEmojiCategory}-${index}`} style={styles.emojiItemWrapper}>
                  <TouchableOpacity
                    style={styles.emojiItem}
                    onPress={() => handleEmojiSelect(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePickImageFromCamera}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePickImageFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>Photo Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePickDocument}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="document-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>File</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.inputContainer}>
        {/* Attach Button (+ icon) - Animated */}
        {message.trim().length === 0 && (
          <Animated.View
            style={[
              styles.iconButtonContainer,
              {
                opacity: attachIconOpacity,
                transform: [{ scale: attachIconScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleAttach}
              disabled={disabled || loading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Emoji Button - Animated */}
        {message.trim().length === 0 && (
          <Animated.View
            style={[
              styles.iconButtonContainer,
              {
                opacity: emojiIconOpacity,
                transform: [{ scale: emojiIconScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleEmoji}
              disabled={disabled || loading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="happy-outline"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          multiline
          maxLength={1000}
          editable={!disabled && !loading}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          textAlignVertical="center"
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {loading ? (
            <Ionicons name="hourglass-outline" size={20} color={COLORS.gray400} />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={canSend ? COLORS.white : COLORS.gray400}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray900,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: SPACING.sm,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: TYPOGRAPHY.fontSize.base * 1.2,
  },
  iconButtonContainer: {
    marginRight: SPACING.xs,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  attachmentMenu: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray900,
  },
  emojiPickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 0,
    marginBottom: 0,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  emojiPickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  emojiCategoryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  categoryTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray600,
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emojiScrollContainer: {
    maxHeight: 300,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiItemWrapper: {
    width: '12.5%',
    aspectRatio: 1,
    padding: SPACING.xs / 2,
  },
  emojiItem: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  emojiText: {
    fontSize: 32,
  },
});

export default MessageInput;

