"use client";

import { Job } from "@/lib/types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
}

export default function JobList({ jobs, onJobSelect }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#8888A0]">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="mt-3 text-sm">No jobs found in this region</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {jobs.map((job) => (
        <JobCard
          key={job.job_id || job._id}
          job={job}
          onClick={() => onJobSelect(job)}
        />
      ))}
    </div>
  );
}
