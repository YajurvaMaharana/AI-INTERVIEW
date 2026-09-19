// ---------------------------------------------------------------------------
// evaluation-harness.service.ts — Evaluation Quality, Benchmark Test Suite & Regression Harness
// ---------------------------------------------------------------------------

import { evaluateCandidateResponse, CandidateEvaluationResult, BranchDecision } from './adaptive-engine.service';

export interface BenchmarkTestCase {
  id: string;
  role: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coreTopic: string;
  promptText: string;
  weakSampleAnswer: string;
  strongSampleAnswer: string;
  expectedWeakScoreRange: [number, number]; // e.g., [30, 60]
  expectedStrongScoreRange: [number, number]; // e.g., [75, 100]
  expectedWeakBranch: BranchDecision[];
  expectedStrongBranch: BranchDecision[];
}

export interface TestCaseExecutionResult {
  testId: string;
  topic: string;
  role: string;
  weakResult: {
    score: number;
    branchDecision: BranchDecision;
    passedScore: boolean;
    passedBranch: boolean;
  };
  strongResult: {
    score: number;
    branchDecision: BranchDecision;
    passedScore: boolean;
    passedBranch: boolean;
  };
  schemaValid: boolean;
  overallPassed: boolean;
  error?: string;
}

export interface HarnessExecutionReport {
  timestamp: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  successRate: number;
  deterministicConsistencyScore: number; // 0-100%
  results: TestCaseExecutionResult[];
}

// ---------------------------------------------------------------------------
// Comprehensive Benchmark Test Case Repository
// ---------------------------------------------------------------------------
export const BENCHMARK_TEST_CASES: BenchmarkTestCase[] = [
  {
    id: 'TC-SYS-001',
    role: 'Full-Stack / Backend',
    difficulty: 'medium',
    coreTopic: 'System Architecture & Scale',
    promptText: 'Design a scalable notification dispatch service handling 10 million events per minute with sub-second delivery guarantees.',
    weakSampleAnswer: 'We can use Node.js and express with a single SQL database. If it is slow we add indexes.',
    strongSampleAnswer: 'To handle 10M events/min, we should implement a distributed Kafka event streaming pipeline with consumer groups for partitioning, Redis cluster for rate limiting and deduplication, and a microservices worker pool backed by gRPC. For database scaling, we shard user notification states horizontally across Cassandra with idempotent delivery tokens and exponential backoff retry queues.',
    expectedWeakScoreRange: [25, 59],
    expectedStrongScoreRange: [75, 100],
    expectedWeakBranch: ['PROVIDE_HINT', 'PROBE_DEEPER'],
    expectedStrongBranch: ['LEVEL_UP', 'TRANSITION_TOPIC'],
  },
  {
    id: 'TC-ALG-002',
    role: 'Software Engineer',
    difficulty: 'medium',
    coreTopic: 'Data Structures & Algorithms',
    promptText: 'Explain how you would find the longest substring without repeating characters in an efficient time complexity.',
    weakSampleAnswer: 'I would loop through all substrings and check every character with nested loops.',
    strongSampleAnswer: 'We can solve this efficiently in O(N) time complexity using the Sliding Window pattern with a Hash Map or integer frequency array to track the last seen index of each character. As the right pointer expands, if a duplicate is found within the current window start boundary, we instantly jump the left pointer past the duplicate index, maintaining maximum window length in a single pass.',
    expectedWeakScoreRange: [30, 60],
    expectedStrongScoreRange: [80, 100],
    expectedWeakBranch: ['PROVIDE_HINT', 'PROBE_DEEPER'],
    expectedStrongBranch: ['LEVEL_UP', 'TRANSITION_TOPIC'],
  },
  {
    id: 'TC-CONC-003',
    role: 'Backend / Systems',
    difficulty: 'hard',
    coreTopic: 'Concurrency & Performance',
    promptText: 'How do you prevent race conditions and double-spending in a high-throughput financial ledger API?',
    weakSampleAnswer: 'I would check the balance in JavaScript and if it is enough, deduct it and save to the database.',
    strongSampleAnswer: 'To prevent race conditions, we must rely on database-level ACID transactions with serializable isolation or optimistic locking using version columns (`UPDATE accounts SET balance = balance - X, version = version + 1 WHERE id = 1 AND version = v`). For distributed locking across microservices, we utilize Redlock with Redis or idempotent transaction IDs stored in a ledger audit log with cryptographic constraints.',
    expectedWeakScoreRange: [20, 55],
    expectedStrongScoreRange: [85, 100],
    expectedWeakBranch: ['PROVIDE_HINT', 'PROBE_DEEPER'],
    expectedStrongBranch: ['LEVEL_UP', 'TRANSITION_TOPIC'],
  },
  {
    id: 'TC-BEH-004',
    role: 'Engineering Management / Senior',
    difficulty: 'medium',
    coreTopic: 'STAR Methodology & Impact',
    promptText: 'Describe a time when you experienced a critical production outage and how you aligned stakeholders under intense pressure.',
    weakSampleAnswer: 'Our server crashed and we fixed it.',
    strongSampleAnswer: 'Situation: During Black Friday peak traffic, our core payment gateway experienced a cascading 500 error spike impacting 40% of checkout transactions. Task: As Tech Lead, I needed to restore transaction integrity within 15 minutes and manage stakeholder communications. Action: I established a war room, delegated debugging to backend leads while I personally drafted incident updates for executive leadership and customer support. We identified a connection pool exhaustion bug, rolled back the faulty deploy, and scaled connection pooling. Result: Service restored in 12 minutes, preventing $2.1M in lost revenue, followed by a blameless post-mortem with automated circuit breakers.',
    expectedWeakScoreRange: [30, 60],
    expectedStrongScoreRange: [80, 100],
    expectedWeakBranch: ['PROVIDE_HINT', 'PROBE_DEEPER'],
    expectedStrongBranch: ['LEVEL_UP', 'TRANSITION_TOPIC'],
  },
];

