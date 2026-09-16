"use client";

import React, { useState, useRef } from "react";
import { FileText, Upload, CheckCircle2, X } from "lucide-react";

interface ResumeJDCardProps {
  onResumeUpload?: (fileName: string) => void;
}

export default function ResumeJDCard({ onResumeUpload }: ResumeJDCardProps) {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isStatusOn, setIsStatusOn] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      onResumeUpload?.(file.name);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full border border-dashed border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-[#181E29] hover:bg-white dark:hover:bg-[#1C2330] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group shadow-2xs hover:border-[#E87A42]/60"
      >
        {/* Document Icon */}
        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#12161F] flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:text-[#E87A42] mb-1.5 transition-colors">
          <FileText className="w-5 h-5 stroke-[1.5]" />
        </div>

        {/* Text */}
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {uploadedFileName ? uploadedFileName : "Drop Resume (PDF) & Paste JD"}
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
            Drop Resume (PDF) & Paste JD
          </p>
        </div>

        {/* Status Badge */}
        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isStatusOn ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
          <span>Status: {isStatusOn ? "on" : "off"}</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Interactive Modal for Grounding */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181E29] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E87A42]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Resume & Job Description Grounding
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* PDF Dropzone */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Candidate Resume (PDF)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#E87A42] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#12161F]"
                >
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {uploadedFileName || "Click to browse or drop your resume PDF here"}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, DOCX up to 10MB</p>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Job Description / Tech Stack Requirements
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description, required seniority level, and key engineering competencies..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12161F] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#E87A42]/30 focus:border-[#E87A42]"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Enable AI Grounding during live questions
                </span>
                <button
                  type="button"
                  onClick={() => setIsStatusOn(!isStatusOn)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isStatusOn ? "bg-[#E87A42]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isStatusOn ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href="/resume-jd-grounding"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-[#E87A42] hover:text-[#d86932] hover:underline flex items-center gap-1"
              >
                <span>View Full Gap Analysis Matrix →</span>
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#E87A42] hover:bg-[#d86932] shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Grounding Context</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
