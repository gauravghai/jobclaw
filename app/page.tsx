"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import GlobeCanvas from "@/components/Globe/GlobeCanvas";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import FilterDialog, {
  FilterState,
  EMPTY_FILTERS,
} from "@/components/Filter/FilterDialog";
import AIPanel from "@/components/AI/AIPanel";
import PrivacyBanner from "@/components/AI/PrivacyBanner";
import EmailGate from "@/components/Auth/EmailGate";
import { useGlobeState } from "@/hooks/useGlobeState";
import { JobPin, CountryJobCount, ResumeData } from "@/lib/types";

export default function Home() {
  const [allPins, setAllPins] = useState<JobPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  // AI state
  const [aiKey, setAiKey] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiMatching, setAiMatching] = useState(false);
  const [aiGateOpen, setAiGateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    state,
    selectCountry,
    selectJob,
    selectJobFromList,
    backToList,
    closeSidebar,
  } = useGlobeState(filters);

  // Load jobs
  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        setAllPins(data.pins || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load AI state from localStorage
  useEffect(() => {
    const key = localStorage.getItem("jobclaw_ai_key");
    const resume = localStorage.getItem("jobclaw_resume");
    const role = localStorage.getItem("jobclaw_target_role");
    const scores = localStorage.getItem("jobclaw_match_scores");
    if (key) setAiKey(key);
    if (resume) {
      try {
        setResumeData(JSON.parse(resume));
      } catch {
        /* ignore */
      }
    }
    if (role) setTargetRole(role);
    if (scores) {
      try {
        setMatchScores(JSON.parse(scores));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Apply filters to pins
  const filteredPins = useMemo(() => {
    let result = allPins;

    if (filters.countries.length > 0) {
      result = result.filter((p) => filters.countries.includes(p.job_country));
    }

    if (filters.roles.length > 0) {
      const lowerRoles = filters.roles.map((r) => r.toLowerCase());
      result = result.filter((p) =>
        lowerRoles.some((role) => p.job_title.toLowerCase().includes(role))
      );
    }

    if (filters.remote) {
      result = result.filter((p) => p.job_is_remote);
    }

    if (filters.internship) {
      result = result.filter(
        (p) =>
          p.job_employment_type?.toLowerCase().includes("intern") ||
          p.job_title.toLowerCase().includes("intern")
      );
    }

    return result;
  }, [allPins, filters]);

  // Derive country counts from filtered pins
  const countryCounts = useMemo(() => {
    const map = new Map<string, number>();
    filteredPins.forEach((p) => {
      map.set(p.job_country, (map.get(p.job_country) || 0) + 1);
    });
    const counts: CountryJobCount[] = [];
    map.forEach((count, country) => counts.push({ country, count }));
    return counts;
  }, [filteredPins]);

  const totalJobs = filteredPins.length;
  const totalCountries = countryCounts.length;

  // Extract unique roles and countries for filter options
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    allPins.forEach((p) => {
      const title = p.job_title.toLowerCase();
      const keywords = [
        "Data Analyst",
        "AI Engineer",
        "Business Analyst",
        "Software Developer",
        "Software Engineer",
        "Digital Marketing",
        "Product Manager",
        "UX Designer",
        "DevOps Engineer",
        "Cybersecurity",
        "Frontend",
        "Backend",
        "Full Stack",
        "Data Scientist",
        "Machine Learning",
        "Cloud Engineer",
        "QA Engineer",
        "Mobile Developer",
        "Intern",
      ];
      keywords.forEach((kw) => {
        if (title.includes(kw.toLowerCase())) roles.add(kw);
      });
    });
    return Array.from(roles).sort();
  }, [allPins]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    allPins.forEach((p) => countries.add(p.job_country));
    return Array.from(countries).sort();
  }, [allPins]);

  const activeFilterCount =
    filters.roles.length +
    filters.countries.length +
    (filters.remote ? 1 : 0) +
    (filters.internship ? 1 : 0);

  const handleFilterClick = useCallback(() => setFilterOpen(true), []);

  // AI handlers
  const handleAIClick = useCallback(() => {
    const verified = localStorage.getItem("jobclaw_verified") === "true";
    if (!verified) {
      setAiGateOpen(true);
    } else {
      setAiPanelOpen(true);
    }
  }, []);

  const handleAiVerified = useCallback(() => {
    setAiGateOpen(false);
    setAiPanelOpen(true);
  }, []);

  const handleKeySet = useCallback((key: string) => {
    setAiKey(key);
    localStorage.setItem("jobclaw_ai_key", key);
  }, []);

  const handleKeyDelete = useCallback(() => {
    setAiKey(null);
    localStorage.removeItem("jobclaw_ai_key");
  }, []);

  const handleResumeExtracted = useCallback((data: ResumeData) => {
    setResumeData(data);
    localStorage.setItem("jobclaw_resume", JSON.stringify(data));
  }, []);

  const handleResumeDelete = useCallback(() => {
    setResumeData(null);
    setMatchScores({});
    localStorage.removeItem("jobclaw_resume");
    localStorage.removeItem("jobclaw_match_scores");
  }, []);

  const handleTargetRoleSet = useCallback((role: string) => {
    setTargetRole(role);
    localStorage.setItem("jobclaw_target_role", role);
  }, []);

  const handleReset = useCallback(() => {
    setAiKey(null);
    setResumeData(null);
    setTargetRole("");
    setMatchScores({});
    localStorage.removeItem("jobclaw_ai_key");
    localStorage.removeItem("jobclaw_resume");
    localStorage.removeItem("jobclaw_target_role");
    localStorage.removeItem("jobclaw_match_scores");
  }, []);

  const matchCount = useMemo(
    () => Object.values(matchScores).filter((s) => s > 0).length,
    [matchScores]
  );

  // AI matching - only match jobs relevant to target role
  // Accept optional roleOverride for when called right after setTargetRole (state not yet updated)
  const runAiMatching = useCallback(async (roleOverride?: string) => {
    const role = roleOverride || targetRole;
    if (!aiKey || !resumeData || !role || allPins.length === 0) return;

    setAiMatching(true);
    setAiPanelOpen(false); // close modal immediately

    // Filter jobs by target role before matching
    const roleLower = role.toLowerCase();
    const roleJobs = allPins.filter((p) =>
      p.job_title.toLowerCase().includes(roleLower)
    );

    if (roleJobs.length === 0) {
      setAiMatching(false);
      setToast(`No ${role} jobs found in the database`);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const batchSize = 100;
    const allScores: Record<string, number> = {};

    const compactJobs = roleJobs.map((p) => ({
      i: p.job_id,
      t: p.job_title,
      s: p.skills || [],
      l: p.experience_level || "",
    }));

    for (let i = 0; i < compactJobs.length; i += batchSize) {
      const batch = compactJobs.slice(i, i + batchSize);
      try {
        const res = await fetch("/api/ai/match-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: aiKey,
            skills: resumeData.skills,
            targetRole: role,
            jobs: batch,
          }),
        });
        const data = await res.json();
        if (data.scores) {
          Object.assign(allScores, data.scores);
        }
      } catch (err) {
        console.error("Batch match error:", err);
      }
    }

    setMatchScores(allScores);
    localStorage.setItem("jobclaw_match_scores", JSON.stringify(allScores));
    setAiMatching(false);

    const matched = Object.values(allScores).filter((s) => s > 0).length;
    setToast(`AI matched ${matched} of ${roleJobs.length} ${role} jobs`);
    setTimeout(() => setToast(null), 5000);
  }, [aiKey, resumeData, targetRole, allPins]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (aiPanelOpen) setAiPanelOpen(false);
        else if (aiGateOpen) setAiGateOpen(false);
        else if (filterOpen) setFilterOpen(false);
        else closeSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSidebar, filterOpen, aiPanelOpen, aiGateOpen]);

  const sidebarOpen = state.sidebarMode !== "closed";

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0A0A0F]">
      <Header
        totalJobs={totalJobs}
        totalCountries={totalCountries}
        activeFilterCount={activeFilterCount}
        onFilterClick={handleFilterClick}
        onAIClick={handleAIClick}
        aiConnected={!!aiKey}
        aiMatching={aiMatching}
        resumeData={resumeData}
        onResumeBadgeClick={() => setAiPanelOpen(true)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-[#1E1E2E] border-t-[#00E5A0] rounded-full animate-spin mx-auto" />
            <p className="text-[#8888A0] mt-4 text-sm">
              Loading global job data...
            </p>
          </div>
        </div>
      ) : (
        <GlobeCanvas
          pins={filteredPins}
          countryCounts={countryCounts}
          onCountrySelect={selectCountry}
          onPinSelect={selectJob}
          sidebarOpen={sidebarOpen}
          matchScores={matchScores}
        />
      )}

      <Sidebar
        mode={state.sidebarMode}
        selectedCountry={state.selectedCountry}
        selectedCountryName={state.selectedCountryName}
        countryJobs={state.countryJobs}
        selectedJob={state.selectedJob}
        isLoading={state.isLoading}
        activeFilterCount={activeFilterCount}
        onJobSelect={selectJobFromList}
        onBack={backToList}
        onClose={closeSidebar}
        onFilterClick={handleFilterClick}
      />

      <FilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        currentFilters={filters}
        availableRoles={availableRoles}
        availableCountries={availableCountries}
      />

      <AIPanel
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        aiKey={aiKey}
        onKeySet={handleKeySet}
        onKeyDelete={handleKeyDelete}
        resumeData={resumeData}
        onResumeExtracted={handleResumeExtracted}
        onResumeDelete={handleResumeDelete}
        targetRole={targetRole}
        onTargetRoleSet={handleTargetRoleSet}
        onStartMatching={runAiMatching}
        onReset={handleReset}
        aiMatching={aiMatching}
        matchCount={matchCount}
        totalJobs={allPins.length}
      />

      <EmailGate
        open={aiGateOpen}
        onClose={() => setAiGateOpen(false)}
        onVerified={handleAiVerified}
      />

      <PrivacyBanner />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-[#12121A]/95 backdrop-blur-xl border border-[#00E5A0]/30 rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-3 shadow-lg shadow-[#00E5A0]/10">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-[#F0F0F5] text-xs sm:text-sm font-medium flex-1">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors ml-1 flex-shrink-0"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* AI matching indicator */}
      {aiMatching && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[70]">
          <div className="bg-[#12121A]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin flex-shrink-0" />
            <p className="text-[#F0F0F5] text-xs sm:text-sm">
              AI is analyzing {targetRole} jobs...
            </p>
          </div>
        </div>
      )}

      {!loading && !sidebarOpen && (
        <div className="fixed bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-full px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
            <p className="text-[#8888A0] text-[10px] sm:text-xs">
              Click on a country or job pin to explore
            </p>
          </div>
        </div>
      )}

      {/* GitHub link */}
      <a
        href="https://github.com/gauravghai/jobclaw"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-30 bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] hover:border-[#8888A0]/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 transition-all group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#8888A0" className="group-hover:fill-[#F0F0F5] transition-colors sm:w-[18px] sm:h-[18px]">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span className="text-[#8888A0] group-hover:text-[#F0F0F5] text-[10px] sm:text-xs transition-colors hidden sm:inline">
          Open Source Project
        </span>
      </a>
    </main>
  );
}
