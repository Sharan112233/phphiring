# PHPhire

The world's only PHP talent marketplace. Connect businesses with verified PHP experts filtered by framework, CRM, stack, location and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT with HTTP-only cookies |
| Payments | Razorpay (UPI, Cards, Net Banking) |
| Email | Nodemailer with Gmail App Password |
| Styling | Pure CSS (no Tailwind) |
| Hosting | Vercel (recommended) |

---

## Features

### For PHP Developers
- Create a verified PHP-only profile
- Browse and apply to PHP jobs
- Track application status in dashboard
- Upgrade to Pro for unlimited applications

### For Recruiters
- Post PHP job listings
- Browse verified PHP talent
- Hiring pipeline — manage applications (shortlist, select, reject)
- Real-time notifications when developers apply
- Contact PHP agencies

### General
- Role-based experience — separate UI for talent and recruiters
- OTP email verification on signup
- Forgot password with OTP reset flow
- Razorpay payment integration (UPI, cards, net banking)
- Notifications system
- PHP Resources page

---

## Plans and Pricing

| Plan | Price | For |
|------|-------|-----|
| Free | ₹0 | 10 applications or 3 job posts/month |
| Job Seeker Pro | ₹99/month | Unlimited applications |
| Recruiter Pro | ₹99/month | Unlimited job postings |
| Featured Profile | ₹199/30 days | 3x profile visibility |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/phphire.git
cd phphire
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_random_secret_key_minimum_32_characters

# Gmail
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
```

### 4. Set up the database

- Go to your Supabase project → SQL Editor
- Run the contents of `supabase-schema.sql`
- Then run these additional migration statements:

```sql
alter table notifications add column if not exists link text;
alter table notifications add column if not exists meta jsonb;
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `JWT_SECRET` | Any random string — [generate one here](https://generate-secret.vercel.app/32) |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail → Settings → Security → App Passwords |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |

---

## Gmail App Password Setup

1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Go to Security → App Passwords
4. Select app: Mail, device: Other → type `PHPhire`
5. Copy the 16-character password into `GMAIL_APP_PASSWORD`

---

## Project Structure

```
phphire/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # login, register, verify-otp, reset-password, me
│   │   │   ├── jobs/          # list, create, [id], apply
│   │   │   ├── applications/  # list, update status
│   │   │   ├── talent/        # browse talent, [id]
│   │   │   ├── agencies/      # agency listings
│   │   │   ├── notifications/ # list, mark-read
│   │   │   └── payments/      # create-order, verify
│   │   ├── auth/login/
│   │   ├── browse/
│   │   ├── dashboard/
│   │   │   ├── applications/  # hiring pipeline / my applications
│   │   │   ├── payments/
│   │   │   └── profile/
│   │   ├── jobs/[id]/
│   │   ├── talent/[id]/
│   │   ├── agencies/
│   │   ├── notifications/
│   │   ├── post-job/
│   │   ├── resources/
│   │   └── join/
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # PageLoader, PaymentModal
│   ├── lib/
│   │   ├── auth.ts            # JWT, bcrypt, session cookie
│   │   ├── email.ts           # Nodemailer OTP emails
│   │   ├── notifications.ts   # createNotification helper
│   │   ├── razorpay.ts        # Razorpay order helpers
│   │   └── supabase.ts        # Supabase client + admin client
│   ├── styles/globals.css
│   └── types/index.ts
├── middleware.ts               # Route protection
├── supabase-schema.sql
└── .env.local                  ← never commit this
```

---

## User Roles

### Talent (PHP Developer)
- Registers as **Developer**
- Completes PHP-only profile
- Applies to jobs (10/month free, unlimited on Pro)
- Tracks application status — pending, shortlisted, selected, rejected

### Recruiter (Business / Hiring)
- Registers as **Hiring**
- Posts jobs (3/month free, unlimited on Pro)
- Views hiring pipeline with all posted jobs
- Manages incoming applications — shortlist, select, reject
- Gets notified when a developer applies

---

## Deploying to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/phphire.git
git push -u origin main
```

- Go to [vercel.com](https://vercel.com) → New Project → Import your repo
- Add all environment variables from `.env.local`
- Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Click Deploy

After deployment:
- Update `NEXT_PUBLIC_APP_URL` to your live domain
- Add your Vercel domain to allowed origins in Razorpay dashboard
- Switch from test keys to live keys when ready

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

MIT License — free to use and modify for your own projects.

---

## Contact

Built with ❤️ for the PHP community.  
For support or questions, open an issue on GitHub.
