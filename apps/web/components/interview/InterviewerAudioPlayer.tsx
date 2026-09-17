"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Gauge,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlaybackSpeed } from "@/hooks/useTextToSpeech";

interface InterviewerAudioPlayerProps {
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  rate: PlaybackSpeed;
  autoPlayEnabled: boolean;
  onPlayPauseToggle: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  onSpeedChange: (rate: PlaybackSpeed) => void;
  onToggleAutoPlay: () => void;
  personaName?: string;
  hasSpokenText?: boolean;
  className?: string;
  compact?: boolean;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5];

export function InterviewerAudioPlayer({
  isSpeaking,
  isPaused,
  isMuted,
  rate,
  autoPlayEnabled,
  onPlayPauseToggle,
  onReplay,
  onToggleMute,
  onSpeedChange,
  onToggleAutoPlay,
  personaName = "AI Interviewer",
  hasSpokenText = true,
  className,
  compact = false,
}: InterviewerAudioPlayerProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs",
          className
        )}
      >
        {/* Play/Pause Button */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onPlayPauseToggle}
          disabled={!hasSpokenText}
          className="h-7 w-7 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-700"
          title={isSpeaking && !isPaused ? "Pause Audio" : "Play Question Audio"}
        >
          {isSpeaking && !isPaused ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Replay */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onReplay}
          disabled={!hasSpokenText}
          className="h-7 w-7 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-700"
          title="Replay Question"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        {/* Mute */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onToggleMute}
          className={cn(
            "h-7 w-7 p-0 rounded-lg transition-colors",
            isMuted
              ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
              : "text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-700"
          )}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Speed Selector */}
        <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",
                rate === s
                  ? "bg-orange-500 text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50/30 dark:from-[#181E29] dark:to-[#1C2230] border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all",
        className
      )}
    >
      {/* Left: Persona & Speaking Status with Equalizer */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
            isSpeaking && !isPaused
              ? "bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-xs animate-pulse"
              : isMuted
              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
          )}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {personaName} Voice
            </span>

            {/* Speaking equalizer animation */}
            {isSpeaking && !isPaused && (
              <div className="flex items-center gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30">
                <span className="w-1 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-2 bg-orange-500 rounded-full animate-bounce" />
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 ml-1">
                  Speaking Question...
                </span>
              </div>
            )}

            {isPaused && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Audio Paused
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {autoPlayEnabled
              ? "Hands-free speech active (Auto-reads each question)"
              : "Click play to listen to questions aloud"}
          </p>
        </div>
      </div>

      {/* Right: Audio Playback Controls & Speed Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Play / Pause */}
        <Button
          type="button"
          id="tts-play-pause-button"
          size="sm"
          variant="outline"
          onClick={onPlayPauseToggle}
          disabled={!hasSpokenText}
          className="gap-1.5 h-8 text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-slate-800"
          title={isSpeaking && !isPaused ? "Pause Question" : "Play Question Audio"}
        >
          {isSpeaking && !isPaused ? (
            <>
              <Pause className="h-3.5 w-3.5 text-orange-500" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20" />
              <span>Play Question</span>
            </>
          )}
        </Button>

        {/* Replay */}
        <Button
          type="button"
          id="tts-replay-button"
          size="sm"
          variant="outline"
          onClick={onReplay}
          disabled={!hasSpokenText}
          className="gap-1.5 h-8 text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-slate-800"
          title="Replay from Beginning"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Replay</span>
        </Button>

        {/* Mute Toggle */}
        <Button
          type="button"
          id="tts-mute-toggle-button"
          size="sm"
          variant="ghost"
          onClick={onToggleMute}
          className={cn(
            "h-8 px-2.5 text-xs rounded-xl transition-all",
            isMuted
              ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"
              : "text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
          )}
          title={isMuted ? "Unmute Interviewer" : "Mute Interviewer"}
        >
          {isMuted ? (
            <span className="flex items-center gap-1 font-semibold text-rose-500">
              <VolumeX className="h-3.5 w-3.5" /> Muted
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" /> Mute
            </span>
          )}
        </Button>

        {/* Speed Adjustment Settings (0.75x, 1x, 1.25x, 1.5x) */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <Gauge className="h-3 w-3 text-slate-400 ml-1" />
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => onSpeedChange(speed)}
              className={cn(
                "px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                rate === speed
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Hands-Free Auto-Speak Toggle */}
        <button
          type="button"
          id="tts-handsfree-toggle"
          onClick={onToggleAutoPlay}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
            autoPlayEnabled
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white"
          )}
          title="Toggle Hands-Free Spoken Questions"
        >
          <Radio className={cn("h-3.5 w-3.5", autoPlayEnabled && "text-emerald-500 animate-pulse")} />
          <span className="hidden md:inline">Hands-Free:</span>
          <span>{autoPlayEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}

export default InterviewerAudioPlayer;
