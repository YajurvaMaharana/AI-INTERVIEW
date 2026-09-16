import { z } from "zod";

export const interviewSetupSchema = z.object({
  type: z.enum(["Technical", "HR", "System Design", "Mixed"], {
    required_error: "Please select an interview format",
  }),
  role: z
    .string()
    .min(1, { message: "Role is required" })
    .min(2, { message: "Role must be at least 2 characters" }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
  persona: z
    .enum(["tech-grinder", "hr-partner", "simulation-boss", "supportive-mentor"])
    .default("tech-grinder"),
  duration: z.coerce.number().min(5).max(120).default(30),
  language: z.string().min(2).default("English"),
  practiceMode: z
    .enum(["standard", "stress_test", "coaching", "simulation_day"])
    .default("standard"),
  modality: z.enum(["voice", "text"]).default("voice"),
});

export type InterviewSetupValues = z.infer<typeof interviewSetupSchema>;

export interface InterviewCreateResponse {
  sessionId: string;
  message: string;
}

/**
 * Mock fetch for development when the backend POST /interviews
 * endpoint is not yet available. Simulates a 1.5 s network delay
 * and returns a deterministic sessionId.
 */
export async function mockCreateInterview(
  data: InterviewSetupValues
): Promise<InterviewCreateResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    sessionId: `mock-${Date.now()}-${data.type.toLowerCase()}`,
    message: `${data.type} interview session created for ${data.role} (${data.difficulty}) with ${data.persona} in ${data.language}`,
  };
}
