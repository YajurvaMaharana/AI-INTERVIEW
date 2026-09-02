import { z } from "zod";

export const interviewSetupSchema = z.object({
  type: z.enum(["Technical", "HR"], {
    required_error: "Please select an interview type",
  }),
  role: z
    .string()
    .min(1, { message: "Role is required" })
    .min(2, { message: "Role must be at least 2 characters" }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
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
    message: `${data.type} interview session created for ${data.role} (${data.difficulty})`,
  };
}
