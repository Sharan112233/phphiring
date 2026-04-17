import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 50), 1), 100)

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionUser.userId

    const supabase = getSupabaseAdmin()
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, user_type')
      .eq('id', userId)
      .single()

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isTalent = dbUser.user_type === 'talent'
    let query = supabase
      .from('applications')
      .select(
        `
        id,
        job_id,
        applicant_id,
        cover_note,
        status,
        created_at,
        updated_at,
        job:jobs!job_id(
          id,
          title,
          company_name,
          budget_min,
          budget_max,
          budget_type,
          hire_type,
          required_skills,
          preferred_location,
          poster_id
        ),
        applicant:users!applicant_id(
          id,
          full_name,
          email,
          talent_profile:talent_profiles(
            headline,
            hourly_rate_usd,
            location_city,
            location_country,
            skills,
            availability,
            php_years
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (isTalent) {
      query = query.eq('applicant_id', userId)
    } else {
      const { data: recruiterJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('poster_id', userId)

      if (jobsError) {
        console.error('GET /api/applications recruiter jobs error:', jobsError)
        return NextResponse.json({ error: 'Failed to fetch recruiter applications' }, { status: 500 })
      }

      const jobIds = (recruiterJobs || []).map((job) => job.id)
      if (jobIds.length === 0) {
        return NextResponse.json({
          applications: [],
          total: 0,
          role: 'recruiter',
        })
      }
      query = query.in('job_id', jobIds)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: applications, count, error } = await query

    if (error) {
      console.error('GET /api/applications error:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({
      applications: applications || [],
      total: count || 0,
      role: isTalent ? 'talent' : 'recruiter',
    })
  } catch (error) {
    console.error('GET /api/applications unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.user_type !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can review applications' }, { status: 403 })
    }

    const { application_id, status } = await req.json()
    if (!application_id || !['shortlisted', 'rejected', 'selected', 'viewed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid application update request' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: application, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        applicant_id,
        status,
        job:jobs!job_id(id, title, poster_id, company_name)
      `
      )
      .eq('id', application_id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const job = Array.isArray(application.job) ? application.job[0] : application.job
    if (!job || job.poster_id !== sessionUser.userId) {
      return NextResponse.json({ error: 'You do not have access to this application' }, { status: 403 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id)
      .select('*')
      .single()

    if (updateError || !updated) {
      console.error('PATCH /api/applications update error:', updateError)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    if (status === 'shortlisted') {
      await createNotification(
        application.applicant_id,
        'system',
        'You were shortlisted',
        `You were shortlisted for "${job.title}" at ${job.company_name || 'a company'}.`,
        '/dashboard/applications'
      )
    }

    if (status === 'rejected') {
      await createNotification(
        application.applicant_id,
        'application_rejected',
        'Application update',
        `Your application for "${job.title}" was not selected this time.`,
        '/dashboard/applications'
      )
    }

    if (status === 'selected') {
      await createNotification(
        application.applicant_id,
        'application_selected',
        'You were selected',
        `You were selected for "${job.title}" at ${job.company_name || 'a company'}.`,
        '/dashboard/applications'
      )
    }

    return NextResponse.json({ application: updated, message: 'Application updated successfully' })
  } catch (error) {
    console.error('PATCH /api/applications unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
