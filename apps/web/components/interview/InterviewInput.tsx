"use client";

import * as React from "react";
import { SendHorizonal, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface InterviewInputProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxHeight?: number;
  onToggleVoiceMode?: () => void;
  isVoiceMode?: boolean;
}

export function InterviewInput({
  onSend,
  disabled = false,
  placeholder = "Type your response here... (Press Enter to send, Shift+Enter for a new line)",
  className,
  maxHeight = 200,
  onToggleVoiceMode,
  isVoiceMode = false,
}: InterviewInputProps) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize the textarea height based on content
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [maxHeight]);

  React.useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    // Reset input state immediately before triggering send
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSend(trimmed);
    } catch {
      // If parent fails and wants to restore text, we can allow parent or user to retype
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSubmit = text.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 w-full border-t border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md transition-colors",
        className
      )}
    >
      <div className="mx-auto max-w-4xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
        >
          {onToggleVoiceMode && (
            <div className="flex shrink-0 items-center pb-1 pl-1">
              <Button
                type="button"
                id="toggle-voice-mode-trigger"
                size="icon"
                variant="ghost"
                onClick={onToggleVoiceMode}
                disabled={disabled}
                title="Switch to Voice Mode (Speech-to-Text)"
                className={cn(
                  "h-10 w-10 rounded-xl transition-all",
                  isVoiceMode
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
                )}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "AI interviewer is responding..." : placeholder}
            className={cn(
              "max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm sm:text-base outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-60",
              "leading-relaxed"
            )}
            aria-label="Interview response message"
          />

          <div className="flex shrink-0 items-center pb-1 pr-1 gap-1.5">
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              aria-label="Send response"
              className={cn(
                "h-10 w-10 rounded-xl transition-all",
                canSubmit
                  ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                  : "opacity-40"
              )}
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <span>
              Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to send,{" "}
              <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Shift + Enter</kbd> for new line
            </span>
            {onToggleVoiceMode && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onToggleVoiceMode}
                  className="font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  🎙️ Speak answer with voice
                </button>
              </>
            )}
          </div>
          {disabled && (
            <span className="flex items-center gap-1 font-medium text-primary">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewInput;
