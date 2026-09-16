// ---------------------------------------------------------------------------
// adaptive-engine.service.ts — Real-time Adaptive Difficulty & Branching Engine
// ---------------------------------------------------------------------------

export type BranchDecision =
  | 'PROBE_DEEPER'     // Dig into a specific weakness/unaddressed edge case
  | 'LEVEL_UP'         // Candidate excelled; introduce higher scale/complexity constraint
  | 'TRANSITION_TOPIC' // Current topic covered thoroughly; pivot to next core domain
  | 'PROVIDE_HINT';    // Candidate is stuck; give a subtle professional hint

export interface TopicCompetency {
  topic: string;
  score: number;        // 0 to 100
  level: 'Foundational' | 'Competent' | 'Advanced' | 'Expert';
  trend: 'up' | 'down' | 'steady';
  dataPoints: number;
  lastAssessed: string;
}

export interface CandidateEvaluationResult {
  score: number; // 0 to 100
  topic: string;
  strengths: string[];
  weaknesses: string[];
  branchDecision: BranchDecision;
  suggestedFocusArea: string;
  difficultyAdjustment: number; // e.g. +0.2, -0.15
  feedbackNote: string;
}

export interface SessionAdaptiveTelemetry {
  sessionId: string;
  overallScore: number; // 0 to 100
  currentDifficultyTier: 'easy' | 'medium' | 'hard';
  numericDifficulty: number; // 1.0 (Junior/Easy) to 3.0 (Staff/Hard)
  difficultyLabel: string;
  currentTopic: string;
  activeBranch: BranchDecision;
  branchDescription: string;
  competencies: Record<string, TopicCompetency>;
  recentEvaluations: Array<{
    timestamp: string;
    topic: string;
    score: number;
    decision: BranchDecision;
    focus: string;
  }>;
}

// ---------------------------------------------------------------------------
// In-Memory Global Store for Adaptive Session States
// ---------------------------------------------------------------------------
const globalStore = globalThis as unknown as {
  __ascendxAdaptiveStore?: Map<string, SessionAdaptiveTelemetry>;
};

if (!globalStore.__ascendxAdaptiveStore) {
  globalStore.__ascendxAdaptiveStore = new Map<string, SessionAdaptiveTelemetry>();
}

const adaptiveStore = globalStore.__ascendxAdaptiveStore;

export const DEFAULT_TOPICS_BY_ROLE: Record<string, string[]> = {
  technical: [
    'System Architecture & Scale',
    'Data Structures & Algorithms',
    'Concurrency & Performance',
    'Database & Schema Design',
    'Clean Code & Modularity',
    'Debugging & Edge Cases',
  ],
  behavioral: [
    'STAR Methodology & Impact',
    'Cross-Functional Collaboration',
    'Conflict Resolution & Ownership',
    'Leadership & Mentorship',
    'Ambiguity & Prioritization',
    'Communication & Articulation',
  ],
};

/**
 * Initializes or retrieves existing adaptive telemetry for a session
 */
