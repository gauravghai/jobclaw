import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("jobs");

    const [pins, countryCounts] = await Promise.all([
      collection
        .find(
          { job_latitude: { $exists: true }, job_longitude: { $exists: true } },
          {
            projection: {
              job_id: 1,
              job_title: 1,
              employer_name: 1,
              job_country: 1,
              job_city: 1,
              job_state: 1,
              job_latitude: 1,
              job_longitude: 1,
              job_employment_type: 1,
              job_is_remote: 1,
              experience_level: 1,
              skills: 1,
            },
          }
        )
        .toArray(),
      collection
        .aggregate([
          {
            $match: {
              job_latitude: { $exists: true },
              job_longitude: { $exists: true },
            },
          },
          { $group: { _id: "$job_country", count: { $sum: 1 } } },
          { $project: { country: "$_id", count: 1, _id: 0 } },
        ])
        .toArray(),
    ]);

    return NextResponse.json({
      pins,
      countryCounts,
      totalJobs: pins.length,
      totalCountries: countryCounts.length,
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
