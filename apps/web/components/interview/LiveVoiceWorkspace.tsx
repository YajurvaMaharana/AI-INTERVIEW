"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  RotateCcw,
  SendHorizontal,
  Volume2,
  Sparkles,
  AlertCircle,
  Clock,
  Gauge,
  CheckCircle2,
  Edit3,
  Flame,
  HelpCircle,
  RefreshCw,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder, RecordingState } from "@/hooks/useVoiceRecorder";
import { cn } from "@/lib/utils";

interface LiveVoiceWorkspaceProps {
  onSendAnswer: (text: string) => Promise<void> | void;
  disabled?: boolean;
  contextRole?: string;
  onSwitchToTextMode?: () => void;
  className?: string;
}

export function LiveVoiceWorkspace({
  onSendAnswer,
  disabled = false,
  contextRole,
  onSwitchToTextMode,
  className,
}: LiveVoiceWorkspaceProps) {
  const {
    recordingState,
    transcript,
    setTranscript,
    interimTranscript,
    durationSeconds,
    audioLevel,
    audioUrl,
    errorMessage,
    metrics,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardAndReset,
  } = useVoiceRecorder({ contextRole });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAudioPlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  const handleSubmit = async () => {
    const textToSubmit = (transcript || interimTranscript).trim();
    if (!textToSubmit || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSendAnswer(textToSubmit);
      discardAndReset();
    } catch (err) {
      console.error("Failed to submit spoken answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get WPM pacing badge
  const getPacingFeedback = (wpm: number) => {
    if (wpm === 0) return { label: "Ready", color: "text-slate-400 bg-slate-100 dark:bg-slate-800" };
    if (wpm < 115) return { label: "Deliberate Pace", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
    if (wpm <= 165) return { label: "Optimal Cadence", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" };
    return { label: "Fast Pace (Slow Down)", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200" };
  };

  const pacing = getPacingFeedback(metrics.estimatedWpm);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 dark:border-[#222B3A] bg-white dark:bg-[#151922] shadow-sm p-4 sm:p-5 transition-all",
        className
      )}
    >
      {/* ── Header: Mode Bar & Status ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Live Speech-to-Text Workspace
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Audio Pipeline Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Speak your technical answer aloud. Review, edit, or re-record before submitting.
            </p>
          </div>
        </div>

        {/* Text Mode Switcher */}
        {onSwitchToTextMode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchToTextMode}
            className="text-xs text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 gap-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-800"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Switch to Text / Code Mode
          </Button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="my-3 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Microphone Notice: </span>
            {errorMessage}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="shrink-0 h-7 text-[11px] border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Try Again
          </Button>
        </div>
      )}

      {/* ── Main Voice Interaction Area ── */}
      <div className="py-4 space-y-4">
        {/* State 1: IDLE */}
        {recordingState === "idle" && (
          <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
            <div className="relative mb-3">
              <button
                type="button"
                id="start-voice-recording-button"
                onClick={startRecording}
                disabled={disabled}
                aria-label="Start recording speech"
                className="group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic className="h-7 w-7 transition-transform group-hover:scale-110" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Click to Start Speaking Your Answer
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Speak naturally as you would in a real live interview. AscendX will stream your transcription in real-time.
            </p>
          </div>
        )}

        {/* State 2 & 3: RECORDING or PAUSED */}
        {(recordingState === "recording" || recordingState === "paused") && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/10 p-4 space-y-4">
            {/* Live Audio Visualizer & Waveform */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-1.5 h-12 px-4 py-2">
                {[...Array(16)].map((_, i) => {
                  // Dynamic height calculation based on audio level and index
                  const variance = Math.sin(i * 0.4 + Date.now() * 0.005) * 20;
                  const activeHeight =
                    recordingState === "recording"
                      ? Math.max(6, Math.min(44, (audioLevel * (0.6 + (i % 5) * 0.15)) + variance))
                      : 6;

                  return (
                    <span
                      key={i}
                      className={cn(
                        "w-1.5 rounded-full transition-all duration-75",
                        recordingState === "recording"
                          ? "bg-gradient-to-t from-orange-500 to-amber-400 shadow-2xs"
                          : "bg-slate-300 dark:bg-slate-700"
                      )}
                      style={{ height: `${activeHeight}px` }}
                    />
                  );
                })}
              </div>

              {/* Status & Timer */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                    recordingState === "recording"
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-amber-500 text-white"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                  {recordingState === "recording" ? "LIVE RECORDING" : "PAUSED"}
                </span>

                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  <span>{formatTime(durationSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Live Real-time Streaming Transcript Box */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 min-h-[90px] shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Real-Time Transcription Stream</span>
                <span className="text-orange-500 lowercase">streaming audio...</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {transcript}
                <span className="text-orange-600 dark:text-orange-400 font-medium ml-1">
                  {interimTranscript}
                </span>
                {recordingState === "recording" && (
                  <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1 align-middle" />
                )}
                {!transcript && !interimTranscript && (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    Listening to your voice... start speaking your answer.
                  </span>
                )}
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {recordingState === "recording" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={pauseRecording}
                    className="gap-1.5 text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resumeRecording}
                    className="gap-1.5 text-xs rounded-xl border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                  >
                    <Play className="h-3.5 w-3.5" /> Resume
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={discardAndReset}
                  className="gap-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                  title="Discard recording and start over"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Discard
                </Button>
              </div>

              <Button
                type="button"
                id="finish-recording-button"
                onClick={stopRecording}
                className="gap-1.5 text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-xs"
              >
                <Square className="h-3.5 w-3.5 fill-current" /> Finish & Review Transcript
              </Button>
            </div>
          </div>
        )}

        {/* State 4: TRANSCRIBING */}
        {recordingState === "transcribing" && (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md animate-spin">
              <Loader2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Processing Technical Audio Transcription...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Calibrating terminology, algorithmic terms, and syntax accuracy with AI models.
              </p>
            </div>
          </div>
        )}

        {/* State 5: REVIEWING (Retry & Correction Workflow) */}
        {recordingState === "reviewing" && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-4">
            {/* Review Header with Delivery Cadence Analytics */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Transcribed Answer Ready
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{metrics.wordCount} words ({formatTime(durationSeconds)})</span>
              </div>

              {/* Delivery Analytics Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* WPM Pacing */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border",
                    pacing.color
                  )}
                >
                  <Gauge className="h-3 w-3" />
                  {metrics.estimatedWpm} WPM ({pacing.label})
                </span>

                {/* Filler Words */}
                {metrics.fillerWordsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Flame className="h-3 w-3" />
                    {metrics.fillerWordsCount} filler {metrics.fillerWordsCount === 1 ? "word" : "words"} ({metrics.fillerWordsFound.slice(0, 3).join(", ")})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="h-3 w-3" />
                    Crisp delivery (0 fillers)
                  </span>
                )}
              </div>
            </div>

            {/* Audio Playback Bar */}
            {audioUrl && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAudioPlayToggle}
                    className="h-8 w-8 p-0 rounded-full border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                    aria-label={isPlayingAudio ? "Pause playback" : "Play recording"}
                  >
                    {isPlayingAudio ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                  </Button>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {isPlayingAudio ? "Playing Answer Audio..." : "Listen to Your Recording"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{formatTime(durationSeconds)} duration</p>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              </div>
            )}

            {/* Editable & Refineable Transcript Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <label htmlFor="voice-transcript-editor" className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Edit3 className="h-3.5 w-3.5 text-orange-500" />
                  Review & Polish Your Answer (Click to edit text)
                </label>
                <span className="text-[11px] text-slate-400">Feel free to refine code names or details</span>
              </div>
              <textarea
                id="voice-transcript-editor"
                ref={textareaRef}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={isSubmitting || disabled}
                rows={3}
                placeholder="Transcribed response will appear here..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white leading-relaxed outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-y min-h-[80px]"
              />
            </div>

            {/* Actions: Retry / Discard & Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                id="voice-retry-recording-button"
                variant="outline"
                size="sm"
                onClick={discardAndReset}
                disabled={isSubmitting}
                className="gap-1.5 text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Discard & Re-record
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  id="submit-voice-answer-button"
                  onClick={handleSubmit}
                  disabled={!transcript.trim() || isSubmitting || disabled}
                  className="gap-2 text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-sm px-4 py-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Evaluating Answer...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="h-3.5 w-3.5" />
                      Submit Spoken Answer to AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveVoiceWorkspace;
