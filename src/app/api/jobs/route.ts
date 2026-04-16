import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const location = searchParams.get('location') || ''
    const budgetType = searchParams.get('budget_type') || ''
    const hireType = searchParams.get('hire_type') || ''
    const skills = searchParams.getAll('skill')
    const sortBy = searchParams.get('sort') || 'newest'

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('jobs')
      .select(
        `
        id, title, description, company_name, company_logo,
        budget_type, budget_min, budget_max, duration, hire_type,
        required_skills, preferred_location, remote_ok,
        required_language, status, expires_at, created_at,
        poster:users!poster_id(id, full_name, avatar_url)
        `,
        { count: 'exact' }
      )
      .eq('status', 'open')
      .gt('expires_at', new Date().toISOString())

    // Full text search on title + description
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,company_name.ilike.%${q}%`
      )
    }

    // Location filter
    if (location && location !== 'any') {
      query = query.ilike('preferred_location', `%${location}%`)
    }

    // Budget type filter
    if (budgetType && budgetType !== 'any') {
      query = query.eq('budget_type', budgetType)
    }

    // Hire type filter
    if (hireType && hireType !== 'any') {
      query = query.eq('hire_type', hireType)
    }

    // Skills filter — job must contain at least one of these skills
    if (skills.length > 0) {
      query = query.overlaps('required_skills', skills)
    }

    // Sort
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sortBy === 'budget_high') {
      query = query.order('budget_max', { ascending: false })
    } else if (sortBy === 'budget_low') {
      query = query.order('budget_min', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: jobs, count, error } = await query

    if (error) {
      console.error('Jobs fetch error:', error)
      throw error
    }

    // Get application counts for each job
    const jobIds = (jobs || []).map((j: { id: string }) => j.id)
    let appCounts: Record<string, number> = {}

    if (jobIds.length > 0) {
      const { data: counts } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', jobIds)

      if (counts) {
        appCounts = counts.reduce((acc: Record<string, number>, row: { job_id: string }) => {
          acc[row.job_id] = (acc[row.job_id] || 0) + 1
          return acc
        }, {})
      }
    }

    const jobsWithCounts = (jobs || []).map((j: Record<string, unknown>) => ({
      ...j,
      applications_count: appCounts[j.id as string] || 0,
    }))

    return NextResponse.json({
      jobs: jobsWithCounts,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    })

  } catch (err) {
    console.error('Jobs GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to post a job' },
        { status: 401 }
      )
    }

    if (user.user_type !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiter accounts can post jobs. Please register as a recruiter.' },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get fresh user data for plan + count check
    const { data: freshUser } = await supabase
      .from('users')
      .select('plan, jobs_posted_count')
      .eq('id', user.userId)
      .single()

    if (!freshUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check free plan limit (3 jobs/month)
    if (freshUser.plan === 'free' && freshUser.jobs_posted_count >= 3) {
      return NextResponse.json(
        {
          error:
            'You have reached the 3 job posting limit on the free plan. Upgrade to Pro (₹99/month) for unlimited postings.',
          needs_payment: true,
          plan_type: 'recruiter_pro',
        },
        { status: 402 }
      )
    }

    const body = await req.json()

    const {
      title,
      description,
      company_name,
      budget_type,
      budget_min,
      budget_max,
      duration,
      hire_type,
      required_skills,
      preferred_location,
      remote_ok,
      required_language,
      contact_email,
      contact_name,
    } = body

    // Required field validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    if (title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      )
    }

    if (description.trim().length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      )
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert({
        poster_id: user.userId,
        title: title.trim(),
        description: description.trim(),
        company_name: company_name?.trim() || null,
        budget_type: budget_type || 'fixed',
        budget_min: budget_min ? parseFloat(budget_min) : null,
        budget_max: budget_max ? parseFloat(budget_max) : null,
        duration: duration || null,
        hire_type: hire_type || 'freelance',
        required_skills: required_skills || [],
        preferred_location: preferred_location || 'Remote',
        remote_ok: remote_ok !== false,
        required_language: required_language || 'English',
        contact_email: contact_email || null,
        contact_name: contact_name || null,
        status: 'open',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (insertError || !job) {
      console.error('Job insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create job posting' },
        { status: 500 }
      )
    }

    // Increment posted count
    await supabase
      .from('users')
      .update({ jobs_posted_count: freshUser.jobs_posted_count + 1 })
      .eq('id', user.userId)

    // Notify matching talent users (limit to 100 to avoid overload)
    const { data: talentUsers } = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'talent')
      .eq('is_email_verified', true)
      .limit(100)

    if (talentUsers && talentUsers.length > 0) {
      const skillsPreview =
        (required_skills || []).slice(0, 3).join(', ') || 'PHP'

      const notifications = talentUsers.map((t: { id: string }) => ({
        user_id: t.id,
        type: 'job_match',
        title: `New PHP job: ${title.trim()}`,
        message: `${company_name || 'A business'} is hiring for ${skillsPreview}. Check if it matches your skills!`,
        link: `/jobs/${job.id}`,
        is_read: false,
      }))

      // Insert in batches of 50
      for (let i = 0; i < notifications.length; i += 50) {
        await supabase
          .from('notifications')
          .insert(notifications.slice(i, i + 50))
      }
    }

    return NextResponse.json(
      {
        job,
        message: 'Job posted successfully! Matching PHP talent has been notified.',
      },
      { status: 201 }
    )

  } catch (err) {
    console.error('Jobs POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}