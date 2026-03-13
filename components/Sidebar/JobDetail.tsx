"use client";

import { useState, useCallback, useEffect } from "react";
import { Job } from "@/lib/types";
import EmailGate from "@/components/Auth/EmailGate";

interface JobDetailProps {
  job: Job;
}

export default function JobDetail({ job }: JobDetailProps) {
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    setIsVerified(localStorage.getItem("jobclaw_verified") === "true");
  }, []);

  const handleProtectedClick = useCallback(
    (url: string) => {
      if (isVerified) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setPendingUrl(url);
        setGateOpen(true);
      }
    },
    [isVerified]
  );

  const handleVerified = useCallback(() => {
    setIsVerified(true);
    setGateOpen(false);
    if (pendingUrl) {
      window.open(pendingUrl, "_blank", "noopener,noreferrer");
      setPendingUrl(null);
    }
  }, [pendingUrl]);

  return (
    <div className="p-5">
      {/* Employer */}
      <div className="flex items-center gap-4 mb-5">
        {job.employer_logo ? (
          <img
            src={job.employer_logo}
            alt=""
            className="w-14 h-14 rounded-xl object-contain bg-[#0A0A0F] border border-[#1E1E2E]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[#0A0A0F] border border-[#1E1E2E] flex items-center justify-center">
            <span className="text-[#8888A0] text-lg font-bold">
              {job.employer_name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-[#F0F0F5] font-bold text-lg leading-tight">
            {job.job_title}
          </h3>
          <p className="text-[#8888A0] text-sm mt-1">{job.employer_name}</p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs px-3 py-1 rounded-full bg-[#0A0A0F] text-[#F0F0F5] border border-[#1E1E2E]">
          {job.job_location}
        </span>
        {job.job_employment_type && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20">
            {job.job_employment_type}
          </span>
        )}
        {job.job_is_remote && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/20">
            Remote
          </span>
        )}
        {job.experience_level && (
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {job.experience_level}
          </span>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {job.source && (
          <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3">
            <p className="text-[#8888A0] text-[10px] uppercase tracking-wider">
              Source
            </p>
            <p className="text-[#F0F0F5] text-sm mt-1">{job.source}</p>
          </div>
        )}
        {job.job_posted_at_datetime_utc && (
          <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3">
            <p className="text-[#8888A0] text-[10px] uppercase tracking-wider">
              Posted
            </p>
            <p className="text-[#F0F0F5] text-sm mt-1">
              {new Date(job.job_posted_at_datetime_utc).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}
            </p>
          </div>
        )}
        {(job.job_salary || job.job_min_salary) && (
          <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3 col-span-2">
            <p className="text-[#8888A0] text-[10px] uppercase tracking-wider">
              Salary
            </p>
            <p className="text-[#00E5A0] text-sm mt-1 font-semibold">
              {job.job_salary ||
                `$${job.job_min_salary?.toLocaleString()}${job.job_max_salary ? ` - $${job.job_max_salary.toLocaleString()}` : "+"} ${job.job_salary_period ? `/ ${job.job_salary_period}` : ""}`}
            </p>
          </div>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[#8888A0] text-[10px] uppercase tracking-wider mb-2">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#1A1A28] text-[#F0F0F5] border border-[#1E1E2E]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {job.job_description && (
        <div className="mb-5">
          <h4 className="text-[#8888A0] text-[10px] uppercase tracking-wider mb-3">
            Description
          </h4>
          <div className="text-[#B0B0C0] text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto custom-scrollbar">
            {job.job_description}
          </div>
        </div>
      )}

      {/* Apply button */}
      {job.job_apply_link && (
        <button
          onClick={() => handleProtectedClick(job.job_apply_link)}
          className="w-full text-center bg-[#00E5A0] hover:bg-[#00CC8E] text-[#0A0A0F] font-bold py-3.5 px-6 rounded-xl transition-colors duration-200 text-sm cursor-pointer"
        >
          Apply Now
          <svg
            className="inline-block ml-2 w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      )}

      {/* Employer website */}
      {job.employer_website && (
        <button
          onClick={() => handleProtectedClick(job.employer_website!)}
          className="w-full text-center mt-3 border border-[#1E1E2E] hover:border-[#00E5A0]/30 text-[#8888A0] hover:text-[#F0F0F5] py-3 px-6 rounded-xl transition-all duration-200 text-sm cursor-pointer"
        >
          Visit Company Website
        </button>
      )}

      {/* Email verification gate */}
      <EmailGate
        open={gateOpen}
        onClose={() => {
          setGateOpen(false);
          setPendingUrl(null);
        }}
        onVerified={handleVerified}
      />
    </div>
  );
}
