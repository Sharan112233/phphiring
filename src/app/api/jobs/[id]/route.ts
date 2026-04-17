import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id, title, description, company_name, company_logo,
        poster_id, budget_type, budget_min, budget_max, duration, hire_type,
        required_skills, preferred_location, remote_ok,
        required_language, status, expires_at, created_at,
        contact_email, contact_name,
        poster:users!poster_id(id, full_name, avatar_url, email)
      `)
      .eq('id', params.id)
      .single()

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get application count for this job
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', params.id)

    const applicationsCount = applications?.length || 0

    return NextResponse.json({
      ...job,
      applications_count: applicationsCount,
    })
  } catch (err) {
    console.error('Job detail GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    )
  }
}