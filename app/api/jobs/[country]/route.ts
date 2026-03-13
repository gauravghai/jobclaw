import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;
    const countryCode = country.toUpperCase();

    // Validate: must be exactly 2 uppercase letters
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        { error: "Invalid country code" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const jobs = await db
      .collection("jobs")
      .find(
        { job_country: countryCode },
        { projection: { job_description: 0 } }
      )
      .sort({ job_posted_at_datetime_utc: -1 })
      .limit(500)
      .toArray();

    return NextResponse.json({ jobs, total: jobs.length });
  } catch (error) {
    console.error("Failed to fetch country jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