export function getOrCreateSessionTelemetry(
  sessionId: string,
  type: string = 'technical',
  initialDifficulty: string = 'medium'
): SessionAdaptiveTelemetry {
  const existing = adaptiveStore.get(sessionId);
  if (existing) return existing;

  const numericDiff =
    initialDifficulty.toLowerCase() === 'easy'
      ? 1.2
      : initialDifficulty.toLowerCase() === 'hard'
      ? 2.8
      : 2.0;

  const topicList =
    type.toLowerCase() === 'behavioral' || type.toLowerCase() === 'hr'
      ? DEFAULT_TOPICS_BY_ROLE['behavioral']
      : DEFAULT_TOPICS_BY_ROLE['technical'];

  const initialCompetencies: Record<string, TopicCompetency> = {};
  topicList.forEach((topic) => {
    initialCompetencies[topic] = {
      topic,
      score: Math.round(50 + (numericDiff - 1.0) * 15),
      level: numericDiff > 2.2 ? 'Advanced' : 'Competent',
      trend: 'steady',
      dataPoints: 0,
      lastAssessed: new Date().toISOString(),
    };
  });

  const newTelemetry: SessionAdaptiveTelemetry = {
    sessionId,
    overallScore: Math.round(50 + (numericDiff - 1.0) * 15),
    currentDifficultyTier: (initialDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard') || 'medium',
    numericDifficulty: numericDiff,
    difficultyLabel: getDifficultyLabel(numericDiff),
    currentTopic: topicList[0],
    activeBranch: 'LEVEL_UP',
    branchDescription: 'Initial calibration active — baseline question',
    competencies: initialCompetencies,
    recentEvaluations: [],
  };

  adaptiveStore.set(sessionId, newTelemetry);
  return newTelemetry;
}

function getDifficultyLabel(numeric: number): string {
  if (numeric < 1.4) return 'Easy / Foundational (L3)';
  if (numeric < 1.8) return 'Early Mid-Level (L3+)';
  if (numeric < 2.2) return 'Industry Mid-Level (L4)';
  if (numeric < 2.6) return 'Senior Engineer (L5)';
  return 'Staff / Principal Lead (L6+)';
}

/**
 * Quick heuristic evaluator to extract topics and analyze answer structure
 */
export function evaluateCandidateResponse(
  userAnswer: string,
  currentTopic: string,
  sessionType: string
): CandidateEvaluationResult {
  const answerLower = userAnswer.toLowerCase();
  const wordCount = userAnswer.trim().split(/\s+/).length;

  let score = 70; // baseline
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 1. Length & Depth Heuristics
  if (wordCount < 15) {
    score -= 25;
    weaknesses.push('Answer is brief and lacks depth or concrete implementation details');
  } else if (wordCount > 60) {
    score += 10;
    strengths.push('Detailed, comprehensive explanation provided');
  }

  // 2. Technical Quality Checks
  const technicalKeywords = [
    'trade-off', 'latency', 'cache', 'redis', 'index', 'complexity', 'o(n)', 'o(1)',
    'concurrency', 'async', 'distributed', 'throughput', 'sharding', 'replica',
    'idempotent', 'lock', 'deadlock', 'event', 'queue', 'kafka', 'database', 'sql',
    'interface', 'modularity', 'unit test', 'monitoring', 'observability'
  ];

  const behavioralKeywords = [
    'situation', 'task', 'action', 'result', 'metric', 'impact', 'stakeholder',
    'compromise', 'delivered', 'improved by', 'percent', 'led', 'resolved', 'learned'
  ];

  const targetKeywords = sessionType.toLowerCase() === 'behavioral' ? behavioralKeywords : technicalKeywords;
  const matchedKeywords = targetKeywords.filter((kw) => answerLower.includes(kw));

  if (matchedKeywords.length >= 3) {
    score += 15;
    strengths.push(`Incorporated key architectural/domain terminology: ${matchedKeywords.slice(0, 3).join(', ')}`);
  } else if (matchedKeywords.length === 0 && wordCount > 20) {
    score -= 10;
    weaknesses.push('Missed concrete industry terminology, specific metrics, or algorithmic complexity');
  }

  // 3. Trade-off & Constraint Awareness
  if (answerLower.includes('however') || answerLower.includes('trade-off') || answerLower.includes('downside') || answerLower.includes('depends on')) {
    score += 10;
    strengths.push('Demonstrated strong trade-off awareness and nuanced architectural reasoning');
  }

  // 4. Determine Branch Decision
  score = Math.max(15, Math.min(98, score));

  let branchDecision: BranchDecision;
  let suggestedFocusArea = currentTopic;
  let difficultyAdjustment = 0;
  let feedbackNote = '';

  if (score >= 82) {
    branchDecision = 'LEVEL_UP';
    difficultyAdjustment = 0.2;
    feedbackNote = 'Strong response. Scale up complexity with high concurrency or multi-region constraints.';
    suggestedFocusArea = 'High-Scale Concurrency & Edge Cases';
  } else if (score >= 60) {
    if (weaknesses.length > 0) {
      branchDecision = 'PROBE_DEEPER';
      difficultyAdjustment = 0.05;
      feedbackNote = `Good foundation, but probe candidate on: ${weaknesses[0]}`;
      suggestedFocusArea = weaknesses[0];
    } else {
      branchDecision = 'TRANSITION_TOPIC';
      difficultyAdjustment = 0.1;
      feedbackNote = 'Solid explanation. Smooth transition to next architectural domain.';
      suggestedFocusArea = 'Next Domain Dimension';
    }
  } else if (wordCount < 10 || answerLower.includes("don't know") || answerLower.includes('not sure')) {
    branchDecision = 'PROVIDE_HINT';
    difficultyAdjustment = -0.2;
    feedbackNote = 'Candidate indicated uncertainty. Offer a constructive architectural hint and guide.';
    suggestedFocusArea = 'Guided Concept Breakdown';
  } else {
    branchDecision = 'PROBE_DEEPER';
    difficultyAdjustment = -0.1;
    feedbackNote = 'Incomplete response. Target the unaddressed trade-offs and edge cases.';
    suggestedFocusArea = 'Root Cause & Failure Modes';
  }

  return {
    score,
    topic: currentTopic,
    strengths,
    weaknesses,
    branchDecision,
    suggestedFocusArea,
    difficultyAdjustment,
    feedbackNote,
  };
}

/**
 * Updates telemetry in memory when a message is evaluated
 */
export function updateSessionTelemetryWithEvaluation(
  sessionId: string,
  evaluation: CandidateEvaluationResult,
  nextTopicCandidate?: string
): SessionAdaptiveTelemetry {
  const telemetry = getOrCreateSessionTelemetry(sessionId);

  // 1. Update Numeric Difficulty (bounded between 1.0 and 3.0)
  const newNumeric = Math.max(1.0, Math.min(3.0, telemetry.numericDifficulty + evaluation.difficultyAdjustment));
  telemetry.numericDifficulty = Math.round(newNumeric * 100) / 100;
  telemetry.difficultyLabel = getDifficultyLabel(telemetry.numericDifficulty);

  if (telemetry.numericDifficulty >= 2.4) {
    telemetry.currentDifficultyTier = 'hard';
  } else if (telemetry.numericDifficulty >= 1.7) {
    telemetry.currentDifficultyTier = 'medium';
  } else {
    telemetry.currentDifficultyTier = 'easy';
  }

  // 2. Update Per-Topic Competency
  const currentComp = telemetry.competencies[evaluation.topic] || {
    topic: evaluation.topic,
    score: 50,
    level: 'Competent',
    trend: 'steady',
    dataPoints: 0,
    lastAssessed: new Date().toISOString(),
  };

  const oldScore = currentComp.score;
  const updatedScore = Math.round(oldScore * 0.4 + evaluation.score * 0.6);
  const trend = updatedScore > oldScore ? 'up' : updatedScore < oldScore ? 'down' : 'steady';

  let level: TopicCompetency['level'] = 'Competent';
  if (updatedScore >= 85) level = 'Expert';
  else if (updatedScore >= 70) level = 'Advanced';
  else if (updatedScore >= 50) level = 'Competent';
  else level = 'Foundational';

  telemetry.competencies[evaluation.topic] = {
    ...currentComp,
    score: updatedScore,
    level,
    trend,
    dataPoints: currentComp.dataPoints + 1,
    lastAssessed: new Date().toISOString(),
  };

  // 3. Update Overall Score
  const compValues = Object.values(telemetry.competencies);
  const totalScore = compValues.reduce((acc, c) => acc + c.score, 0);
  telemetry.overallScore = Math.round(totalScore / compValues.length);

  // 4. Update Active Branch
  telemetry.activeBranch = evaluation.branchDecision;
  telemetry.branchDescription = evaluation.feedbackNote;

  if (evaluation.branchDecision === 'TRANSITION_TOPIC' && nextTopicCandidate) {
    telemetry.currentTopic = nextTopicCandidate;
  }

  // 5. Append recent evaluation log
  telemetry.recentEvaluations.unshift({
    timestamp: new Date().toISOString(),
    topic: evaluation.topic,
    score: evaluation.score,
    decision: evaluation.branchDecision,
    focus: evaluation.suggestedFocusArea,
  });

  if (telemetry.recentEvaluations.length > 8) {
    telemetry.recentEvaluations = telemetry.recentEvaluations.slice(0, 8);
  }

  adaptiveStore.set(sessionId, telemetry);
  return telemetry;
}

/**
 * Builds the dynamic adaptive instruction block to inject into Gemini's system prompt
 */
export function buildAdaptivePromptContext(telemetry: SessionAdaptiveTelemetry): string {
  const compSummary = Object.entries(telemetry.competencies)
    .map(([topic, c]) => `  - ${topic}: ${c.score}% (${c.level}, trend: ${c.trend})`)
    .join('\n');

  let branchInstruction = '';
  switch (telemetry.activeBranch) {
    case 'PROBE_DEEPER':
      branchInstruction = `ACTION: PROBE DEEPER. The candidate gave a partial answer or exposed a potential blind spot. Do NOT ask a generic "can you elaborate?" question. Instead, ask a sharp, targeted technical question probing their specific omission or failure mode (${telemetry.branchDescription}).`;
      break;
    case 'LEVEL_UP':
      branchInstruction = `ACTION: LEVEL UP DIFFICULTY. The candidate answered proficiently. Introduce a higher-scale constraint, race condition, 100x traffic spike, multi-region replication delay, or strict memory constraint to test their limits.`;
      break;
    case 'TRANSITION_TOPIC':
      branchInstruction = `ACTION: TRANSITION TOPIC. Acknowledge their mastery and smoothly bridge to the next architectural domain: "${telemetry.currentTopic}".`;
      break;
    case 'PROVIDE_HINT':
      branchInstruction = `ACTION: PROVIDE CONSTRUCTIVE HINT. The candidate struggled or expressed uncertainty. Offer a supportive, professional hint that guides them toward the solution without giving away the full answer.`;
      break;
  }

  return `
═══════════════════════════════════════════════════════════════════════════════
REAL-TIME ADAPTIVE DIFFICULTY & BRANCHING ENGINE TELEMETRY
═══════════════════════════════════════════════════════════════════════════════
Current Calibrated Difficulty: ${telemetry.difficultyLabel} (Numeric: ${telemetry.numericDifficulty}/3.0)
Overall Candidate Proficiency: ${telemetry.overallScore}%
Active Topic Domain: ${telemetry.currentTopic}
Current Topic Competency Matrix:
${compSummary}

BRANCHING INSTRUCTION:
${branchInstruction}

CRITICAL RULES:
1. NEVER use generic canned phrases (e.g. "Can you elaborate?", "Tell me more about that").
2. ALWAYS cite the candidate's exact architectural concepts or terminology and immediately follow with a concrete technical probe.
3. Keep your reply conversational, laser-focused, and ask exactly ONE primary question.
`.trim();
}
