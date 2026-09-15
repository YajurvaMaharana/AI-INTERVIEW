/**
 * app/(app)/interview/_layout.tsx
 *
 * Stack navigator for the interview sub-flow.
 * Provides a styled header that child screens (e.g., [sessionId].tsx) can
 * customise via navigation.setOptions().
 */

import { Stack } from 'expo-router';

export default function InterviewLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F0D23' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', color: '#FFFFFF' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0F0D23' },
        animation: 'slide_from_right',
      }}
    />
  );
}
