"use client";

import { useState } from "react";
import Link from "next/link";

const JOB_CATEGORIES = [
  "Data Analyst",
  "AI Engineer",
  "Business Analyst",
  "Software Developer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Digital Marketing",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "QA Engineer",
  "Mobile Developer",
  "Internship",
];

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "in", name: "India" },
  { code: "sg", name: "Singapore" },
  { code: "nl", name: "Netherlands" },
  { code: "se", name: "Sweden" },
  { code: "ie", name: "Ireland" },
  { code: "ch", name: "Switzerland" },
  { code: "jp", name: "Japan" },
  { code: "br", name: "Brazil" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "pl", name: "Poland" },
  { code: "ae", name: "UAE" },
  { code: "il", name: "Israel" },
  { code: "nz", name: "New Zealand" },
  { code: "mx", name: "Mexico" },
  { code: "za", name: "South Africa" },
  { code: "kr", name: "South Korea" },
  { code: "pk", name: "Pakistan" },
  { code: "ng", name: "Nigeria" },
  { code: "ph", name: "Philippines" },
  { code: "th", name: "Thailand" },
  { code: "vn", name: "Vietnam" },
  { code: "id", name: "Indonesia" },
  { code: "my", name: "Malaysia" },
  { code: "ru", name: "Russia" },
  { code: "cn", name: "China" },
];

const DATE_POSTED_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "3days", label: "Last 3 Days" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
];

interface ImportResult {
  success: boolean;
  imported: number;
  duplicatesSkipped: number;
  errorPages: number;
  message: string;
}

export default function JobImportPage() {
  const [selectedJob, setSelectedJob] = useState(JOB_CATEGORIES[0]);
  const [country, setCountry] = useState("all");
  const [datePosted, setDatePosted] = useState("week");
  const [numJobs, setNumJobs] = useState(50);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    const countryLabel = COUNTRIES.find((c) => c.code === country)?.name || "All";
    const dateLabel = DATE_POSTED_OPTIONS.find((d) => d.value === datePosted)?.label || "";
    setProgress(
      `Fetching ${numJobs} "${selectedJob}" jobs in ${countryLabel} (${dateLabel})...`
    );

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${selectedJob} jobs`,
          numJobs,
          country,
          datePosted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F0F0F5] overflow-auto">
      {/* Header */}
      <header className="border-b border-[#1E1E2E]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
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
            <span className="text-base font-bold tracking-tight">
              JobClaw
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-[#8888A0] hover:text-[#00E5A0] transition-colors border border-[#1E1E2E] rounded-lg px-3 py-1.5"
          >
            Back to Globe
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Import Jobs
          </h1>
          <p className="text-[#8888A0] text-sm">
            Fetch job listings from the web and add them to the globe database.
          </p>
        </div>

        <div className="space-y-6">
          {/* Job Category Dropdown */}
          <div>
            <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
              Job Category
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={loading}
              className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors appearance-none cursor-pointer disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 16px center",
              }}
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Country + Date Posted row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                Date Posted
              </label>
              <select
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                disabled={loading}
                className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                {DATE_POSTED_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Number of Jobs */}
          <div>
            <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
              Number of Jobs to Fetch
            </label>
            <input
              type="number"
              value={numJobs}
              onChange={(e) =>
                setNumJobs(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={1000}
              disabled={loading}
              placeholder="e.g. 500"
              className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-[#8888A0]/60 text-[10px] mt-1.5">
              Each API page returns ~10 jobs. Fetching {numJobs} jobs will make{" "}
              {Math.ceil(numJobs / 10)} API calls.
            </p>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-[#00E5A0] hover:bg-[#00CC8E] disabled:bg-[#00E5A0]/30 text-[#0A0A0F] font-bold py-4 px-6 rounded-xl transition-all duration-200 text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Import Jobs
              </>
            )}
          </button>

          {/* Progress */}
          {progress && (
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#1E1E2E] border-t-[#00E5A0] rounded-full animate-spin flex-shrink-0" />
              <p className="text-[#8888A0] text-sm">{progress}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-[#12121A] border border-[#00E5A0]/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#00E5A0"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#00E5A0] text-sm font-semibold">
                  Import Complete
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0A0A0F] rounded-lg p-3 text-center">
                  <p className="text-[#00E5A0] text-2xl font-bold tabular-nums">
                    {result.imported}
                  </p>
                  <p className="text-[#8888A0] text-[9px] uppercase tracking-widest mt-1">
                    Imported
                  </p>
                </div>
                <div className="bg-[#0A0A0F] rounded-lg p-3 text-center">
                  <p className="text-yellow-400 text-2xl font-bold tabular-nums">
                    {result.duplicatesSkipped}
                  </p>
                  <p className="text-[#8888A0] text-[9px] uppercase tracking-widest mt-1">
                    Duplicates
                  </p>
                </div>
                <div className="bg-[#0A0A0F] rounded-lg p-3 text-center">
                  <p className="text-[#FF4D4D] text-2xl font-bold tabular-nums">
                    {result.errorPages}
                  </p>
                  <p className="text-[#8888A0] text-[9px] uppercase tracking-widest mt-1">
                    Errors
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="block w-full text-center border border-[#1E1E2E] hover:border-[#00E5A0]/30 text-[#8888A0] hover:text-[#F0F0F5] py-3 px-6 rounded-xl transition-all duration-200 text-sm"
              >
                View on Globe
              </Link>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-[#12121A] border border-[#FF4D4D]/30 rounded-xl p-4 flex items-center gap-3">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#FF4D4D"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-[#FF4D4D] text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="mt-10 bg-[#12121A]/60 border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-[#8888A0] text-[10px] uppercase tracking-widest mb-3">
            How it works
          </h3>
          <ul className="space-y-2 text-sm text-[#8888A0]">
            <li className="flex items-start gap-2">
              <span className="text-[#00E5A0] mt-0.5">1.</span>
              Select a job category and number of jobs to fetch
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5A0] mt-0.5">2.</span>
              Jobs are fetched from JSearch API (10 per page)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5A0] mt-0.5">3.</span>
              Each job is stored in MongoDB with a unique job_id (no duplicates)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5A0] mt-0.5">4.</span>
              Jobs appear on the globe based on their lat/lng coordinates
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
