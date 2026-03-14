import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = (await request.json()) as {
      email: string;
      otp: string;
    };

    if (!email || !otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Valid email and 6-digit OTP are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "No OTP found for this email. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.verified) {
      return NextResponse.json({ verified: true });
    }

    // Brute force protection: lock after 5 failed attempts
    if (user.failedAttempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Compare hashed OTP
    if (user.otpHash !== hashOtp(otp)) {
      await usersCollection.updateOne(
        { email: email.toLowerCase() },
        { $inc: { failedAttempts: 1 } }
      );
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Capture user details
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Mark as verified
    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          verified: true,
          verifiedAt: new Date(),
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          lastLoginUserAgent: userAgent,
        },
        $unset: { otpHash: "", otpExpiresAt: "", failedAttempts: "", otpAttempts: "" },
      }
    );

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
