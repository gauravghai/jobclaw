"use client";

import { useState, useEffect, useRef } from "react";

interface EmailGateProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type Step = "email" | "otp";

export default function EmailGate({ open, onClose, onVerified }: EmailGateProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      // Check if already verified
      const verified = localStorage.getItem("jobclaw_verified");
      if (verified) {
        onVerified();
        return;
      }
      const savedEmail = localStorage.getItem("jobclaw_email");
      if (savedEmail) setEmail(savedEmail);
      setStep("email");
      setOtp(["", "", "", "", "", ""]);
      setError("");
    }
  }, [open, onVerified]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.alreadyVerified) {
        localStorage.setItem("jobclaw_verified", "true");
        localStorage.setItem("jobclaw_email", email);
        onVerified();
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        localStorage.setItem("jobclaw_email", email);
        setStep("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (value && index === 5 && newOtp.every((d) => d)) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (otpString?: string) => {
    const code = otpString || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        localStorage.setItem("jobclaw_verified", "true");
        localStorage.setItem("jobclaw_email", email);
        onVerified();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#12121A] border border-[#1E1E2E] rounded-2xl w-[90vw] max-w-md overflow-hidden">
        {/* Header */}
        <div className="text-center pt-8 px-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5A0] to-[#00B37D] flex items-center justify-center mx-auto mb-4">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0A0A0F"
              strokeWidth={2.5}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
            </svg>
          </div>
          <h2 className="text-[#F0F0F5] text-xl font-bold">
            Join JobClaw
          </h2>
          <p className="text-[#8888A0] text-sm mt-2 leading-relaxed">
            Get access to all job updates for absolutely free
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8">
          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="you@example.com"
                  autoFocus
                  disabled={loading}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#00E5A0]/50 transition-colors placeholder:text-[#8888A0]/40 disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="text-[#FF4D4D] text-xs">{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#00E5A0] hover:bg-[#00CC8E] disabled:bg-[#00E5A0]/30 text-[#0A0A0F] font-bold py-3.5 px-6 rounded-xl transition-all text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[#8888A0] text-xs">
                  We sent a 6-digit code to{" "}
                  <span className="text-[#F0F0F5] font-medium">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className="w-11 h-13 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-center text-[#F0F0F5] text-lg font-bold focus:outline-none focus:border-[#00E5A0]/50 transition-colors disabled:opacity-50"
                  />
                ))}
              </div>

              {error && (
                <p className="text-[#FF4D4D] text-xs text-center">{error}</p>
              )}

              <button
                onClick={() => handleVerifyOtp()}
                disabled={loading || otp.some((d) => !d)}
                className="w-full bg-[#00E5A0] hover:bg-[#00CC8E] disabled:bg-[#00E5A0]/30 text-[#0A0A0F] font-bold py-3.5 px-6 rounded-xl transition-all text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-[#8888A0] hover:text-[#F0F0F5] text-xs transition-colors"
                >
                  Change email
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#00E5A0] hover:text-[#00CC8E] text-xs transition-colors disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
