import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string; jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const decodedId = decodeURIComponent(jobId);

    // Validate job_id length
    if (!decodedId || decodedId.length > 500) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const job = await db
      .collection("jobs")
      .findOne({ job_id: decodedId });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
