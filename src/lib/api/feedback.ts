export interface CategoryScores {
  clarity: number;
  accuracy: number;
  structure: number;
  confidence: number;
}

export interface InterviewFeedback {
  overall_score: number;
  category_scores: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export type FeedbackFetchResult =
  | { status: "ready"; data: InterviewFeedback }
  | { status: "generating"; message?: string; progress?: number }
  | { status: "empty"; message?: string }
  | { status: "error"; message: string; statusCode?: number };

export const MOCK_FEEDBACK_DATA: InterviewFeedback = {
  overall_score: 86,
  category_scores: {
    clarity: 88,
    accuracy: 84,
    structure: 90,
    confidence: 82,
  },
  strengths: [
    "Delivered well-structured responses using the STAR method (Situation, Task, Action, Result) with clear impact metrics.",
    "Demonstrated in-depth technical knowledge of distributed systems, caching strategies, and database indexing tradeoffs.",
    "Communicated complex technical architectural concepts with articulate vocabulary and concise explanations.",
    "Maintained an engaging, professional demeanor with steady pacing and thoughtful pauses before answering.",
  ],
  weaknesses: [
    "Occasionally dove into implementation-level details before establishing the high-level system architectural context.",
    "Could have proactively highlighted edge cases and operational failure modes in system design questions without being prompted.",
    "Underemphasized monitoring, observability (e.g. OpenTelemetry, distributed tracing), and graceful degradation strategies.",
  ],
  suggestions: [
    "Lead with the high-level architecture diagram and design requirements before discussing low-level algorithms or database schema choices.",
    "Incorporate concrete quantitative benchmarks and latency SLA targets when justifying engineering architectural tradeoffs.",
    "Dedicate 1-2 minutes at the end of each system design scenario to address disaster recovery, chaos testing, and failover scenarios.",
    "Practice speaking at a slightly more deliberate pace when navigating multi-tiered technical explanations to maximize clarity.",
  ],
};

// Internal counter to simulate generation polling transitions in mock mode
const mockGenerationAttempts: Record<string, number> = {};

/**
 * Mock fetch function for development when backend GET /interviews/:id/feedback
 * is not yet ready. Matches the same API contract and signature.
 */
export async function mockFetchInterviewFeedback(
  interviewId: string
): Promise<FeedbackFetchResult> {
  // Simulate realistic network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerId = interviewId.toLowerCase();

  // Test case: Non-existent / invalid ID -> 404 error
  if (
    lowerId === "not-found" ||
    lowerId === "invalid" ||
    lowerId === "404" ||
    lowerId.includes("error")
  ) {
    return {
      status: "error",
      statusCode: 404,
      message: `Interview session "${interviewId}" was not found or has expired. Please verify your link or return to your dashboard.`,
    };
  }

  // Test case: Empty interview state (e.g., session completed with no report)
  if (lowerId === "empty" || lowerId.includes("empty")) {
    return {
      status: "empty",
      message: "No feedback report exists for this interview session. The session may have ended prematurely before answers could be evaluated.",
    };
  }

  // Test case: Polling simulation for generating state
  if (lowerId === "generating" || lowerId === "pending" || lowerId.includes("polling")) {
    const attempts = (mockGenerationAttempts[lowerId] || 0) + 1;
    mockGenerationAttempts[lowerId] = attempts;

    // Simulate 2 polling iterations of generating before report becomes ready
    if (attempts <= 2) {
      return {
        status: "generating",
        message: `Feedback report is actively being synthesized by AI (step ${attempts} of 3)...`,
        progress: attempts * 35,
      };
    }

    // Reset attempt counter and return ready report
    delete mockGenerationAttempts[lowerId];
    return {
      status: "ready",
      data: MOCK_FEEDBACK_DATA,
    };
  }

  // Default: Return ready feedback report
  return {
    status: "ready",
    data: MOCK_FEEDBACK_DATA,
  };
}

/**
 * Fetches feedback report from the backend API:
 * GET /interviews/:id/feedback
 * Falls back to mockFetchInterviewFeedback if API_URL is unset or network fails.
 */
export async function fetchInterviewFeedback(
  interviewId: string
): Promise<FeedbackFetchResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    return mockFetchInterviewFeedback(interviewId);
  }

  try {
    const res = await fetch(
      `${API_URL}/interviews/${encodeURIComponent(interviewId)}/feedback`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    // 202 Accepted indicates report generation in progress
    if (res.status === 202) {
      const data = await res.json().catch(() => null);
      return {
        status: "generating",
        message: data?.message || "AI Feedback report is currently being generated...",
      };
    }

    // 204 No Content indicates interview exists but no feedback report
    if (res.status === 204) {
      return {
        status: "empty",
        message: "No feedback report exists for this interview.",
      };
    }

    // 404 Not Found
    if (res.status === 404) {
      return {
        status: "error",
        statusCode: 404,
        message: `Interview "${interviewId}" does not exist or could not be found.`,
      };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return {
        status: "error",
        statusCode: res.status,
        message: errData?.message || `Server returned error status ${res.status}`,
      };
    }

    const data = await res.json();

    // Check payload-level generation status
    if (
      data?.status === "generating" ||
      data?.status === "processing" ||
      data?.status === "pending" ||
      data?.ready === false
    ) {
      return {
        status: "generating",
        message: data?.message || "AI Feedback report is currently being generated...",
        progress: typeof data?.progress === "number" ? data.progress : undefined,
      };
    }

    // Check if empty report was returned
    if (
      data?.status === "empty" ||
      (!data?.overall_score && (!data?.strengths || data.strengths.length === 0))
    ) {
      return {
        status: "empty",
        message: data?.message || "No feedback report exists for this interview session.",
      };
    }

    // Validate and sanitize data
    return {
      status: "ready",
      data: {
        overall_score: Number(data.overall_score) || 0,
        category_scores: {
          clarity: Number(data.category_scores?.clarity) || 0,
          accuracy: Number(data.category_scores?.accuracy) || 0,
          structure: Number(data.category_scores?.structure) || 0,
          confidence: Number(data.category_scores?.confidence) || 0,
        },
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      },
    };
  } catch (err) {
    console.warn("Backend API unavailable, falling back to mock fetch:", err);
    return mockFetchInterviewFeedback(interviewId);
  }
}
