import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CompactJob {
  i: string;
  t: string;
  s: string[];
  l: string;
}

export async function POST(request: Request) {
  try {
    const { apiKey, skills, targetRole, jobs } = (await request.json()) as {
      apiKey: string;
      skills: string[];
      targetRole: string;
      jobs: CompactJob[];
    };

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 400 }
      );
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Skills required" },
        { status: 400 }
      );
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "Jobs required" },
        { status: 400 }
      );
    }

    // Build compact job list for token efficiency
    const jobLines = jobs
      .map((j, idx) => `${idx}|${j.t}|${j.s.join(",")}|${j.l}`)
      .join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `You are a job matching AI. Rate how well a candidate matches each job on a 0-100 scale.

Candidate Skills: ${skills.join(", ")}
Target Role: ${targetRole}

Jobs (index|title|skills|level):
${jobLines}

Scoring criteria:
- Skill overlap (60% weight): How many candidate skills match the job requirements
- Role relevance (30% weight): How close the job title is to the target role
- Experience level fit (10% weight): Whether the level matches

Return ONLY a JSON array with index "i" and match score "m" for jobs scoring above 5. Example: [{"i":0,"m":85},{"i":2,"m":45}]
Skip jobs with very low relevance. Be realistic and precise with scores.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            (errData as { error?: { message?: string } }).error?.message ||
            "Claude API error",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content =
      (data as { content?: { text?: string }[] }).content?.[0]?.text || "";

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      const scores = JSON.parse(jsonMatch[0]) as { i: number; m: number }[];

      // Map indices back to job IDs
      const result: Record<string, number> = {};
      for (const s of scores) {
        if (s.i >= 0 && s.i < jobs.length && s.m > 0) {
          result[jobs[s.i].i] = Math.min(100, Math.max(0, Math.round(s.m)));
        }
      }

      return NextResponse.json({ success: true, scores: result });
    } catch {
      return NextResponse.json(
        { error: "Failed to parse match results" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Match jobs error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
