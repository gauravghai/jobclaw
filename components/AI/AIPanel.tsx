"use client";

import { useState, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types";

const JOB_CATEGORIES = [
  "Data Analyst",
  "AI Engineer",
  "Business Analyst",
  "Software Developer",
  "Software Engineer",
  "Digital Marketing",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "QA Engineer",
  "Mobile Developer",
  "Internship",
];

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
  aiKey: string | null;
  onKeySet: (key: string) => void;
  onKeyDelete: () => void;
  resumeData: ResumeData | null;
  onResumeExtracted: (data: ResumeData) => void;
  onResumeDelete: () => void;
  targetRole: string;
  onTargetRoleSet: (role: string) => void;
  onStartMatching: (roleOverride?: string) => void;
  onReset: () => void;
  aiMatching: boolean;
  matchCount: number;
  totalJobs: number;
}

type AIStep = "key" | "resume" | "role" | "dashboard";

export default function AIPanel({
  open,
  onClose,
  aiKey,
  onKeySet,
  onKeyDelete,
  resumeData,
  onResumeExtracted,
  onResumeDelete,
  targetRole,
  onTargetRoleSet,
  onStartMatching,
  onReset,
  aiMatching,
  matchCount,
  totalJobs,
}: AIPanelProps) {
  const [step, setStep] = useState<AIStep>("key");
  const [keyInput, setKeyInput] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Only auto-determine step when the panel opens (open transitions false→true)
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setError("");
      if (!aiKey) setStep("key");
      else if (!resumeData) setStep("resume");
      else if (!targetRole) setStep("role");
      else setStep("dashboard");

      if (targetRole) setRoleInput(targetRole);
    }
    prevOpenRef.current = open;
  }, [open, aiKey, resumeData, targetRole]);

  if (!open) return null;

  const handleValidateKey = async () => {
    if (!keyInput.trim()) {
      setError("Please enter your API key");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        onKeySet(keyInput.trim());
        setStep("resume");
      } else {
        setError(data.error || "Invalid API key");
      }
    } catch {
      setError("Failed to validate. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      // Store the file for FormData upload — PDF is parsed server-side
      setUploadedFile(file);
      setFileName(file.name);
      setResumeText(""); // clear pasted text since we have a file
    } else {
      // Read text files on client
      const reader = new FileReader();
      reader.onload = (ev) => {
        setResumeText((ev.target?.result as string) || "");
        setUploadedFile(null);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleExtractSkills = async () => {
    if (!resumeText.trim() && !uploadedFile) {
      setError("Please paste your resume or upload a file");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res: Response;

      if (uploadedFile) {
        // Send PDF as FormData
        const formData = new FormData();
        formData.append("apiKey", aiKey || "");
        formData.append("file", uploadedFile);
        res = await fetch("/api/ai/extract-skills", {
          method: "POST",
          body: formData,
        });
      } else {
        // Send pasted text as JSON
        res = await fetch("/api/ai/extract-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: aiKey,
            resumeText: resumeText.trim(),
          }),
        });
      }

      const data = await res.json();
      if (data.success && data.resume) {
        onResumeExtracted(data.resume);
        setStep("role");
      } else {
        setError(data.error || "Failed to extract skills");
      }
    } catch {
      setError("Failed to extract skills. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = () => {
    if (!roleInput.trim()) {
      setError("Please select your target role");
      return;
    }
    const role = roleInput.trim();
    onTargetRoleSet(role);
    onStartMatching(role);
    setStep("dashboard");
  };

  const stepOrder: AIStep[] = ["key", "resume", "role", "dashboard"];
  const stepLabels = ["AI Model", "Resume", "Role", "Match"];
  const currentIdx = stepOrder.indexOf(step);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#12121A] border border-[#1E1E2E] rounded-2xl w-[90vw] max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>
            <h2 className="text-[#F0F0F5] text-base font-semibold">
              AI Job Matcher
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors p-1"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar">
          {/* Step indicators */}
          <div className="flex items-center gap-1 mb-2">
            {stepLabels.map((label, idx) => {
              const isActive = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={label} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      isCurrent
                        ? "bg-purple-500 border-purple-500 text-white"
                        : isActive
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : "bg-[#0A0A0F] border-[#1E1E2E] text-[#8888A0]"
                    }`}
                  >
                    {isActive && idx < currentIdx ? (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider hidden sm:block ${isActive ? "text-[#F0F0F5]" : "text-[#8888A0]"}`}
                  >
                    {label}
                  </span>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-px ${isActive && idx < currentIdx ? "bg-purple-500/30" : "bg-[#1E1E2E]"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step: API Key */}
          {step === "key" && (
            <div className="space-y-4">
              <div>
                <p className="text-[#F0F0F5] text-sm font-medium mb-1">
                  Connect Your AI Model
                </p>
                <p className="text-[#8888A0] text-xs leading-relaxed">
                  Enter your Claude API key to enable AI-powered job matching.
                  Your key stays in your browser — we never store it on our
                  servers.
                </p>
              </div>
              <div>
                <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                  Claude API Key
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleValidateKey()}
                  placeholder="sk-ant-..."
                  autoFocus
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#8888A0]/40 font-mono"
                />
              </div>
              <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-3 space-y-2">
                <p className="text-[#8888A0] text-[11px] leading-relaxed">
                  Get your API key from{" "}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    console.anthropic.com/settings/keys
                  </a>
                </p>
                <p className="text-[#8888A0] text-[11px] leading-relaxed">
                  To self-host, download the code from{" "}
                  <a
                    href="https://github.com/gauravghai/jobclaw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    github.com/gauravghai/jobclaw
                  </a>
                </p>
              </div>

              {error && <p className="text-[#FF4D4D] text-xs">{error}</p>}

              <button
                onClick={handleValidateKey}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Connect AI Model"
                )}
              </button>
            </div>
          )}

          {/* Step: Resume Upload */}
          {step === "resume" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[#F0F0F5] text-sm font-medium mb-1">
                    Upload Your Resume
                  </p>
                  <span className="text-[10px] text-[#00E5A0] bg-[#00E5A0]/10 px-2 py-0.5 rounded-full">
                    AI Connected
                  </span>
                </div>
                <p className="text-[#8888A0] text-xs">
                  Upload your resume (PDF or TXT) or paste the text below. AI
                  will extract your key skills.
                </p>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setError("");
                }}
                placeholder="Paste your resume text here..."
                rows={8}
                autoFocus
                className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#8888A0]/40 resize-none custom-scrollbar"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-[#8888A0] hover:text-[#F0F0F5] border border-[#1E1E2E] hover:border-[#8888A0]/30 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                  Upload PDF or TXT
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {fileName && (
                  <span className="text-[#00E5A0] text-[10px] flex items-center gap-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {fileName}
                  </span>
                )}
                {!fileName && resumeText.length > 0 && (
                  <span className="text-[#8888A0] text-[10px]">
                    {resumeText.length} chars
                  </span>
                )}
              </div>

              {error && <p className="text-[#FF4D4D] text-xs">{error}</p>}

              <button
                onClick={handleExtractSkills}
                disabled={loading || (!resumeText.trim() && !uploadedFile)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Extracting Skills...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                    Extract Skills with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Target Role */}
          {step === "role" && resumeData && (
            <div className="space-y-4">
              <div>
                <p className="text-[#F0F0F5] text-sm font-medium mb-1">
                  Set Target Role
                </p>
                <p className="text-[#8888A0] text-xs">
                  We found{" "}
                  <span className="text-purple-400 font-medium">
                    {resumeData.skills.length} skills
                  </span>{" "}
                  in your resume. Now tell us what role you&apos;re targeting.
                </p>
              </div>

              {/* Extracted skills preview */}
              <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-3">
                <p className="text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                  Your Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.skills.slice(0, 15).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills.length > 15 && (
                    <span className="text-[10px] px-2 py-1 text-[#8888A0]">
                      +{resumeData.skills.length - 15} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                  Target Job Role
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => {
                    setRoleInput(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                  }}
                >
                  <option value="" disabled>
                    Select a job role...
                  </option>
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-[#FF4D4D] text-xs">{error}</p>}

              <button
                onClick={handleSetRole}
                disabled={!roleInput.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Start AI Matching
              </button>
            </div>
          )}

          {/* Step: Dashboard */}
          {step === "dashboard" && (
            <div className="space-y-4">
              {/* Status card */}
              <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
                    <span className="text-[#F0F0F5] text-xs font-medium">
                      AI Connected
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8888A0]">
                    Claude Sonnet
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8888A0] text-xs">Resume</span>
                  <span className="text-[#F0F0F5] text-xs">
                    {resumeData?.name || "Uploaded"} (
                    {resumeData?.skills.length} skills)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8888A0] text-xs">Target Role</span>
                  <span className="text-[#F0F0F5] text-xs">{targetRole}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8888A0] text-xs">Matches Found</span>
                  <span className="text-[#00E5A0] text-xs font-bold">
                    {aiMatching
                      ? "Analyzing..."
                      : `${matchCount} / ${totalJobs} jobs`}
                  </span>
                </div>
              </div>

              {/* Loading indicator */}
              {aiMatching && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-[#8888A0] text-sm">
                    AI is analyzing {totalJobs} jobs worldwide...
                  </p>
                </div>
              )}

              {/* Resume details */}
              {resumeData && !aiMatching && (
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-4">
                  <p className="text-[#8888A0] text-[10px] uppercase tracking-widest mb-2">
                    Extracted Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {resumeData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {resumeData.summary && (
                    <p className="text-[#8888A0] text-xs italic">
                      {resumeData.summary}
                    </p>
                  )}
                  {resumeData.education && (
                    <p className="text-[#8888A0] text-[11px] mt-1">
                      {resumeData.education}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {!aiMatching && (
                <div className="space-y-2">
                  <button
                    onClick={() => onStartMatching()}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                  >
                    Re-run AI Matching
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onReset();
                        setKeyInput("");
                        setResumeText("");
                        setUploadedFile(null);
                        setFileName("");
                        setRoleInput("");
                        setStep("key");
                      }}
                      className="text-[10px] text-[#FF4D4D] hover:text-[#FF6B6B] border border-[#FF4D4D]/20 hover:border-[#FF4D4D]/40 py-2 rounded-lg transition-all"
                    >
                      Change Key
                    </button>
                    <button
                      onClick={() => {
                        onResumeDelete();
                        onTargetRoleSet("");
                        setResumeText("");
                        setUploadedFile(null);
                        setFileName("");
                        setRoleInput("");
                        setStep("resume");
                      }}
                      className="text-[10px] text-[#8888A0] hover:text-[#F0F0F5] border border-[#1E1E2E] hover:border-[#8888A0]/30 py-2 rounded-lg transition-all"
                    >
                      Change Resume
                    </button>
                    <button
                      onClick={() => {
                        onResumeDelete();
                        onTargetRoleSet("");
                        setResumeText("");
                        setUploadedFile(null);
                        setFileName("");
                        setRoleInput("");
                        setStep("resume");
                      }}
                      className="text-[10px] text-[#8888A0] hover:text-[#F0F0F5] border border-[#1E1E2E] hover:border-[#8888A0]/30 py-2 rounded-lg transition-all"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
