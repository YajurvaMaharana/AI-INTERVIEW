// ---------------------------------------------------------------------------
// demo-seed.service.ts — Pre-Seeded Historical Data & Stable Demo Account Seeder
// ---------------------------------------------------------------------------

export interface SeededInterviewSession {
  id: string;
  role: string;
  company: string;
  date: string;
  score: number;
  durationMinutes: number;
  status: 'completed' | 'reviewed';
  summary: string;
  skillsAssessed: string[];
}

export interface SeededAnalyticsData {
  overallScore: number;
  totalInterviews: number;
  streakDays: number;
  skillBreakdown: { skill: string; score: number }[];
  pastSessions: SeededInterviewSession[];
  trendData: { date: string; score: number }[];
}

export const DEMO_USER_EMAIL = 'demo@ascendx.ai';

export const DEMO_SEEDED_DATA: SeededAnalyticsData = {
  overallScore: 88,
  totalInterviews: 14,
  streakDays: 6,
  skillBreakdown: [
    { skill: 'System Design', score: 89 },
    { skill: 'Algorithms & Data Structures', score: 85 },
    { skill: 'Concurrency & Scaling', score: 91 },
    { skill: 'Communication & STAR Method', score: 87 },
    { skill: 'Behavioral & Leadership', score: 90 },
  ],
  pastSessions: [
    {
      id: 'sess-demo-001',
      role: 'Staff Full-Stack Engineer',
      company: 'Google / Meta',
      date: '2026-09-18',
      score: 92,
      durationMinutes: 45,
      status: 'completed',
      summary: 'Exceptional architectural breakdown of distributed caching layers and database sharding strategies.',
      skillsAssessed: ['System Design', 'Concurrency', 'Scalability'],
    },
    {
      id: 'sess-demo-002',
      role: 'Senior Backend Engineer',
      company: 'Stripe / FinTech',
      date: '2026-09-15',
      score: 86,
      durationMinutes: 40,
      status: 'completed',
      summary: 'Strong grasp of ACID transactions and race condition prevention. Minor optimizations needed on rate limiter edge cases.',
      skillsAssessed: ['APIs', 'Security', 'Database Transactions'],
    },
    {
      id: 'sess-demo-003',
      role: 'Engineering Manager',
      company: 'Enterprise SaaS',
      date: '2026-09-10',
      score: 89,
      durationMinutes: 50,
      status: 'completed',
      summary: 'Masterful STAR methodology narrative during production outage incident response.',
      skillsAssessed: ['Leadership', 'Stakeholder Management', 'STAR Framework'],
    },
    {
      id: 'sess-demo-004',
      role: 'Algorithms & Core Systems',
      company: 'High-Frequency Trading',
      date: '2026-09-05',
      score: 84,
      durationMinutes: 35,
      status: 'completed',
      summary: 'Efficient sliding window implementation with O(N) time complexity.',
      skillsAssessed: ['Data Structures', 'Time Complexity', 'Optimization'],
    },
  ],
  trendData: [
    { date: 'Sep 05', score: 78 },
    { date: 'Sep 08', score: 81 },
    { date: 'Sep 10', score: 83 },
    { date: 'Sep 12', score: 86 },
    { date: 'Sep 15', score: 85 },
    { date: 'Sep 18', score: 92 },
  ],
};

export function initializeDemoAccountIfActive(userEmail?: string): boolean {
  if (!userEmail || userEmail.toLowerCase() !== DEMO_USER_EMAIL) {
    return false;
  }

  if (typeof window === 'undefined') return false;

  try {
    const existing = localStorage.getItem('ascendx_demo_seeded');
    if (!existing) {
      localStorage.setItem('ascendx_demo_analytics', JSON.stringify(DEMO_SEEDED_DATA));
      localStorage.setItem('ascendx_demo_seeded', 'true');
      console.info('[DemoSeed] Successfully initialized stable demo account data for demo@ascendx.ai');
    }
    return true;
  } catch (err) {
    console.warn('[DemoSeed] Failed to seed demo account data:', err);
    return false;
  }
}

export function getDemoAnalytics(): SeededAnalyticsData {
  if (typeof window === 'undefined') return DEMO_SEEDED_DATA;
  try {
    const cached = localStorage.getItem('ascendx_demo_analytics');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}
  return DEMO_SEEDED_DATA;
}
