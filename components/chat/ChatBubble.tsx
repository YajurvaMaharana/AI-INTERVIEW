/**
 * ChatBubble.tsx
 *
 * Reusable message bubble for the AI interview chat interface.
 * Supports two roles:
 *  - "user"  → right-aligned, purple gradient bubble
 *  - "ai"    → left-aligned, dark card bubble with avatar
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

interface ChatBubbleProps {
  message: ChatMessage;
  /** Show the timestamp below the bubble. Defaults to true. */
  showTimestamp?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ChatBubble = React.memo(function ChatBubble({
  message,
  showTimestamp = true,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // Fade + slide-up entrance animation
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(12));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 20,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAI,
        { opacity, transform: [{ translateY }] },
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? 'You' : 'AI Interviewer'}: ${message.content}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <View style={styles.avatar} accessibilityElementsHidden={true} importantForAccessibility="no">
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}

      {/* Bubble body */}
      <View style={styles.bubbleColumn}>
        {/* Sender label */}
        <Text style={[styles.senderLabel, isUser ? styles.senderLabelUser : styles.senderLabelAI]}>
          {isUser ? 'You' : 'AI Interviewer'}
        </Text>

        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
            {message.content}
          </Text>
        </View>

        {showTimestamp && (
          <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAI]}>
            {formatTime(message.timestamp)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAI: {
    justifyContent: 'flex-start',
  },

  // ── Avatar ──────────────────────────────────
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2B55',
    borderWidth: 1.5,
    borderColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 18,
  },
  avatarText: {
    color: '#6C63FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Bubble column ───────────────────────────
  bubbleColumn: {
    maxWidth: '75%',
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  senderLabelUser: {
    color: '#9D98CB',
    textAlign: 'right',
  },
  senderLabelAI: {
    color: '#7B78AF',
    textAlign: 'left',
  },

  // ── Bubble itself ───────────────────────────
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleAI: {
    backgroundColor: '#1A1836',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2850',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── Text ────────────────────────────────────
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAI: {
    color: '#E0DFF8',
  },

  // ── Timestamp ───────────────────────────────
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    color: '#6B6B8D',
  },
  timestampUser: {
    textAlign: 'right',
  },
  timestampAI: {
    textAlign: 'left',
  },
});
