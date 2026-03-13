"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRY_NAMES } from "@/lib/constants";

export interface FilterState {
  roles: string[];
  countries: string[];
  remote: boolean;
  internship: boolean;
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
  availableRoles: string[];
  availableCountries: string[];
}

export const EMPTY_FILTERS: FilterState = {
  roles: [],
  countries: [],
  remote: false,
  internship: false,
};

export default function FilterDialog({
  open,
  onClose,
  onApply,
  currentFilters,
  availableRoles,
  availableCountries,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setFilters(currentFilters);
  }, [open, currentFilters]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleRole = (role: string) => {
    setFilters((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  };

  const toggleCountry = (code: string) => {
    setFilters((f) => ({
      ...f,
      countries: f.countries.includes(code)
        ? f.countries.filter((c) => c !== code)
        : [...f.countries, code],
    }));
  };

  const clearAll = () => setFilters(EMPTY_FILTERS);

  const activeCount =
    filters.roles.length +
    filters.countries.length +
    (filters.remote ? 1 : 0) +
    (filters.internship ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-[#12121A] border border-[#1E1E2E] rounded-2xl w-[90vw] max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
          <h2 className="text-[#F0F0F5] text-base font-semibold">
            Filter Jobs
          </h2>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
          {/* Job Type Toggles */}
          <div>
            <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2.5">
              Job Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, remote: !f.remote }))
                }
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  filters.remote
                    ? "bg-[#00E5A0]/15 border-[#00E5A0]/40 text-[#00E5A0]"
                    : "bg-[#0A0A0F] border-[#1E1E2E] text-[#8888A0] hover:border-[#8888A0]/30"
                }`}
              >
                Remote
              </button>
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, internship: !f.internship }))
                }
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  filters.internship
                    ? "bg-[#00E5A0]/15 border-[#00E5A0]/40 text-[#00E5A0]"
                    : "bg-[#0A0A0F] border-[#1E1E2E] text-[#8888A0] hover:border-[#8888A0]/30"
                }`}
              >
                Internship
              </button>
            </div>
          </div>

          {/* Roles Multi-select */}
          <div>
            <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2.5">
              Role{" "}
              {filters.roles.length > 0 && (
                <span className="text-[#00E5A0]">
                  ({filters.roles.length})
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filters.roles.includes(role)
                      ? "bg-[#00E5A0]/15 border-[#00E5A0]/40 text-[#00E5A0]"
                      : "bg-[#0A0A0F] border-[#1E1E2E] text-[#8888A0] hover:border-[#8888A0]/30"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Countries Multi-select */}
          <div>
            <label className="block text-[#8888A0] text-[10px] uppercase tracking-widest mb-2.5">
              Country{" "}
              {filters.countries.length > 0 && (
                <span className="text-[#00E5A0]">
                  ({filters.countries.length})
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
              {availableCountries.map((code) => (
                <button
                  key={code}
                  onClick={() => toggleCountry(code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filters.countries.includes(code)
                      ? "bg-[#00E5A0]/15 border-[#00E5A0]/40 text-[#00E5A0]"
                      : "bg-[#0A0A0F] border-[#1E1E2E] text-[#8888A0] hover:border-[#8888A0]/30"
                  }`}
                >
                  {COUNTRY_NAMES[code] || code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#1E1E2E] flex items-center justify-between gap-3">
          <button
            onClick={clearAll}
            className="text-[#8888A0] hover:text-[#F0F0F5] text-xs transition-colors"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm border border-[#1E1E2E] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#8888A0]/30 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApply(filters);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#00E5A0] hover:bg-[#00CC8E] text-[#0A0A0F] transition-all flex items-center gap-2"
            >
              Apply
              {activeCount > 0 && (
                <span className="bg-[#0A0A0F]/20 px-1.5 py-0.5 rounded text-[10px]">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
