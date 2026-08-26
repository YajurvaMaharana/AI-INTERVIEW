/**
 * app/(app)/feedback.tsx
 *
 * Post-interview Feedback Screen.
 * Receives session data from the API and displays a structured summary.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackCategory {
  label: string;
  score: number; // 0-100
  comment: string;
}

interface SessionFeedback {
  overall_score: number;
  summary: string;
  categories: FeedbackCategory[];
  strengths: string[];
  improvements: string[];
}

// ─── Score ring colour ────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#34C759';
  if (score >= 55) return '#FFD60A';
  return '#FF453A';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <View style={scoreBarStyles.track}>
      <View
        style={[scoreBarStyles.fill, { width: `${score}%` as `${number}%`, backgroundColor: color }]}
      />
    </View>
  );
}

const scoreBarStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E1C3A',
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, pass the sessionId via router params or context.
    // Here we attempt to fetch and fall back to mock data for development.
    async function loadFeedback() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/feedback/latest`);
        if (!res.ok) throw new Error('No feedback');
        const data: SessionFeedback = await res.json();
        setFeedback(data);
      } catch {
        // Dev fallback
        setFeedback({
          overall_score: 74,
          summary:
            'You demonstrated solid technical knowledge with clear communication. Work on structuring longer answers using the STAR method.',
          categories: [
            { label: 'Technical Knowledge', score: 82, comment: 'Strong fundamentals.' },
            { label: 'Communication', score: 70, comment: 'Clear but could be more concise.' },
            { label: 'Problem Solving', score: 75, comment: 'Good reasoning, show your steps.' },
            { label: 'Confidence', score: 68, comment: 'Keep eye contact and speak steadily.' },
          ],
          strengths: [
            'Deep understanding of core concepts',
            'Calm under pressure',
            'Good use of examples',
          ],
          improvements: [
            'Structure answers with STAR method',
            'Reduce filler words (um, like)',
            'Ask clarifying questions before answering',
          ],
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedback();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Generating feedback…</Text>
      </View>
    );
  }

  if (!feedback) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Feedback unavailable.</Text>
      </View>
    );
  }

  const overallColor = scoreColor(feedback.overall_score);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={styles.title}>Session Feedback</Text>
        <Text style={styles.subtitle}>Here's how you did</Text>

        {/* ── Overall score ── */}
        <View style={styles.scoreCard}>
          <View style={[styles.scoreBadge, { borderColor: overallColor }]}>
            <Text style={[styles.scoreNumber, { color: overallColor }]}>
              {feedback.overall_score}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <Text style={styles.summary}>{feedback.summary}</Text>
        </View>

        {/* ── Category scores ── */}
        <Text style={styles.sectionTitle}>Performance Breakdown</Text>
        {feedback.categories.map((cat) => {
          const color = scoreColor(cat.score);
          return (
            <View key={cat.label} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={[styles.categoryScore, { color }]}>{cat.score}</Text>
              </View>
              <ScoreBar score={cat.score} color={color} />
              <Text style={styles.categoryComment}>{cat.comment}</Text>
            </View>
          );
        })}

        {/* ── Strengths ── */}
        <Text style={styles.sectionTitle}>Strengths</Text>
        <View style={styles.listCard}>
          {feedback.strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* ── Improvements ── */}
        <Text style={styles.sectionTitle}>Areas to Improve</Text>
        <View style={styles.listCard}>
          {feedback.improvements.map((imp, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, { color: '#FFD60A' }]}>→</Text>
              <Text style={styles.listText}>{imp}</Text>
            </View>
          ))}
        </View>

        {/* ── Actions ── */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(app)/interview-config')}
          accessibilityRole="button"
          accessibilityLabel="Start a new interview"
        >
          <Text style={styles.primaryButtonText}>Start New Interview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          accessibilityLabel="Go to home screen"
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0D23' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },

  center: {
    flex: 1,
    backgroundColor: '#0F0D23',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#9D98CB', fontSize: 16, marginTop: 12 },
  errorText: { color: '#FF453A', fontSize: 18, fontWeight: '600' },

  // ── Header ──────────────────────────────────
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7B78AF',
    marginBottom: 28,
  },

  // ── Score card ──────────────────────────────
  scoreCard: {
    backgroundColor: '#1A1836',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2A2850',
  },
  scoreBadge: {
    flexDirection: 'row',
    borderWidth: 3,
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 50,
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#7B78AF',
    marginBottom: 4,
    marginLeft: 2,
  },
  summary: {
    color: '#C0BEDF',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  // ── Section titles ──────────────────────────
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 4,
  },

  // ── Category cards ──────────────────────────
  categoryCard: {
    backgroundColor: '#1A1836',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2850',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: { color: '#E0DFF8', fontSize: 14, fontWeight: '600' },
  categoryScore: { fontSize: 18, fontWeight: '800' },
  categoryComment: { color: '#7B78AF', fontSize: 12, marginTop: 8 },

  // ── Strengths / Improvements ────────────────
  listCard: {
    backgroundColor: '#1A1836',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2850',
    gap: 10,
  },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { color: '#34C759', fontSize: 15, fontWeight: '700', marginTop: 1 },
  listText: { color: '#C0BEDF', fontSize: 14, lineHeight: 20, flex: 1 },

  // ── Action buttons ──────────────────────────
  primaryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2A2850',
  },
  secondaryButtonText: { color: '#7B78AF', fontWeight: '600', fontSize: 15 },
});
