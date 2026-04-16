import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'
import { sendJobApplicationEmail } from '@/lib/email'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type JobWithPoster = {
  id:           string
  title:        string
  company_name: string | null
  status:       string
  expires_at:   string
  poster_id:    string
  poster:
    | { id: string; full_name: string; email: string }
    | { id: string; full_name: string; email: string }[]
    | null
}

// ─── POST /api/jobs/apply ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to apply for jobs' },
        { status: 401 }
      )
    }

    if (user.user_type !== 'talent') {
      return NextResponse.json(
        {
          error:
            'Only talent accounts can apply to jobs. Recruiters post jobs instead.',
        },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdmin()

    // ── Get fresh user data for plan + count check ───────────────────────────
    const { data: freshUser } = await supabase
      .from('users')
      .select('plan, jobs_applied_count, full_name, email')
      .eq('id', user.userId)
      .single()

    if (!freshUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ── Free plan limit check (10 applications/month) ────────────────────────
    if (freshUser.plan === 'free' && freshUser.jobs_applied_count >= 10) {
      return NextResponse.json(
        {
          error:
            'You have reached the 10 application limit on the free plan. ' +
            'Upgrade to Pro (₹99/month) for unlimited applications.',
          needs_payment:  true,
          plan_type:      'job_seeker_pro',
          current_count:  freshUser.jobs_applied_count,
        },
        { status: 402 }
      )
    }

    // ── Parse request body ───────────────────────────────────────────────────
    const body = await req.json()
    const { job_id, cover_note } = body

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      )
    }

    // ── Check if already applied ─────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', job_id)
      .eq('applicant_id', user.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        {
          error:          'You have already applied to this job.',
          application_id: existing.id,
          status:         existing.status,
        },
        { status: 409 }
      )
    }

    // ── Fetch the job ────────────────────────────────────────────────────────
    const { data: jobRaw, error: jobError } = await supabase
      .from('jobs')
      .select(
        `
        id,
        title,
        company_name,
        status,
        expires_at,
        poster_id,
        poster:users!poster_id(id, full_name, email)
        `
      )
      .eq('id', job_id)
      .single()

    if (jobError || !jobRaw) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Cast to our typed shape
    const job = jobRaw as unknown as JobWithPoster

    // ── Validate job is still open ───────────────────────────────────────────
    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications.' },
        { status: 400 }
      )
    }

    if (new Date(job.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This job posting has expired.' },
        { status: 400 }
      )
    }

    // ── Safely extract poster (Supabase may return array or object) ──────────
    const posterRaw = Array.isArray(job.poster)
      ? job.poster[0]
      : job.poster

    const poster = posterRaw as {
      id:        string
      full_name: string
      email:     string
    } | null

    if (!poster) {
      return NextResponse.json(
        { error: 'Job poster not found' },
        { status: 404 }
      )
    }

    // ── Create the application ───────────────────────────────────────────────
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        job_id,
        applicant_id: user.userId,
        cover_note:   cover_note?.trim() || null,
        status:       'pending',
      })
      .select()
      .single()

    if (appError || !application) {
      console.error('Application insert error:', appError)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // ── Increment application count ──────────────────────────────────────────
    await supabase
      .from('users')
      .update({ jobs_applied_count: freshUser.jobs_applied_count + 1 })
      .eq('id', user.userId)

    // ── Notify the recruiter (in-app) ────────────────────────────────────────
    await createNotification(
      poster.id,
      'application_received',
      'New application received',
      `${freshUser.full_name} applied to your job "${job.title}"`,
      `/dashboard/applications?job_id=${job_id}`
    )

    // ── Email the recruiter (non-blocking) ───────────────────────────────────
    sendJobApplicationEmail(
      poster.email,
      poster.full_name,
      job.title,
      freshUser.full_name,
      user.userId
    ).catch(e => console.error('Recruiter application email failed:', e))

    // ── Notify the applicant (in-app confirmation) ───────────────────────────
    await createNotification(
      user.userId,
      'application_received',
      'Application submitted!',
      `Your application for "${job.title}" at ${
        job.company_name || 'the company'
      } was submitted successfully.`,
      '/dashboard/applications'
    )

    // ── Return success ───────────────────────────────────────────────────────
    return NextResponse.json(
      {
        application,
        message: 'Application submitted successfully!',
        applications_remaining:
          freshUser.plan === 'free'
            ? Math.max(0, 10 - (freshUser.jobs_applied_count + 1))
            : null,
      },
      { status: 201 }
    )

  } catch (err) {
    console.error('Apply POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}