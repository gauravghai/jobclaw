import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "jsearch.p.rapidapi.com";

interface RapidAPIJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_publisher: string;
  job_employment_type: string;
  job_apply_link: string;
  job_apply_is_direct: boolean;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_latitude: number;
  job_longitude: number;
  job_salary?: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_period: string | null;
  job_salary_currency?: string | null;
  job_onet_soc?: string;
  job_onet_job_zone?: string;
  job_required_skills?: string[] | null;
  job_required_experience?: {
    experience_mentioned?: boolean;
    required_experience_in_months?: number | null;
  } | null;
  [key: string]: unknown;
}

function mapJob(raw: RapidAPIJob) {
  // Determine experience level from required_experience
  let experience_level = "Not Specified";
  const months = raw.job_required_experience?.required_experience_in_months;
  if (months !== null && months !== undefined) {
    if (months <= 12) experience_level = "Entry Level";
    else if (months <= 36) experience_level = "Mid Level";
    else if (months <= 72) experience_level = "Senior Level";
    else experience_level = "Lead/Principal";
  }

  // Determine source from publisher
  let source = raw.job_publisher || "Unknown";
  if (source.toLowerCase().includes("linkedin")) source = "LinkedIn";
  else if (source.toLowerCase().includes("indeed")) source = "Indeed";
  else if (source.toLowerCase().includes("glassdoor")) source = "Glassdoor";
  else if (source.toLowerCase().includes("ziprecruiter")) source = "ZipRecruiter";

  // Compute job_posted_at relative string
  let job_posted_at = "";
  if (raw.job_posted_at_timestamp) {
    const diffMs = Date.now() - raw.job_posted_at_timestamp * 1000;
    const days = Math.floor(diffMs / 86400000);
    if (days === 0) job_posted_at = "Today";
    else if (days === 1) job_posted_at = "1 day ago";
    else job_posted_at = `${days} days ago`;
  }

  return {
    job_id: raw.job_id,
    job_title: raw.job_title,
    employer_name: raw.employer_name,
    employer_logo: raw.employer_logo || null,
    employer_website: raw.employer_website || null,
    job_publisher: raw.job_publisher || "",
    job_employment_type: raw.job_employment_type || "Full-time",
    job_apply_link: raw.job_apply_link || "",
    job_apply_is_direct: raw.job_apply_is_direct || false,
    job_description: raw.job_description || "",
    job_is_remote: raw.job_is_remote || false,
    job_posted_at,
    job_posted_at_timestamp: raw.job_posted_at_timestamp || 0,
    job_posted_at_datetime_utc: raw.job_posted_at_datetime_utc || "",
    job_location: [raw.job_city, raw.job_state].filter(Boolean).join(", "),
    job_city: raw.job_city || "",
    job_state: raw.job_state || "",
    job_country: raw.job_country || "",
    job_latitude: raw.job_latitude || 0,
    job_longitude: raw.job_longitude || 0,
    job_salary: null,
    job_min_salary: raw.job_min_salary || null,
    job_max_salary: raw.job_max_salary || null,
    job_salary_period: raw.job_salary_period || null,
    job_onet_soc: raw.job_onet_soc || "",
    job_onet_job_zone: raw.job_onet_job_zone || "",
    skills: raw.job_required_skills || [],
    experience_level,
    source,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, numJobs, country, datePosted } = body as {
      query: string;
      numJobs: number;
      country: string;
      datePosted: string;
    };

    if (!query || typeof query !== "string" || query.length > 200) {
      return NextResponse.json(
        { error: "Valid query is required (max 200 chars)" },
        { status: 400 }
      );
    }

    if (!numJobs || typeof numJobs !== "number" || numJobs < 1 || numJobs > 500) {
      return NextResponse.json(
        { error: "numJobs must be between 1 and 500" },
        { status: 400 }
      );
    }

    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // JSearch returns 10 jobs per page
    const jobsPerPage = 10;
    const totalPages = Math.ceil(numJobs / jobsPerPage);
    const allJobs: ReturnType<typeof mapJob>[] = [];
    let fetchedCount = 0;
    let duplicateCount = 0;
    let errorPages = 0;

    const db = await getDb();
    const collection = db.collection("jobs");

    // Ensure unique index on job_id
    await collection.createIndex({ job_id: 1 }, { unique: true, background: true }).catch(() => {});

    // Fetch pages sequentially (API rate limits)
    for (let page = 1; page <= totalPages; page++) {
      try {
        const searchParams = new URLSearchParams({
          query,
          page: String(page),
          num_pages: "1",
          date_posted: datePosted || "all",
        });
        if (country && country !== "all") {
          searchParams.set("country", country);
        }
        const url = `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error(`API error page ${page}: ${res.status}`);
          errorPages++;
          continue;
        }

        const data = await res.json();
        const jobs: RapidAPIJob[] = data.data || [];

        if (jobs.length === 0) break; // No more results

        const mapped = jobs.map(mapJob);

        // Insert one by one to skip duplicates
        for (const job of mapped) {
          try {
            await collection.insertOne(job);
            allJobs.push(job);
            fetchedCount++;
          } catch (err: unknown) {
            // Duplicate key error code = 11000
            if (
              err &&
              typeof err === "object" &&
              "code" in err &&
              (err as { code: number }).code === 11000
            ) {
              duplicateCount++;
            } else {
              console.error("Insert error:", err);
            }
          }

          if (fetchedCount >= numJobs) break;
        }

        if (fetchedCount >= numJobs) break;

        // Small delay between pages to respect rate limits
        if (page < totalPages) {
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch (err) {
        console.error(`Fetch error page ${page}:`, err);
        errorPages++;
      }
    }

    return NextResponse.json({
      success: true,
      imported: fetchedCount,
      duplicatesSkipped: duplicateCount,
      errorPages,
      message: `Imported ${fetchedCount} jobs. Skipped ${duplicateCount} duplicates.`,
    });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
