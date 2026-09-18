"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Gauge,
  Radio,
  ArrowRight,
  CheckCircle2,
  Sliders,
  MessageSquare,
  Zap,
  Target,
  Bot,
  Brain,
  Award,
} from "lucide-react";
import { LiveVoiceWorkspace } from "@/components/interview/LiveVoiceWorkspace";
import { InterviewerAudioPlayer } from "@/components/interview/InterviewerAudioPlayer";
import {
  TechGrinderAvatar,
  HRPartnerAvatar,
  SimulationBossAvatar,
  SupportiveMentorAvatar,
} from "@/components/interview/PersonaAvatars";
import { useTextToSpeech, type PlaybackSpeed } from "@/hooks/useTextToSpeech";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PersonaOption {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarComponent: React.ComponentType<{ className?: string }>;
  tone: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "tech-grinder",
    name: "Alex Vance",
    role: "Senior Staff Engineer",
    description: "Deep technical probing, architectural rigor, and scale constraints.",
    avatarComponent: TechGrinderAvatar,
    tone: "Analytical & Direct",
  },
  {
    id: "hr-partner",
    name: "Sarah Jenkins",
    role: "Global Talent Lead",
    description: "Behavioral STAR method, culture alignment, and leadership adaptability.",
    avatarComponent: HRPartnerAvatar,
    tone: "Empathetic & Structured",
  },
  {
    id: "simulation-boss",
    name: "Marcus Sterling",
    role: "VP of Engineering",
    description: "Executive trade-offs, business value impact, and high-pressure scenarios.",
    avatarComponent: SimulationBossAvatar,
    tone: "Executive & Demanding",
  },
  {
    id: "supportive-mentor",
    name: "Elena Rostova",
    role: "Engineering Director",
    description: "Constructive hints, career trajectory focus, and collaborative guidance.",
    avatarComponent: SupportiveMentorAvatar,
    tone: "Mentorship & Warm",
  },
];

const SAMPLE_QUESTIONS = [
  {
    category: "System Design",
    text: "How would you design a distributed, idempotent payment processing system that guarantees zero double-charges across multi-region cloud outages?",
  },
  {
    category: "Technical Deep-Dive",
    text: "Can you walk me through how JavaScript's event loop handles microtasks versus macrotasks when combining Promise.resolve, setTimeout, and requestAnimationFrame?",
  },
  {
    category: "Behavioral STAR",
    text: "Tell me about a high-severity production outage you resolved under pressure. How did you communicate trade-offs to non-technical executive stakeholders?",
  },
  {
    category: "Algorithms & Scale",
    text: "Suppose you have a stream of 100 million transactions per second. What data structure and probabilistic algorithms would you use to estimate top-k heavy hitters with minimal memory overhead?",
  },
];

