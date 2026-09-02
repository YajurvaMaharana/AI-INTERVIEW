import * as React from "react";
import { Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id?: string;
  role: "assistant" | "interviewer" | "user" | "candidate" | "system";
  content: string;
  timestamp?: string | Date;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  className?: string;
}

export function ChatBubble({ message, className }: ChatBubbleProps) {
  const isAI =
    message.role === "assistant" ||
    message.role === "interviewer" ||
    message.role === "system";

  const formattedTime = React.useMemo(() => {
    if (!message.timestamp) return null;
    const date =
      typeof message.timestamp === "string"
        ? new Date(message.timestamp)
        : message.timestamp;
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [message.timestamp]);

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-2 text-sm sm:text-base",
        isAI ? "justify-start" : "justify-end",
        className
      )}
    >
      {/* AI Avatar */}
      {isAI && (
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-xs"
        >
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col space-y-1",
          isAI ? "items-start" : "items-end"
        )}
      >
        {/* Header / Author Label */}
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          {isAI ? (
            <span className="flex items-center gap-1 font-semibold text-foreground/90">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Interviewer
            </span>
          ) : (
            <span className="font-semibold text-foreground/90">You</span>
          )}
          {formattedTime && <span>{formattedTime}</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative max-w-[88%] sm:max-w-[80%] md:max-w-[72%] rounded-2xl px-4 py-3 shadow-xs break-words whitespace-pre-wrap leading-relaxed",
            isAI
              ? "rounded-tl-xs border border-border/80 bg-card text-card-foreground"
              : "rounded-tr-xs bg-primary text-primary-foreground shadow-sm"
          )}
        >
          {message.content}
        </div>
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground shadow-xs"
        >
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

export default ChatBubble;
