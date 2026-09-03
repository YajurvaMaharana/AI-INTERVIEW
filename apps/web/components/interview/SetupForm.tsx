"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  interviewSetupSchema,
  mockCreateInterview,
  type InterviewSetupValues,
  type InterviewCreateResponse,
} from "@/lib/validations/interview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INTERVIEW_TYPES = ["Technical", "HR"] as const;
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "border-green-500 bg-green-50 text-green-700 peer-checked:ring-green-500",
  Medium:
    "border-amber-500 bg-amber-50 text-amber-700 peer-checked:ring-amber-500",
  Hard: "border-red-500 bg-red-50 text-red-700 peer-checked:ring-red-500",
};

/**
 * POST to the backend /interviews endpoint.
 * Falls back to the mock implementation when the backend is unreachable.
 */
async function createInterview(
  data: InterviewSetupValues
): Promise<InterviewCreateResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Use mock when no API URL is configured
  if (!API_URL) {
    return mockCreateInterview(data);
  }

  const res = await fetch(`${API_URL}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message ?? `Server responded with status ${res.status}`
    );
  }

  return res.json() as Promise<InterviewCreateResponse>;
}

export default function SetupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterviewSetupValues>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: {
      type: undefined,
      role: "",
      difficulty: undefined,
    },
  });

  const selectedType = watch("type");
  const selectedDifficulty = watch("difficulty");

  async function onSubmit(data: InterviewSetupValues) {
    setServerError(null);

    try {
      const { sessionId } = await createInterview(data);
      router.push(`/interview/${sessionId}`);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Set Up Your Interview
        </CardTitle>
        <CardDescription className="text-center">
          Configure your mock interview session and start practicing
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* ── Server error banner ── */}
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* ── Interview Type ── */}
          <fieldset className="space-y-2">
            <Label asChild>
              <legend>Interview Type</legend>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio"
                    className="peer sr-only"
                    value={type}
                    disabled={isSubmitting}
                    {...register("type")}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2",
                      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                      selectedType === type
                        ? "border-primary"
                        : "border-input"
                    )}
                  >
                    {type === "Technical" ? "🖥️" : "🤝"}{" "}
                    <span className="ml-2">{type}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </fieldset>

          {/* ── Role / Domain ── */}
          <div className="space-y-2">
            <Label htmlFor="setup-role">Role / Domain</Label>
            <Input
              id="setup-role"
              type="text"
              placeholder="e.g. Frontend Engineer, Product Manager"
              autoComplete="off"
              disabled={isSubmitting}
              {...register("role")}
            />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* ── Difficulty ── */}
          <fieldset className="space-y-2">
            <Label asChild>
              <legend>Difficulty</legend>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    className="peer sr-only"
                    value={level}
                    checked={selectedDifficulty === level}
                    disabled={isSubmitting}
                    onChange={() => setValue("difficulty", level, { shouldValidate: true })}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-all",
                      "hover:opacity-80",
                      "peer-checked:ring-2 peer-checked:ring-offset-2",
                      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                      DIFFICULTY_COLORS[level],
                      selectedDifficulty !== level && "opacity-70"
                    )}
                  >
                    {level}
                  </div>
                </label>
              ))}
            </div>
            {errors.difficulty && (
              <p className="text-sm text-destructive">
                {errors.difficulty.message}
              </p>
            )}
          </fieldset>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting interview…
              </>
            ) : (
              "Start Interview"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
