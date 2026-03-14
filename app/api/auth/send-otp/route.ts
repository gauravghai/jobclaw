import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomInt, createHash } from "crypto";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const ses = new SESClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Capture user details from request headers
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "";

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Check if already verified
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
      verified: true,
    });
    if (existingUser) {
      // Update last seen on return visits
      await usersCollection.updateOne(
        { email: email.toLowerCase() },
        { $set: { lastSeenAt: new Date(), lastIp: ip, lastUserAgent: userAgent } }
      );
      return NextResponse.json({ alreadyVerified: true });
    }

    // Rate limit: max 5 OTP requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUser = await usersCollection.findOne({
      email: email.toLowerCase(),
      updatedAt: { $gte: oneHourAgo },
      otpAttempts: { $gte: 5 },
    });
    if (recentUser) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Generate OTP and store hashed
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          otpHash: hashOtp(otp),
          otpExpiresAt: expiresAt,
          failedAttempts: 0,
          updatedAt: new Date(),
          lastIp: ip,
          lastUserAgent: userAgent,
        },
        $inc: { otpAttempts: 1 },
        $setOnInsert: {
          email: email.toLowerCase(),
          verified: false,
          createdAt: new Date(),
          signupIp: ip,
          signupUserAgent: userAgent,
          signupReferer: referer,
        },
      },
      { upsert: true }
    );

    // Send OTP via SES
    const fromEmail = process.env.AWS_SES_FROM_EMAIL || "no-reply@oneroadmap.io";

    await ses.send(
      new SendEmailCommand({
        Source: `JobClaw <${fromEmail}>`,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: "Your JobClaw Verification Code", Charset: "UTF-8" },
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #00E5A0, #00B37D); margin-bottom: 16px;"></div>
                    <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">JobClaw</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Global Talent Explorer</p>
                  </div>
                  <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
                    <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Your verification code is</p>
                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00B37D; padding: 16px 0;">${otp}</div>
                    <p style="color: #888; font-size: 13px; margin: 0;">This code expires in 10 minutes</p>
                  </div>
                  <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
                    Join JobClaw and get access to all job updates for absolutely free.
                  </p>
                </div>
              `,
            },
          },
        },
      })
    );

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