export default function VoiceCoachPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption>(PERSONAS[0]);
  const [customQuestionText, setCustomQuestionText] = useState(SAMPLE_QUESTIONS[0].text);
  const [userSpokenAnswers, setUserSpokenAnswers] = useState<
    Array<{ text: string; timestamp: Date; duration?: string }>
  >([]);

  const tts = useTextToSpeech({
    defaultAutoPlay: true,
    defaultRate: 1.0,
    personaId: selectedPersona.id,
  });

  const handleSelectPersona = (p: PersonaOption) => {
    setSelectedPersona(p);
    tts.stop();
  };

  const handlePlayQuestion = (text: string) => {
    tts.speak(text);
  };

  const handleSendSpokenAnswer = (text: string) => {
    setUserSpokenAnswers((prev) => [
      { text, timestamp: new Date() },
      ...prev,
    ]);
  };

  const handleLaunchFullLiveInterview = () => {
    tts.stop();
    router.push(`/interview/new?modality=voice&persona=${selectedPersona.id}`);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF2] dark:bg-[#0B0F15] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-[#181E29] text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                <AudioLines className="w-3.5 h-3.5" />
                Interviewer Text-to-Speech & Speech-to-Text Studio
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Voice & Speech Delivery Coach
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Experience realistic, hands-free spoken interviews. Listen to AI interviewer questions with dynamic persona voices, adjust playback pacing, and calibrate your spoken answers in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                type="button"
                id="voice-coach-launch-interview"
                size="lg"
                onClick={handleLaunchFullLiveInterview}
                className="gap-2 font-bold bg-gradient-to-r from-[#E8602E] to-[#F17E45] hover:from-[#d55323] hover:to-[#df6e35] text-white rounded-2xl shadow-lg shadow-orange-500/20"
              >
                <Mic className="w-4 h-4" />
                Start Live Voice Interview
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Global TTS Audio Player Bar */}
        <InterviewerAudioPlayer
          isSpeaking={tts.isSpeaking}
          isPaused={tts.isPaused}
          isMuted={tts.isMuted}
          rate={tts.rate}
          autoPlayEnabled={tts.autoPlayEnabled}
          onPlayPauseToggle={() => {
            if (tts.isSpeaking && !tts.isPaused) {
              tts.pause();
            } else if (tts.isPaused) {
              tts.resume();
            } else {
              tts.speak(customQuestionText);
            }
          }}
          onReplay={() => tts.replay(customQuestionText)}
          onToggleMute={tts.toggleMute}
          onSpeedChange={tts.setRate}
          onToggleAutoPlay={() => tts.setAutoPlayEnabled(!tts.autoPlayEnabled)}
          personaName={selectedPersona.name}
          hasSpokenText={Boolean(customQuestionText)}
        />

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: TTS Persona & Question Engine (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Voice Persona Selection */}
            <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Select Interviewer Voice Persona
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">4 AI Personas</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PERSONAS.map((p) => {
                  const AvatarComp = p.avatarComponent;
                  const isSelected = selectedPersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={cn(
                        "flex items-start gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/20 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#181E29]/50"
                      )}
                    >
                      <AvatarComp className="w-11 h-11 shrink-0 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            {p.tone}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-orange-600 dark:text-orange-400">
                          {p.role}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {p.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Sample Question Generator & Tester */}
            <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Prompt & Question Player
                  </h2>
                </div>
              </div>

              {/* Sample Preset Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Test Realistic Prompts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q.category}
                      type="button"
                      onClick={() => {
                        setCustomQuestionText(q.text);
                        handlePlayQuestion(q.text);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                        customQuestionText === q.text
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 font-bold"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181E29]"
                      )}
                    >
                      <div className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase">
                        {q.category}
                      </div>
                      <div className="truncate mt-0.5">{q.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Question / Interviewer Text
                </label>
                <textarea
                  value={customQuestionText}
                  onChange={(e) => setCustomQuestionText(e.target.value)}
                  rows={3}
                  className="w-full text-xs sm:text-sm rounded-2xl p-3 bg-slate-50 dark:bg-[#181E29] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  placeholder="Type any interview question to hear it spoken aloud..."
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Radio className={cn("h-3.5 w-3.5", tts.isSpeaking && "text-orange-500 animate-pulse")} />
                    <span>Speed: {tts.rate}x</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => tts.replay(customQuestionText)}
                      disabled={!customQuestionText.trim()}
                      className="gap-1.5 text-xs rounded-xl"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Replay
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handlePlayQuestion(customQuestionText)}
                      disabled={!customQuestionText.trim()}
                      className="gap-1.5 text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-xs"
                    >
                      {tts.isSpeaking && !tts.isPaused ? (
                        <>
                          <Pause className="h-3 w-3" /> Pause Voice
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" /> Speak Question
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Voice Delivery & Speech Calibration (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      3. Spoken Response & Delivery Calibration
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Respond to the interviewer prompt above to test technical pacing and filler word density.
                    </p>
                  </div>
                </div>
              </div>

              {/* Spoken Response Workspace */}
              <LiveVoiceWorkspace
                onSendAnswer={handleSendSpokenAnswer}
                contextRole="Software Engineer"
              />

              {/* Recorded Practice Takes */}
              {userSpokenAnswers.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    Spoken Delivery Takes ({userSpokenAnswers.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {userSpokenAnswers.map((item, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-[#181E29] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            Take #{userSpokenAnswers.length - index}
                          </span>
                          <span>{item.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
