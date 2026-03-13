"use client";

import { useReducer, useCallback } from "react";
import { Job, JobPin, SidebarMode } from "@/lib/types";
import { FilterState } from "@/components/Filter/FilterDialog";

interface GlobeState {
  sidebarMode: SidebarMode;
  selectedCountry: string | null;
  selectedCountryName: string | null;
  countryJobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
}

type Action =
  | { type: "SELECT_COUNTRY"; country: string; countryName: string }
  | { type: "SET_COUNTRY_JOBS"; jobs: Job[] }
  | { type: "SELECT_JOB"; job: Job }
  | { type: "SET_JOB_DETAIL"; job: Job }
  | { type: "BACK_TO_LIST" }
  | { type: "CLOSE_SIDEBAR" }
  | { type: "SET_LOADING"; loading: boolean };

const initialState: GlobeState = {
  sidebarMode: "closed",
  selectedCountry: null,
  selectedCountryName: null,
  countryJobs: [],
  selectedJob: null,
  isLoading: false,
};

function reducer(state: GlobeState, action: Action): GlobeState {
  switch (action.type) {
    case "SELECT_COUNTRY":
      return {
        ...state,
        sidebarMode: "country-list",
        selectedCountry: action.country,
        selectedCountryName: action.countryName,
        countryJobs: [],
        selectedJob: null,
        isLoading: true,
      };
    case "SET_COUNTRY_JOBS":
      return { ...state, countryJobs: action.jobs, isLoading: false };
    case "SELECT_JOB":
      return { ...state, sidebarMode: "job-detail", selectedJob: action.job, isLoading: true };
    case "SET_JOB_DETAIL":
      return { ...state, selectedJob: action.job, isLoading: false };
    case "BACK_TO_LIST":
      return { ...state, sidebarMode: "country-list", selectedJob: null };
    case "CLOSE_SIDEBAR":
      return { ...initialState };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
}

function applyFiltersToJobs(jobs: Job[], filters: FilterState): Job[] {
  let result = jobs;

  if (filters.roles.length > 0) {
    const lowerRoles = filters.roles.map((r) => r.toLowerCase());
    result = result.filter((j) =>
      lowerRoles.some((role) => j.job_title.toLowerCase().includes(role))
    );
  }

  if (filters.remote) {
    result = result.filter((j) => j.job_is_remote);
  }

  if (filters.internship) {
    result = result.filter(
      (j) =>
        j.job_employment_type?.toLowerCase().includes("intern") ||
        j.job_title.toLowerCase().includes("intern")
    );
  }

  return result;
}

export function useGlobeState(filters: FilterState) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectCountry = useCallback(
    async (country: string, countryName: string) => {
      dispatch({ type: "SELECT_COUNTRY", country, countryName });
      try {
        const res = await fetch(`/api/jobs/${country}`);
        const data = await res.json();
        const jobs: Job[] = data.jobs || [];
        dispatch({ type: "SET_COUNTRY_JOBS", jobs: applyFiltersToJobs(jobs, filters) });
      } catch {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [filters]
  );

  const selectJob = useCallback(
    async (pin: JobPin) => {
      dispatch({
        type: "SELECT_JOB",
        job: pin as unknown as Job,
      });
      try {
        const res = await fetch(
          `/api/jobs/${pin.job_country}/${encodeURIComponent(pin.job_id)}`
        );
        const data = await res.json();
        dispatch({ type: "SET_JOB_DETAIL", job: data.job });
      } catch {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    []
  );

  const selectJobFromList = useCallback(
    async (job: Job) => {
      dispatch({ type: "SELECT_JOB", job });
      try {
        const res = await fetch(
          `/api/jobs/${job.job_country}/${encodeURIComponent(job.job_id)}`
        );
        const data = await res.json();
        dispatch({ type: "SET_JOB_DETAIL", job: data.job });
      } catch {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    []
  );

  const backToList = useCallback(() => dispatch({ type: "BACK_TO_LIST" }), []);
  const closeSidebar = useCallback(
    () => dispatch({ type: "CLOSE_SIDEBAR" }),
    []
  );

  return {
    state,
    selectCountry,
    selectJob,
    selectJobFromList,
    backToList,
    closeSidebar,
  };
}
