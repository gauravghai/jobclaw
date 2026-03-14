"use client";

import { ResumeData } from "@/lib/types";

interface HeaderProps {
  totalJobs: number;
  totalCountries: number;
  activeFilterCount: number;
  onFilterClick: () => void;
  onAIClick: () => void;
  aiConnected: boolean;
  aiMatching: boolean;
  resumeData: ResumeData | null;
  onResumeBadgeClick: () => void;
}

export default function Header({
  totalJobs,
  totalCountries,
  activeFilterCount,
  onFilterClick,
  onAIClick,
  aiConnected,
  aiMatching,
  resumeData,
  onResumeBadgeClick,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      {/* Row 1: Logo + Actions */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 gap-2">
        {/* Logo */}
        <div className="pointer-events-auto flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-2xl px-3 sm:px-5 py-2 sm:py-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00E5A0] to-[#00B37D] flex items-center justify-center flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A0A0F"
                strokeWidth={2.5}
                className="sm:w-[18px] sm:h-[18px]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[#F0F0F5] text-sm sm:text-base font-bold tracking-tight">
                JobClaw
              </h1>
              <p className="text-[#8888A0] text-[8px] sm:text-[10px] tracking-wider uppercase hidden sm:block">
                Global Talent Explorer by{" "}
                <a
                  href="https://www.linkedin.com/in/gauravvghai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00E5A0] hover:underline"
                >
                  Gaurav Ghai
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Resume Badge — hidden on mobile, shown on sm+ */}
        {resumeData && (
          <div className="pointer-events-auto hidden md:block">
            <button
              onClick={onResumeBadgeClick}
              className="bg-[#12121A]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-3 hover:border-purple-500/50 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[#F0F0F5] text-xs font-medium leading-tight group-hover:text-purple-300 transition-colors">
                  {resumeData.name || "Resume"}
                </p>
                <p className="text-[#8888A0] text-[9px]">
                  {resumeData.skills.length} skills extracted
                </p>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8888A0"
                strokeWidth={2}
                className="ml-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Right: Stats + Filter + AI */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Stats — compact on mobile */}
          <div className="bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-[#00E5A0] text-sm sm:text-lg font-bold tabular-nums">
                {totalJobs.toLocaleString()}
              </p>
              <p className="text-[#8888A0] text-[7px] sm:text-[9px] uppercase tracking-widest">
                Jobs
              </p>
            </div>
            <div className="w-px h-6 sm:h-8 bg-[#1E1E2E]" />
            <div className="text-center">
              <p className="text-[#FF4D4D] text-sm sm:text-lg font-bold tabular-nums">
                {totalCountries}
              </p>
              <p className="text-[#8888A0] text-[7px] sm:text-[9px] uppercase tracking-widest">
                Countries
              </p>
            </div>
          </div>

          {/* Filter button — icon only on mobile */}
          <button
            onClick={onFilterClick}
            className={`bg-[#12121A]/80 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-4 py-2.5 sm:py-3 transition-all text-xs font-medium flex items-center gap-2 ${
              activeFilterCount > 0
                ? "border-[#00E5A0]/40 text-[#00E5A0]"
                : "border-[#1E1E2E] hover:border-[#00E5A0]/30 text-[#8888A0] hover:text-[#00E5A0]"
            }`}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#00E5A0] text-[#0A0A0F] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* AI Button — icon only on mobile */}
          <button
            onClick={onAIClick}
            className={`bg-[#12121A]/80 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-4 py-2.5 sm:py-3 transition-all text-xs font-medium flex items-center gap-2 ${
              aiConnected
                ? "border-purple-500/40 text-purple-400"
                : "border-[#1E1E2E] hover:border-purple-500/30 text-[#8888A0] hover:text-purple-400"
            }`}
          >
            {aiMatching ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            )}
            <span className="hidden sm:inline">AI</span>
            {aiConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0]" />
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Resume badge on mobile (below header row) */}
      {resumeData && (
        <div className="pointer-events-auto px-3 pb-2 md:hidden">
          <button
            onClick={onResumeBadgeClick}
            className="bg-[#12121A]/80 backdrop-blur-xl border border-purple-500/30 rounded-xl px-3 py-2 flex items-center gap-2 hover:border-purple-500/50 transition-all group w-full"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-[#F0F0F5] text-[11px] font-medium leading-tight truncate group-hover:text-purple-300 transition-colors">
                {resumeData.name || "Resume"} — {resumeData.skills.length} skills
              </p>
            </div>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8888A0"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
