/**
 * InterviewInput.tsx
 *
 * Multiline text input bar for the interview chat screen.
 *
 * Features:
 *  - Grows vertically up to a max height
 *  - Disabled while AI is responding (isLoading)
 *  - Send button shows spinner when loading
 *  - Guards against duplicate / empty submissions via useRef flag
 *  - Accessible labels throughout
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InterviewInputProps {
  /** Called with the trimmed message when the user taps Send. */
  onSend: (message: string) => void;
  /** When true, the input and send button are disabled. */
  isLoading: boolean;
  /** Optional placeholder text. */
  placeholder?: string;
}

// ─── Send Icon ────────────────────────────────────────────────────────────────
// Unicode arrow chevron — no third-party icon library required.
// Swap with <Ionicons name="send" /> etc. if you add @expo/vector-icons.

function SendIcon({ active }: { active: boolean }) {
  return (
    <Text
      style={[styles.sendIconText, active ? styles.sendIconActive : styles.sendIconInactive]}
      accessible={false}
    >
      ➤
    </Text>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InterviewInput = React.memo(function InterviewInput({
  onSend,
  isLoading,
  placeholder = 'Type your answer…',
}: InterviewInputProps) {
  const [text, setText] = useState('');
  const isSubmitting = useRef(false); // guards duplicate taps
  const [sendScale] = useState(() => new Animated.Value(1));

  const canSend = text.trim().length > 0 && !isLoading;

  // ── Send handler ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!canSend || isSubmitting.current) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    isSubmitting.current = true;
    Keyboard.dismiss();

    // Press animation
    Animated.sequence([
      Animated.spring(sendScale, {
        toValue: 0.85,
        speed: 40,
        useNativeDriver: true,
      }),
      Animated.spring(sendScale, {
        toValue: 1,
        speed: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setText('');
    onSend(trimmed);

    // Re-enable after short debounce to prevent double-fire
    setTimeout(() => {
      isSubmitting.current = false;
    }, 400);
  }, [canSend, text, onSend, sendScale]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, isLoading && styles.inputWrapperDisabled]}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#4A4870"
          multiline
          scrollEnabled
          maxLength={2000}
          editable={!isLoading}
          returnKeyType="default"
          blurOnSubmit={false}
          textAlignVertical="center"
          selectionColor="#6C63FF"
          accessibilityLabel="Interview answer input"
          accessibilityHint="Type your answer and tap the send button"
        />

        {/* Send / Spinner button */}
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? 'Waiting for AI response' : 'Send message'}
            accessibilityState={{ disabled: !canSend }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <SendIcon active={canSend} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0F0D23',
    borderTopWidth: 1,
    borderTopColor: '#1E1C3A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1A1836',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2850',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 50,
    maxHeight: 160,
  },
  inputWrapperDisabled: {
    borderColor: '#201E40',
    opacity: 0.6,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 8,
  },

  // ── Send button ─────────────────────────────
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2850',
  },
  sendIconText: {
    fontSize: 15,
    lineHeight: 18,
  },
  sendIconActive: {
    color: '#FFFFFF',
  },
  sendIconInactive: {
    color: '#4A4870',
  },
});
