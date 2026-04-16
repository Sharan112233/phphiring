# PHPhire — PHP Talent Marketplace

The world's only PHP-first talent marketplace. Connect businesses
with verified PHP experts filtered by framework, CRM, stack,
location and more.

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Database** — Supabase (PostgreSQL)
- **Auth** — Custom JWT with HTTP-only cookies
- **Payments** — Razorpay (UPI, Cards, Net Banking)
- **Email** — Nodemailer with Gmail App Password
- **Styling** — Pure CSS (no Tailwind)
- **Hosting** — Vercel (recommended)

---

## Features

### For PHP Developers
- Create a verified PHP-only profile
- Browse and apply to PHP jobs
- Track application status
- Upgrade to Pro for unlimited applications

### For Recruiters
- Post PHP job listings
- Browse verified PHP talent
- Manage applications — shortlist, select, reject
- Contact PHP agencies

### General
- Role-based experience — separate UI for talent and recruiters
- OTP email verification on signup
- Forgot password with OTP reset flow
- Razorpay payment integration
- Notifications system
- PHP Resources page

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/yourusername/phphire.git
cd phphire

### 2. Install dependencies

npm install

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_random_secret_key_minimum_32_characters

# Gmail (for sending OTP emails)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx

### 4. Set up the database

- Go to your Supabase project
- Open SQL Editor
- Run the contents of `supabase-schema.sql`

### 5. Run the development server

npm run dev

Open http://localhost:3000 in your browser.

---

## Environment Variables Guide

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `JWT_SECRET` | Any random string — use https://generate-secret.vercel.app/32 |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail → Settings → Security → App Passwords |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |

---

## Gmail App Password Setup

1. Go to your Google Account → Security
2. Enable 2-Step Verification if not already enabled
3. Go to Security → App Passwords
4. Select app: Mail, Select device: Other
5. Type PHPhire and click Generate
6. Copy the 16-character password into `GMAIL_APP_PASSWORD`

---

## Deploying to Vercel

### 1. Push to GitHub

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/phphire.git
git push -u origin main

### 2. Deploy on Vercel

- Go to https://vercel.com
- Click New Project
- Import your GitHub repository
- Add all environment variables from `.env.local`
- Change `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Click Deploy

### 3. After deployment

- Update `NEXT_PUBLIC_APP_URL` to your live domain
- In Razorpay dashboard — add your Vercel domain to allowed origins
- Switch from test keys to live keys when ready

---
```bash
## Project Structure

phphire/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── register/
│   │   │   │   ├── verify-otp/
│   │   │   │   ├── resend-otp/
│   │   │   │   ├── reset-password/
│   │   │   │   └── me/
│   │   │   ├── jobs/
│   │   │   ├── talent/
│   │   │   ├── applications/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   └── profile/
│   │   ├── auth/login/
│   │   ├── browse/
│   │   ├── dashboard/
│   │   │   ├── applications/
│   │   │   ├── payments/
│   │   │   └── profile/
│   │   ├── jobs/[id]/
│   │   ├── talent/[id]/
│   │   ├── agencies/
│   │   ├── notifications/
│   │   ├── post-job/
│   │   ├── resources/
│   │   ├── join/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       └── PaymentModal.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   ├── notifications.ts
│   │   ├── razorpay.ts
│   │   └── supabase.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts
├── middleware.ts
├── next.config.js
├── tsconfig.json
├── supabase-schema.sql
├── .env.local          ← never commit this
├── .gitignore
└── README.md
```
---

## User Roles

### Talent (PHP Developer)
- Registers as Developer
- Completes PHP-only profile
- Applies to jobs (10/month free, unlimited on Pro)
- Tracks applications

### Recruiter (Business / Hiring)
- Registers as Hiring
- Posts jobs (3/month free, unlimited on Pro)
- Browses PHP talent
- Manages received applications

---

## Plans and Pricing

| Plan | Price | For |
|------|-------|-----|
| Free | Rs.0 | 10 applications or 3 job posts per month |
| Job Seeker Pro | Rs.99/month | Unlimited applications |
| Recruiter Pro | Rs.99/month | Unlimited job postings |
| Featured Profile | Rs.199/30 days | 3x profile visibility |

---

## Scripts

npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

---

## License

MIT License — feel free to use and modify for your own projects.

---

## Contact

Built with PHP for the PHP community.
For support or questions open an issue on GitHub.
