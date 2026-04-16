// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type UserType         = 'talent' | 'recruiter'
export type AvailabilityStatus = 'available' | 'part_time' | 'unavailable'
export type HireType         = 'freelance' | 'contract' | 'full_time' | 'part_time'
export type JobStatus        = 'open' | 'filled' | 'expired' | 'draft'
export type ApplicationStatus = 'pending' | 'viewed' | 'shortlisted' | 'selected' | 'rejected'
export type PaymentStatus    = 'created' | 'paid' | 'failed'
export type PlanType         = 'free' | 'pro'

export type NotificationType =
  | 'job_match'
  | 'application_received'
  | 'application_selected'
  | 'application_rejected'
  | 'message'
  | 'payment_success'
  | 'profile_view'
  | 'review_received'
  | 'system'

// ─── USER ─────────────────────────────────────────────────────────────────────

export interface User {
  id:                   string
  full_name:            string
  email:                string
  user_type:            UserType
  avatar_url?:          string
  is_email_verified:    boolean
  plan:                 PlanType
  jobs_applied_count:   number
  jobs_posted_count:    number
  created_at:           string
  updated_at?:          string
}

// ─── TALENT PROFILE ───────────────────────────────────────────────────────────

export interface TalentProfile {
  id:                string
  user_id:           string
  headline?:         string
  bio?:              string
  location_city?:    string
  location_country?: string
  timezone?:         string
  hourly_rate_usd?:  number
  php_years?:        number
  php_versions:      string[]
  availability:      AvailabilityStatus
  hire_types:        HireType[]
  remote_ok:         boolean
  is_verified:       boolean
  is_featured:       boolean
  is_active:         boolean
  avg_rating:        number
  total_reviews:     number
  total_jobs:        number
  profile_views:     number
  portfolio_url?:    string
  github_url?:       string
  linkedin_url?:     string
  skills:            string[]
  languages:         string[]
  created_at:        string
  updated_at?:       string
  user?:             User
}

// ─── AGENCY ───────────────────────────────────────────────────────────────────

export interface Agency {
  id:                string
  user_id:           string
  agency_name:       string
  tagline?:          string
  bio?:              string
  location_city?:    string
  location_country?: string
  website_url?:      string
  logo_url?:         string
  team_size_min?:    number
  team_size_max?:    number
  founded_year?:     number
  min_project_usd?:  number
  monthly_rate_usd?: number
  is_verified:       boolean
  is_featured:       boolean
  is_active:         boolean
  avg_rating:        number
  total_reviews:     number
  total_projects:    number
  skills:            string[]
  languages:         string[]
  created_at:        string
  updated_at?:       string
  user?:             User
}

// ─── JOB ──────────────────────────────────────────────────────────────────────

export interface Job {
  id:                  string
  poster_id:           string
  title:               string
  description:         string
  company_name?:       string
  company_logo?:       string
  budget_type:         'fixed' | 'hourly' | 'monthly'
  budget_min?:         number
  budget_max?:         number
  duration?:           string
  hire_type:           HireType
  required_skills:     string[]
  preferred_location?: string
  remote_ok:           boolean
  required_language:   string
  status:              JobStatus
  expires_at:          string
  contact_email?:      string
  contact_name?:       string
  created_at:          string
  updated_at?:         string
  applications_count?: number
  poster?:             User
}

// ─── APPLICATION ──────────────────────────────────────────────────────────────

export interface Application {
  id:           string
  job_id:       string
  applicant_id: string
  cover_note?:  string
  status:       ApplicationStatus
  created_at:   string
  updated_at?:  string
  job?:         Job
  applicant?:   User & { talent_profile?: TalentProfile }
}

// ─── REVIEW ───────────────────────────────────────────────────────────────────

export interface Review {
  id:             string
  reviewer_id:    string
  talent_id?:     string
  agency_id?:     string
  rating:         number
  title?:         string
  body:           string
  project_type?:  string
  skill_tags:     string[]
  project_value?: number
  project_date?:  string
  is_verified:    boolean
  created_at:     string
  reviewer?:      User
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

export interface Notification {
  id:         string
  user_id:    string
  type:       NotificationType
  title:      string
  message:    string
  link?:      string
  is_read:    boolean
  meta?:      Record<string, unknown>
  created_at: string
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

export interface Payment {
  id:                    string
  user_id:               string
  razorpay_order_id:     string
  razorpay_payment_id?:  string
  amount_paise:          number
  currency:              string
  purpose:               'job_seeker_pro' | 'recruiter_pro' | 'featured_listing'
  status:                PaymentStatus
  created_at:            string
}

// ─── API RESPONSE WRAPPERS ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?:    T
  error?:   string
  message?: string
}

export interface PaginatedResponse<T> {
  data:        T[]
  total:       number
  page:        number
  limit:       number
  total_pages: number
}

// ─── FILTER STATE ─────────────────────────────────────────────────────────────

export interface TalentFilterState {
  frameworks:   string[]
  cms:          string[]
  crms:         string[]
  combined:     string[]
  phpVersions:  string[]
  type:         string[]
  location:     string
  language:     string
  rateRange:    string
  availability: string
  minRating:    string
  sortBy:       string
  search:       string
}

export interface JobFilterState {
  skills:     string[]
  location:   string
  budgetType: string
  hireType:   string
  sortBy:     string
  search:     string
}