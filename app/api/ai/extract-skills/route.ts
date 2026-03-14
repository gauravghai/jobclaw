import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Use dynamic import + set workerSrc to the actual file path on disk
  // This avoids Turbopack bundling issues with pdfjs-dist worker
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item: Record<string, unknown>) => "str" in item)
      .map((item: Record<string, unknown>) => (item.str as string) || "")
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n");
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let apiKey = "";
    let resumeText = "";

    if (contentType.includes("multipart/form-data")) {
      // FormData upload (PDF or text file)
      const formData = await request.formData();
      apiKey = formData.get("apiKey") as string;
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("resumeText") as string | null;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf")
        ) {
          try {
            resumeText = await extractTextFromPdf(buffer);
          } catch (pdfErr: unknown) {
            const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
            const stack = pdfErr instanceof Error ? pdfErr.stack : "";
            console.error("PDF parse error:", msg);
            console.error("PDF stack:", stack);
            return NextResponse.json(
              {
                error:
                  "Failed to parse PDF. The file may be corrupted or password-protected. Try pasting the text instead.",
              },
              { status: 400 }
            );
          }
        } else {
          // Plain text file
          resumeText = buffer.toString("utf-8");
        }
      } else if (pastedText) {
        resumeText = pastedText;
      }
    } else {
      // JSON body (backwards compatible)
      const body = (await request.json()) as {
        apiKey: string;
        resumeText: string;
      };
      apiKey = body.apiKey;
      resumeText = body.resumeText;
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file. Try pasting instead." },
        { status: 400 }
      );
    }

    if (resumeText.length > 50000) {
      return NextResponse.json(
        { error: "Resume text too large (max 50,000 chars)" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Extract key information from this resume. Return ONLY a JSON object with no markdown formatting, no code blocks, just raw JSON:
{
  "name": "candidate full name",
  "skills": ["skill1", "skill2", ...],
  "experience_years": number,
  "experience_level": "Entry Level" | "Mid Level" | "Senior Level" | "Lead/Principal",
  "education": "highest degree and field",
  "summary": "one-line professional summary"
}

Include all technical skills, tools, frameworks, languages, and soft skills found. Be comprehensive with skills extraction.

Resume:
${resumeText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, resume: parsed });
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Extract skills error:", error);
    return NextResponse.json(
      { error: "Failed to extract skills" },
      { status: 500 }
    );
  }
}
