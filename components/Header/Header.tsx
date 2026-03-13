"use client";

interface HeaderProps {
  totalJobs: number;
  totalCountries: number;
  activeFilterCount: number;
  onFilterClick: () => void;
}

export default function Header({
  totalJobs,
  totalCountries,
  activeFilterCount,
  onFilterClick,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="pointer-events-auto">
          <div className="flex items-center gap-3 bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-2xl px-5 py-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5A0] to-[#00B37D] flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A0A0F"
                strokeWidth={2.5}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[#F0F0F5] text-base font-bold tracking-tight">
                JobClaw
              </h1>
              <p className="text-[#8888A0] text-[10px] tracking-wider uppercase">
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

        {/* Stats + Filter */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-2xl px-4 py-2.5 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[#00E5A0] text-lg font-bold tabular-nums">
                {totalJobs.toLocaleString()}
              </p>
              <p className="text-[#8888A0] text-[9px] uppercase tracking-widest">
                Jobs
              </p>
            </div>
            <div className="w-px h-8 bg-[#1E1E2E]" />
            <div className="text-center">
              <p className="text-[#FF4D4D] text-lg font-bold tabular-nums">
                {totalCountries}
              </p>
              <p className="text-[#8888A0] text-[9px] uppercase tracking-widest">
                Countries
              </p>
            </div>
          </div>
          <button
            onClick={onFilterClick}
            className={`bg-[#12121A]/80 backdrop-blur-xl border rounded-2xl px-4 py-3 transition-all text-xs font-medium flex items-center gap-2 ${
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
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-[#00E5A0] text-[#0A0A0F] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
