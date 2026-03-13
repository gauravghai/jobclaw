"use client";

import { SidebarMode, Job } from "@/lib/types";
import { COUNTRY_FLAGS } from "@/lib/constants";
import JobList from "./JobList";
import JobDetail from "./JobDetail";

interface SidebarProps {
  mode: SidebarMode;
  selectedCountry: string | null;
  selectedCountryName: string | null;
  countryJobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  activeFilterCount: number;
  onJobSelect: (job: Job) => void;
  onBack: () => void;
  onClose: () => void;
  onFilterClick: () => void;
}

export default function Sidebar({
  mode,
  selectedCountry,
  selectedCountryName,
  countryJobs,
  selectedJob,
  isLoading,
  activeFilterCount,
  onJobSelect,
  onBack,
  onClose,
  onFilterClick,
}: SidebarProps) {
  const isOpen = mode !== "closed";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-[#12121A]/95 backdrop-blur-xl border-l border-[#1E1E2E] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
            <div className="flex items-center gap-3">
              {mode === "job-detail" && (
                <button
                  onClick={onBack}
                  className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors p-1"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div>
                {mode === "country-list" && selectedCountry && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {COUNTRY_FLAGS[selectedCountry] || ""}
                    </span>
                    <div>
                      <h2 className="text-[#F0F0F5] text-base font-semibold">
                        {selectedCountryName || selectedCountry}
                      </h2>
                      <p className="text-[#8888A0] text-xs">
                        {countryJobs.length} jobs available
                      </p>
                    </div>
                  </div>
                )}
                {mode === "job-detail" && (
                  <h2 className="text-[#F0F0F5] text-base font-semibold">
                    Job Details
                  </h2>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === "country-list" && (
                <button
                  onClick={onFilterClick}
                  className={`border rounded-lg px-3 py-1.5 transition-all text-xs font-medium flex items-center gap-1.5 ${
                    activeFilterCount > 0
                      ? "border-[#00E5A0]/40 text-[#00E5A0]"
                      : "border-[#1E1E2E] hover:border-[#00E5A0]/30 text-[#8888A0] hover:text-[#00E5A0]"
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
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
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="bg-[#00E5A0] text-[#0A0A0F] text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors p-1"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-[#1E1E2E] rounded-lg" />
                  </div>
                ))}
              </div>
            )}
            {!isLoading && mode === "country-list" && (
              <JobList jobs={countryJobs} onJobSelect={onJobSelect} />
            )}
            {!isLoading && mode === "job-detail" && selectedJob && (
              <JobDetail job={selectedJob} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
