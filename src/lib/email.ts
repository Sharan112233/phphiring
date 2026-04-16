import nodemailer from 'nodemailer'

// ─── TRANSPORTER ─────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const FROM     = `"PHPhire" <${process.env.GMAIL_USER}>`
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ─── BASE TEMPLATE ────────────────────────────────────────────────────────────

function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F5F4F0;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 15px;
      color: #3D3558;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 580px;
      margin: 32px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #0F0A1E 0%, #1E1035 100%);
      padding: 24px 32px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .logo span { color: #C4B5FD; }
    .body { padding: 32px; }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0F0A1E;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      color: #3D3558;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    .otp-box {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #7C3AED;
      text-align: center;
      padding: 22px;
      background: #EDE9FE;
      border-radius: 12px;
      margin: 20px 0;
      border: 2px dashed #C4B5FD;
    }
    .btn {
      display: inline-block;
      background: #7C3AED;
      color: #fff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      margin: 6px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-green { background: #D1FAE5; color: #065F46; }
    .badge-purple { background: #EDE9FE; color: #5B21B6; }
    .divider {
      border: none;
      border-top: 1px solid #E8E4F0;
      margin: 20px 0;
    }
    .notice {
      background: #FEF3C7;
      border-left: 3px solid #D97706;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #92400E;
      margin: 16px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid #E8E4F0;
    }
    .info-row:last-child { border-bottom: none; }
    .info-box {
      background: #FAFAF9;
      border: 1px solid #E8E4F0;
      border-radius: 8px;
      overflow: hidden;
      margin: 14px 0;
    }
    .footer {
      background: #FAFAF9;
      padding: 18px 32px;
      border-top: 1px solid #E8E4F0;
    }
    .footer p {
      font-size: 12px;
      color: #9CA3AF;
      margin: 0;
      line-height: 1.6;
    }
    .footer a { color: #7C3AED; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">PHP<span>hire</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} PHPhire · The PHP Talent Marketplace ·
        <a href="${APP_URL}">phphire.dev</a>
      </p>
      <p style="margin-top:4px">
        If you did not request this email, you can safely ignore it.
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── OTP EMAIL ────────────────────────────────────────────────────────────────

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  const content = `
    <h1>Verify your email address</h1>
    <p>Hi ${name}, welcome to PHPhire! Please use the code below to verify your email address and activate your account.</p>
    <div class="otp-box">${otp}</div>
    <p style="text-align:center;font-size:13px;color:#7B7494">
      This code expires in <strong>10 minutes</strong>.
    </p>
    <div class="notice">
      🔒 Never share this code with anyone. PHPhire will never ask for your OTP over call or chat.
    </div>
  `
  await transporter.sendMail({
    from,
    to:      email,
    subject: `${otp} is your PHPhire verification code`,
    html:    baseTemplate(content, 'Verify your PHPhire account'),
  })
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string,
  userType: string
): Promise<void> {
  const isTalent = userType === 'talent'
  const content  = `
    <h1>Welcome to PHPhire! 🐘</h1>
    <p>Hi ${name}, your account is verified and ready to go.</p>
    <p>
      You have joined as a
      <span class="badge badge-purple">
        ${isTalent ? '👨‍💻 PHP Developer' : '🏢 Recruiter'}
      </span>
    </p>
    ${isTalent
      ? `<p>Complete your PHP profile to start getting found by businesses looking for exactly your skills.</p>
         <a href="${APP_URL}/dashboard/profile" class="btn">Complete your profile →</a>`
      : `<p>Start posting PHP jobs and get matched with verified experts immediately.</p>
         <a href="${APP_URL}/post-job" class="btn">Post your first job →</a>`
    }
    <hr class="divider" />
    <div class="info-box">
      <div class="info-row">
        <span style="color:#7B7494">Your plan</span>
        <span><strong>Free</strong></span>
      </div>
      <div class="info-row">
        <span style="color:#7B7494">${isTalent ? 'Applications/month' : 'Job postings/month'}</span>
        <span><strong>${isTalent ? '10 (upgrade for unlimited)' : '3 (upgrade for unlimited)'}</strong></span>
      </div>
    </div>
  `
  await transporter.sendMail({
    from,
    to:      email,
    subject: 'Welcome to PHPhire — Your PHP talent hub 🐘',
    html:    baseTemplate(content, 'Welcome to PHPhire'),
  })
}

// ─── JOB APPLICATION EMAIL (to recruiter) ────────────────────────────────────

export async function sendJobApplicationEmail(
  recruiterEmail: string,
  recruiterName: string,
  jobTitle: string,
  applicantName: string,
  applicantId: string
): Promise<void> {
  const content = `
    <h1>New application received</h1>
    <p>Hi ${recruiterName},</p>
    <p>
      <strong>${applicantName}</strong> has applied to your job posting:
      <strong>"${jobTitle}"</strong>
    </p>
    <a href="${APP_URL}/dashboard/applications" class="btn">
      View Application →
    </a>
    <hr class="divider" />
    <p style="font-size:13px;color:#7B7494">
      You can shortlist, select or reject applicants from your applications dashboard.
      The applicant will be notified of your decision via email.
    </p>
  `
  await transporter.sendMail({
    from,
    to:      recruiterEmail,
    subject: `New PHP application received: ${jobTitle}`,
    html:    baseTemplate(content, 'New Job Application'),
  })
}

// ─── APPLICATION STATUS EMAIL (to talent) ────────────────────────────────────

export async function sendApplicationStatusEmail(
  talentEmail: string,
  talentName: string,
  jobTitle: string,
  status: 'selected' | 'rejected' | 'shortlisted',
  companyName?: string
): Promise<void> {
  const statusMap = {
    selected: {
      emoji:   '🎉',
      subject: `Congratulations! You were selected for ${jobTitle}`,
      heading: 'You have been selected!',
      color:   '#D1FAE5',
      border:  '#059669',
      text:    '#065F46',
      message: 'Congratulations! The recruiter has selected your application. They will reach out to you shortly with next steps.',
    },
    shortlisted: {
      emoji:   '⭐',
      subject: `You were shortlisted for ${jobTitle}`,
      heading: 'You have been shortlisted!',
      color:   '#FEF3C7',
      border:  '#D97706',
      text:    '#92400E',
      message: 'Great news! The recruiter has shortlisted your application. They are still reviewing candidates and will update you soon.',
    },
    rejected: {
      emoji:   '📋',
      subject: `Application update: ${jobTitle}`,
      heading: 'Application update',
      color:   '#FEE2E2',
      border:  '#DC2626',
      text:    '#991B1B',
      message: 'Thank you for your interest. Unfortunately, the recruiter has moved forward with other candidates for this role. Keep applying — there are many more PHP opportunities on PHPhire!',
    },
  }

  const s       = statusMap[status]
  const company = companyName ? ` at <strong>${companyName}</strong>` : ''

  const content = `
    <h1>${s.emoji} ${s.heading}</h1>
    <p>Hi ${talentName},</p>
    <p>
      Your application for <strong>"${jobTitle}"</strong>${company} has been updated.
    </p>
    <div style="background:${s.color};border-left:4px solid ${s.border};padding:16px 20px;border-radius:0 10px 10px 0;margin:16px 0">
      <p style="color:${s.text};margin:0;font-weight:600;font-size:16px">
        Status: ${status.toUpperCase()}
      </p>
      <p style="color:${s.text};margin:8px 0 0;font-size:14px">
        ${s.message}
      </p>
    </div>
    <a href="${APP_URL}/dashboard/applications" class="btn">
      View all applications →
    </a>
  `
  await transporter.sendMail({
    from,
    to:      talentEmail,
    subject: s.subject,
    html:    baseTemplate(content, s.subject),
  })
}

// ─── PAYMENT SUCCESS EMAIL ────────────────────────────────────────────────────

export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  planName: string,
  amountInRupees: number
): Promise<void> {
  const content = `
    <h1>Payment successful ✅</h1>
    <p>Hi ${name}, your payment has been confirmed and your plan is now active!</p>
    <div class="info-box">
      <div class="info-row">
        <span style="color:#7B7494">Plan activated</span>
        <span><strong>${planName}</strong></span>
      </div>
      <div class="info-row">
        <span style="color:#7B7494">Amount paid</span>
        <span style="color:#7C3AED;font-weight:700">₹${amountInRupees}</span>
      </div>
      <div class="info-row">
        <span style="color:#7B7494">Status</span>
        <span class="badge badge-green">Active</span>
      </div>
    </div>
    <p>Your Pro access is now fully active. Enjoy unlimited features!</p>
    <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard →</a>
    <hr class="divider" />
    <p style="font-size:12px;color:#9CA3AF">
      Payment processed securely via Razorpay.
      Keep this email as your payment receipt.
    </p>
  `
  await transporter.sendMail({
    from,
    to:      email,
    subject: `PHPhire Pro activated — ₹${amountInRupees} payment confirmed`,
    html:    baseTemplate(content, 'Payment Successful'),
  })
}

// ─── JOB ALERT EMAIL (to talent) ─────────────────────────────────────────────

export async function sendNewJobAlertEmail(
  email: string,
  name: string,
  jobs: Array<{
    id:       string
    title:    string
    company?: string
    skills:   string[]
    budget?:  string
  }>
): Promise<void> {
  const jobItems = jobs
    .map(
      j => `
      <div style="border:1px solid #E8E4F0;border-radius:10px;padding:14px 16px;margin-bottom:10px">
        <div style="font-size:15px;font-weight:700;color:#0F0A1E;margin-bottom:3px">${j.title}</div>
        ${j.company ? `<div style="font-size:12px;color:#7B7494;margin-bottom:8px">@ ${j.company}</div>` : ''}
        <div style="margin-bottom:8px">
          ${j.skills
            .slice(0, 4)
            .map(
              s =>
                `<span style="background:#EDE9FE;color:#5B21B6;padding:2px 8px;border-radius:12px;font-size:11px;margin-right:4px;font-weight:600">${s}</span>`
            )
            .join('')}
        </div>
        ${j.budget ? `<div style="font-size:13px;font-weight:700;color:#7C3AED;margin-bottom:8px">${j.budget}</div>` : ''}
        <a href="${APP_URL}/jobs/${j.id}" style="font-size:13px;color:#7C3AED;font-weight:600;text-decoration:none">
          View & Apply →
        </a>
      </div>
    `
    )
    .join('')

  const content = `
    <h1>New PHP jobs matching your skills 💼</h1>
    <p>Hi ${name}, here are the latest job postings that match your PHP profile:</p>
    ${jobItems}
    <a href="${APP_URL}/jobs" class="btn">Browse all PHP jobs →</a>
    <hr class="divider" />
    <p style="font-size:12px;color:#9CA3AF">
      You are receiving this because you have job alerts enabled.
      <a href="${APP_URL}/dashboard/profile">Manage preferences</a>
    </p>
  `
  await transporter.sendMail({
    from,
    to:      email,
    subject: `${jobs.length} new PHP job${jobs.length > 1 ? 's' : ''} matching your skills`,
    html:    baseTemplate(content, 'New PHP Job Alerts'),
  })
}

// fix: use const FROM for the from field
const from = FROM