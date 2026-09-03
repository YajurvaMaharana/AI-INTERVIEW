/**
 * app/(app)/interview/[sessionId].tsx
 *
 * AI Interview Chat Screen
 *
 * Layout:
 *   SafeAreaView
 *     KeyboardAvoidingView (behavior="padding" iOS / "height" Android)
 *       FlatList  ← scrolls to bottom on new messages
 *       TypingIndicator (shown while AI is responding)
 *       InterviewInput
 *
 * Header:
 *   "End Session" button → navigates to /feedback
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { ChatBubble, ChatMessage } from '@/components/chat/ChatBubble';
import { InterviewInput } from '@/components/chat/InterviewInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenState = 'loading' | 'active' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMessage(
  role: ChatMessage['role'],
  content: string
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewChatScreen() {
  const params = useLocalSearchParams();
  const rawSessionId = params.sessionId;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
  const navigation = useNavigation();
  const router = useRouter();

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('loading');

  // ── Header: "End Session" button ───────────────────────────────────────────
  const handleEndSession = useCallback(() => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this interview? You will be taken to the feedback screen.',
      [
        { text: 'Continue Interview', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => router.replace('/feedback' as Parameters<typeof router.replace>[0]),
        },
      ]
    );
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#0F0D23' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { color: '#FFFFFF', fontWeight: '700' },
      title: 'Interview',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEndSession}
          style={styles.endSessionButton}
          accessibilityRole="button"
          accessibilityLabel="End interview session"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.endSessionText}>End Session</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleEndSession]);

  // ── Load session & initial AI message ─────────────────────────────────────
  useEffect(() => {
    // If sessionId is missing or empty, mark as error after a tick to avoid 'setState in effect' lint warnings
    // and to let Expo Router populate the params if they are delayed.
    if (!sessionId) {
      const timer = setTimeout(() => {
        setScreenState('error');
      }, 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    async function loadSession() {
      try {
        const baseUrl =
          process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

        const res = await fetch(`${baseUrl}/interviews/${sessionId}`);
        if (!res.ok) throw new Error('Failed to load session');

        const data = await res.json();

        if (cancelled) return;

        // Seed the opening AI message if provided by the API
        const openingMsg: string =
          data.opening_message ??
          "Hello! I'm your AI interviewer today. Let's get started. Could you begin by telling me a bit about yourself?";

        setMessages([createMessage('ai', openingMsg)]);
        setScreenState('active');
      } catch (err) {
        console.error('[InterviewChat] loadSession error:', err);
        if (!cancelled) {
          // Fall back to a generic opener so UX isn't blocked
          setMessages([
            createMessage(
              'ai',
              "Hello! I'm your AI interviewer. Let's begin — could you start by telling me a little about yourself?"
            ),
          ]);
          setScreenState('active');
        }
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // ── Auto-scroll when messages change ──────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    // Small timeout ensures layout has completed before scrolling
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isAiTyping]);

  // ── Send user message → call API → append AI reply ────────────────────────
  const handleSend = useCallback(
    async (userText: string) => {
      // 1. Append user bubble immediately
      const userMessage = createMessage('user', userText);
      setMessages((prev) => [...prev, userMessage]);
      setIsAiTyping(true);

      try {
        const baseUrl =
          process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

        const res = await fetch(`${baseUrl}/interviews/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });

        if (!res.ok) throw new Error('API error');

        const data = await res.json();
        const aiReply: string =
          data.reply ?? "Thank you. Let's continue — can you elaborate further?";

        setMessages((prev) => [...prev, createMessage('ai', aiReply)]);
      } catch (err) {
        console.error('[InterviewChat] handleSend error:', err);
        setMessages((prev) => [
          ...prev,
          createMessage(
            'ai',
            "I'm having trouble connecting right now. Please try again."
          ),
        ]);
      } finally {
        setIsAiTyping(false);
      }
    },
    [sessionId]
  );

  // ── Render item ────────────────────────────────────────────────────────────
  const renderMessage: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (screenState === 'loading') {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Preparing your interview…</Text>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (screenState === 'error') {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>Session not found.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Active chat ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset accounts for the navigation header height
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Message list ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Keep list pinned to bottom as it grows
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          // Performance tuning
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          // Header / footer padding
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
          ListFooterComponent={
            isAiTyping ? <TypingIndicator /> : <View style={styles.listFooterSpacer} />
          }
          accessibilityLabel="Interview conversation"
        />

        {/* ── Input bar ── */}
        <InterviewInput onSend={handleSend} isLoading={isAiTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0D23',
  },
  flex: {
    flex: 1,
  },

  // ── List ────────────────────────────────────
  listContent: {
    paddingBottom: 8,
  },
  listHeaderSpacer: {
    height: 12,
  },
  listFooterSpacer: {
    height: 8,
  },

  // ── Header button ────────────────────────────
  endSessionButton: {
    marginRight: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.4)',
  },
  endSessionText: {
    color: '#FF453A',
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Loading / Error screens ──────────────────
  centerScreen: {
    flex: 1,
    backgroundColor: '#0F0D23',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9D98CB',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
