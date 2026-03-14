"use client";

import { useState, useEffect } from "react";

export default function PrivacyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("jobclaw_privacy_accepted")) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#12121A]/95 backdrop-blur-xl border-t border-[#1E1E2E] px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00E5A0]/10 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00E5A0"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-[#B0B0C0] text-[11px] sm:text-xs leading-relaxed">
              <span className="text-[#F0F0F5] font-medium">
                Your privacy matters.
              </span>{" "}
              All data is stored locally in your browser for security.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem("jobclaw_privacy_accepted", "true");
              setShow(false);
            }}
            className="bg-[#00E5A0] hover:bg-[#00CC8E] text-[#0A0A0F] font-semibold px-5 py-2 rounded-xl text-xs transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