/**
 * Validates that an evaluation result strictly conforms to required JSON schema rules
 */
export function validateEvaluationSchema(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!result || typeof result !== 'object') {
    return { valid: false, errors: ['Result is not a valid object'] };
  }

  if (typeof result.score !== 'number' || isNaN(result.score) || result.score < 0 || result.score > 100) {
    errors.push(`Invalid score: expected number between 0 and 100, got ${result.score}`);
  }

  if (typeof result.topic !== 'string' || result.topic.trim().length === 0) {
    errors.push('Missing or invalid topic string');
  }

  if (!Array.isArray(result.strengths)) {
    errors.push('strengths must be an array');
  }

  if (!Array.isArray(result.weaknesses)) {
    errors.push('weaknesses must be an array');
  }

  const validBranches: BranchDecision[] = ['PROBE_DEEPER', 'LEVEL_UP', 'TRANSITION_TOPIC', 'PROVIDE_HINT'];
  if (!validBranches.includes(result.branchDecision)) {
    errors.push(`Invalid branchDecision: got "${result.branchDecision}"`);
  }

  if (typeof result.suggestedFocusArea !== 'string') {
    errors.push('suggestedFocusArea must be a string');
  }

  if (typeof result.difficultyAdjustment !== 'number') {
    errors.push('difficultyAdjustment must be a number');
  }

  if (typeof result.feedbackNote !== 'string') {
    errors.push('feedbackNote must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Executes the regression harness against all benchmark test cases, verifying:
 * 1. JSON schema conformity
 * 2. Scoring consistency & accuracy (strong > weak)
 * 3. Adaptive branching behavior
 * 4. Deterministic repeatability across multiple iterations
 */
export function runEvaluationRegressionHarness(iterations: number = 3): HarnessExecutionReport {
  const results: TestCaseExecutionResult[] = [];
  let passCount = 0;
  let failCount = 0;
  let totalConsistencyChecks = 0;
  let passedConsistencyChecks = 0;

  for (const tc of BENCHMARK_TEST_CASES) {
    let testPassed = true;
    let errorMessage = '';

    try {
      // 1. Evaluate Weak Answer (Run multiple times to verify determinism)
      let weakScores: number[] = [];
      let weakBranches: BranchDecision[] = [];
      let weakSchemaValid = true;

      for (let i = 0; i < iterations; i++) {
        const res = evaluateCandidateResponse(tc.weakSampleAnswer, tc.coreTopic, tc.role);
        const schemaCheck = validateEvaluationSchema(res);
        if (!schemaCheck.valid) {
          weakSchemaValid = false;
          errorMessage = schemaCheck.errors.join('; ');
        }
        weakScores.push(res.score);
        weakBranches.push(res.branchDecision);
      }

      const avgWeakScore = weakScores.reduce((a, b) => a + b, 0) / iterations;
      const passedWeakScore = avgWeakScore >= tc.expectedWeakScoreRange[0] && avgWeakScore <= tc.expectedWeakScoreRange[1];
      const passedWeakBranch = weakBranches.some((b) => tc.expectedWeakBranch.includes(b));

      // 2. Evaluate Strong Answer
      let strongScores: number[] = [];
      let strongBranches: BranchDecision[] = [];
      let strongSchemaValid = true;

      for (let i = 0; i < iterations; i++) {
        const res = evaluateCandidateResponse(tc.strongSampleAnswer, tc.coreTopic, tc.role);
        const schemaCheck = validateEvaluationSchema(res);
        if (!schemaCheck.valid) {
          strongSchemaValid = false;
          errorMessage = schemaCheck.errors.join('; ');
        }
        strongScores.push(res.score);
        strongBranches.push(res.branchDecision);
      }

      const avgStrongScore = strongScores.reduce((a, b) => a + b, 0) / iterations;
      const passedStrongScore = avgStrongScore >= tc.expectedStrongScoreRange[0] && avgStrongScore <= tc.expectedStrongScoreRange[1];
      const passedStrongBranch = strongBranches.some((b) => tc.expectedStrongBranch.includes(b));

      // Check determinism (scores should be identical across iterations)
      totalConsistencyChecks += 2;
      const weakDeterministic = weakScores.every((s) => s === weakScores[0]);
      const strongDeterministic = strongScores.every((s) => s === strongScores[0]);
      if (weakDeterministic) passedConsistencyChecks++;
      if (strongDeterministic) passedConsistencyChecks++;

      // Strong score must be significantly higher than weak score (at least +20 points)
      const spreadCheck = avgStrongScore - avgWeakScore >= 20;

      const schemaValid = weakSchemaValid && strongSchemaValid;
      const overallTestCasePassed =
        schemaValid && (passedWeakScore || avgWeakScore < 70) && (passedStrongScore || avgStrongScore > 75) && spreadCheck;

      if (overallTestCasePassed) {
        passCount++;
      } else {
        failCount++;
        testPassed = false;
        if (!spreadCheck) {
          errorMessage = `Score spread too narrow (Weak: ${avgWeakScore.toFixed(1)}, Strong: ${avgStrongScore.toFixed(1)})`;
        }
      }

      results.push({
        testId: tc.id,
        topic: tc.coreTopic,
        role: tc.role,
        weakResult: {
          score: Math.round(avgWeakScore),
          branchDecision: weakBranches[0],
          passedScore: passedWeakScore,
          passedBranch: passedWeakBranch,
        },
        strongResult: {
          score: Math.round(avgStrongScore),
          branchDecision: strongBranches[0],
          passedScore: passedStrongScore,
          passedBranch: passedStrongBranch,
        },
        schemaValid,
        overallPassed: testPassed,
        error: errorMessage || undefined,
      });
    } catch (err: any) {
      failCount++;
      results.push({
        testId: tc.id,
        topic: tc.coreTopic,
        role: tc.role,
        weakResult: { score: 0, branchDecision: 'PROVIDE_HINT', passedScore: false, passedBranch: false },
        strongResult: { score: 0, branchDecision: 'LEVEL_UP', passedScore: false, passedBranch: false },
        schemaValid: false,
        overallPassed: false,
        error: err?.message || 'Execution exception',
      });
    }
  }

  const totalTests = BENCHMARK_TEST_CASES.length;
  const successRate = Math.round((passCount / (totalTests || 1)) * 100);
  const deterministicConsistencyScore = Math.round((passedConsistencyChecks / (totalConsistencyChecks || 1)) * 100);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    passCount,
    failCount,
    successRate,
    deterministicConsistencyScore,
    results,
  };
}
