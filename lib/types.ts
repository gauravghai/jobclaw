export interface Job {
  _id: string;
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_publisher: string;
  job_employment_type: string;
  job_apply_link: string;
  job_apply_is_direct: boolean;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at: string;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
  job_location: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_latitude: number;
  job_longitude: number;
  job_salary: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_period: string | null;
  skills: string[];
  experience_level: string;
  source: string;
}

export interface JobPin {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_country: string;
  job_city: string;
  job_state: string;
  job_latitude: number;
  job_longitude: number;
  job_employment_type: string;
  job_is_remote: boolean;
  experience_level: string;
  skills: string[];
}

export interface ResumeData {
  name: string;
  skills: string[];
  experience_years: number;
  experience_level: string;
  education: string;
  summary: string;
}

export interface CountryJobCount {
  country: string;
  count: number;
}

export type SidebarMode = "closed" | "country-list" | "job-detail";
