import * as React from "react";
import { Bot, User, Sparkles, Volume2, VolumeX } from "lucide-react";
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
  onSpeak?: (text: string) => void;
  isCurrentlySpeaking?: boolean;
}

export function ChatBubble({
  message,
  className,
  onSpeak,
  isCurrentlySpeaking = false,
}: ChatBubbleProps) {
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
        "flex w-full gap-3 py-2 text-sm sm:text-base group",
        isAI ? "justify-start" : "justify-end",
        className
      )}
    >
      {/* AI Avatar */}
      {isAI && (
        <div
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border shadow-xs transition-colors",
            isCurrentlySpeaking
              ? "bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white border-orange-500 animate-pulse"
              : "border-primary/25 bg-primary/10 text-primary"
          )}
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
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-foreground/90">
                <Sparkles className="h-3 w-3 text-primary" />
                AscendX Interviewer
              </span>

              {/* Inline Speak / Replay Trigger */}
              {onSpeak && (
                <button
                  type="button"
                  onClick={() => onSpeak(message.content)}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    isCurrentlySpeaking
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold"
                      : "text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
                  )}
                  title={isCurrentlySpeaking ? "Currently speaking this message" : "Listen to question"}
                >
                  <Volume2 className={cn("h-3 w-3", isCurrentlySpeaking && "animate-pulse text-orange-500")} />
                  <span>{isCurrentlySpeaking ? "Speaking" : "Listen"}</span>
                </button>
              )}
            </div>
          ) : (
            <span className="font-semibold text-foreground/90">You</span>
          )}
          {formattedTime && <span>{formattedTime}</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative max-w-[88%] sm:max-w-[80%] md:max-w-[72%] rounded-2xl px-4 py-3 shadow-xs break-words whitespace-pre-wrap leading-relaxed transition-all",
            isAI
              ? isCurrentlySpeaking
                ? "rounded-tl-xs border-2 border-orange-500/60 bg-orange-500/5 text-card-foreground shadow-sm ring-2 ring-orange-500/10"
                : "rounded-tl-xs border border-border/80 bg-card text-card-foreground"
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
