"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import GlobeCanvas from "@/components/Globe/GlobeCanvas";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import FilterDialog, {
  FilterState,
  EMPTY_FILTERS,
} from "@/components/Filter/FilterDialog";
import { useGlobeState } from "@/hooks/useGlobeState";
import { JobPin, CountryJobCount } from "@/lib/types";

export default function Home() {
  const [allPins, setAllPins] = useState<JobPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const {
    state,
    selectCountry,
    selectJob,
    selectJobFromList,
    backToList,
    closeSidebar,
  } = useGlobeState(filters);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        setAllPins(data.pins || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (filterOpen) setFilterOpen(false);
        else closeSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSidebar, filterOpen]);

  const sidebarOpen = state.sidebarMode !== "closed";

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0A0A0F]">
      <Header
        totalJobs={totalJobs}
        totalCountries={totalCountries}
        activeFilterCount={activeFilterCount}
        onFilterClick={handleFilterClick}
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

      {/* Instructions overlay */}
      {!loading && !sidebarOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-[#12121A]/80 backdrop-blur-xl border border-[#1E1E2E] rounded-full px-5 py-2.5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
            <p className="text-[#8888A0] text-xs">
              Click on a country or job pin to explore
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
