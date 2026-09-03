/**
 * TypingIndicator.tsx
 *
 * Animated "AI is thinking…" three-dot bounce indicator.
 * Matches the AI ChatBubble visual style.
 */

import React, { useEffect, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const DURATION = 480;

export function TypingIndicator() {
  // Store Animated.Values in state to avoid 'react-hooks/refs' errors during render
  const [dots] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: DURATION,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View
      style={styles.row}
      accessibilityLabel="AI Interviewer is typing"
      accessibilityRole="progressbar"
    >
      {/* Avatar matching ChatBubble AI style */}
      <View style={styles.avatar} />

      <View style={styles.bubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2B55',
    borderWidth: 1.5,
    borderColor: '#6C63FF',
    marginRight: 10,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1836',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2850',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#6C63FF',
  },
});
