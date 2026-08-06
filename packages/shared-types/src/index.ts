export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  status: "scheduled" | "completed";
}

export interface InterviewMessage {
  id: string;
  sessionId: string;
  sender: "interviewer" | "candidate";
  content: string;
}

export interface FeedbackReport {
  id: string;
  sessionId: string;
  score: number;
  summary: string;
}
