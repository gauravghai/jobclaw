"use client";

import { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group bg-[#1A1A28]/60 hover:bg-[#1E1E2E] border border-[#1E1E2E] hover:border-[#00E5A0]/30 rounded-xl p-4 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {job.employer_logo ? (
          <img
            src={job.employer_logo}
            alt=""
            className="w-10 h-10 rounded-lg object-contain bg-[#0A0A0F] flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#0A0A0F] flex items-center justify-center flex-shrink-0">
            <span className="text-[#8888A0] text-sm font-bold">
              {job.employer_name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[#F0F0F5] text-sm font-semibold truncate group-hover:text-[#00E5A0] transition-colors">
            {job.job_title}
          </h3>
          <p className="text-[#8888A0] text-xs mt-0.5 truncate">
            {job.employer_name}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A0A0F] text-[#8888A0] border border-[#1E1E2E]">
              {job.job_city}
              {job.job_state ? `, ${job.job_state}` : ""}
            </span>
            {job.job_employment_type && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20">
                {job.job_employment_type}
              </span>
            )}
            {job.job_is_remote && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/20">
                Remote
              </span>
            )}
          </div>
        </div>
      </div>
      {job.job_posted_at_datetime_utc && (
        <p className="text-[#8888A0]/60 text-[10px] mt-2 text-right">
          {timeAgo(job.job_posted_at_datetime_utc)}
        </p>
      )}
    </button>
  );
}
