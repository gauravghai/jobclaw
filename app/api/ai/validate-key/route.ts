import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { apiKey } = (await request.json()) as { apiKey: string };

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "API key is required" },
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
        max_tokens: 10,
        messages: [{ role: "user", content: "Say OK" }],
      }),
    });

    if (response.ok) {
      return NextResponse.json({ valid: true, model: "Claude Sonnet" });
    }

    if (response.status === 401) {
      return NextResponse.json({ valid: false, error: "Invalid API key" });
    }

    return NextResponse.json({ valid: false, error: "Failed to validate key" });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Connection failed" },
      { status: 500 }
    );
  }
}
