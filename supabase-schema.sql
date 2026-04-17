create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_type_enum') then
    create type user_type_enum as enum ('talent', 'recruiter');
  end if;

  if not exists (select 1 from pg_type where typname = 'availability_status_enum') then
    create type availability_status_enum as enum ('available', 'part_time', 'unavailable');
  end if;

  if not exists (select 1 from pg_type where typname = 'hire_type_enum') then
    create type hire_type_enum as enum ('freelance', 'contract', 'full_time', 'part_time');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status_enum') then
    create type job_status_enum as enum ('open', 'filled', 'expired', 'draft');
  end if;

  if not exists (select 1 from pg_type where typname = 'application_status_enum') then
    create type application_status_enum as enum ('pending', 'viewed', 'shortlisted', 'selected', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status_enum') then
    create type payment_status_enum as enum ('created', 'paid', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_type_enum') then
    create type plan_type_enum as enum ('free', 'pro');
  end if;

  if not exists (select 1 from pg_type where typname = 'budget_type_enum') then
    create type budget_type_enum as enum ('fixed', 'hourly', 'monthly');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type_enum') then
    create type notification_type_enum as enum (
      'job_match',
      'application_received',
      'application_selected',
      'application_rejected',
      'message',
      'payment_success',
      'profile_view',
      'review_received',
      'system'
    );
  end if;
end $$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  user_type user_type_enum not null,
  avatar_url text,
  is_email_verified boolean not null default false,
  otp_code text,
  otp_expires_at timestamptz,
  plan plan_type_enum not null default 'free',
  jobs_applied_count integer not null default 0,
  jobs_posted_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists talent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  headline text,
  bio text,
  location_city text,
  location_country text,
  timezone text,
  hourly_rate_usd numeric(10,2),
  php_years integer not null default 0,
  php_versions text[] not null default '{}',
  availability availability_status_enum not null default 'available',
  hire_types hire_type_enum[] not null default '{freelance}',
  remote_ok boolean not null default true,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  avg_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  total_jobs integer not null default 0,
  profile_views integer not null default 0,
  portfolio_url text,
  github_url text,
  linkedin_url text,
  certifications text[] not null default '{}',
  skills text[] not null default '{}',
  languages text[] not null default '{"English"}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  agency_name text not null,
  tagline text,
  bio text,
  location_city text,
  location_country text,
  website_url text,
  logo_url text,
  team_size_min integer,
  team_size_max integer,
  founded_year integer,
  min_project_usd numeric(12,2),
  monthly_rate_usd numeric(12,2),
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  avg_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  total_projects integer not null default 0,
  skills text[] not null default '{}',
  languages text[] not null default '{"English"}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  company_name text,
  company_logo text,
  budget_type budget_type_enum not null default 'fixed',
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  duration text,
  hire_type hire_type_enum not null default 'freelance',
  required_skills text[] not null default '{}',
  preferred_location text,
  remote_ok boolean not null default true,
  required_language text not null default 'English',
  status job_status_enum not null default 'open',
  expires_at timestamptz not null,
  contact_email text,
  contact_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  applicant_id uuid not null references users(id) on delete cascade,
  cover_note text,
  status application_status_enum not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint unique_job_application unique (job_id, applicant_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type notification_type_enum not null,
  title text not null,
  message text not null,
  link text,
  meta jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references users(id) on delete cascade,
  talent_id uuid references talent_profiles(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
  title text,
  body text not null,
  project_type text,
  skill_tags text[] not null default '{}',
  project_value numeric(12,2),
  project_date date,
  is_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  amount_paise integer not null,
  currency text not null default 'INR',
  purpose text not null check (purpose in ('job_seeker_pro', 'recruiter_pro', 'featured_listing')),
  status payment_status_enum not null default 'created',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_user_type on users(user_type);
create index if not exists idx_talent_profiles_user_id on talent_profiles(user_id);
create index if not exists idx_talent_profiles_active on talent_profiles(is_active, availability);
create index if not exists idx_talent_profiles_skills on talent_profiles using gin(skills);
create index if not exists idx_talent_profiles_php_versions on talent_profiles using gin(php_versions);
create index if not exists idx_jobs_poster_id on jobs(poster_id);
create index if not exists idx_jobs_status_expires on jobs(status, expires_at desc);
create index if not exists idx_jobs_required_skills on jobs using gin(required_skills);
create index if not exists idx_applications_job_id on applications(job_id);
create index if not exists idx_applications_applicant_id on applications(applicant_id);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);
create index if not exists idx_payments_user_id on payments(user_id);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists trg_talent_profiles_updated_at on talent_profiles;
create trigger trg_talent_profiles_updated_at
before update on talent_profiles
for each row execute function set_updated_at();

drop trigger if exists trg_agencies_updated_at on agencies;
create trigger trg_agencies_updated_at
before update on agencies
for each row execute function set_updated_at();

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at
before update on jobs
for each row execute function set_updated_at();

drop trigger if exists trg_applications_updated_at on applications;
create trigger trg_applications_updated_at
before update on applications
for each row execute function set_updated_at();
