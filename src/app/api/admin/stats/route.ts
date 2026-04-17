import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const { count: expertsCount, error: expertsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'talent')
      .eq('is_email_verified', true)

    if (expertsError) throw expertsError

    const { count: companiesHiringCount, error: companiesError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'recruiter')
      .eq('is_email_verified', true)

    if (companiesError) throw companiesError

    const { count: applicationsCount, error: applicationsError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'viewed', 'shortlisted', 'selected'])

    if (applicationsError) throw applicationsError

    const { count: openJobsCount, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .gt('expires_at', new Date().toISOString())

    if (jobsError) throw jobsError

    const { data: talentLocations, error: locError } = await supabase
      .from('talent_profiles')
      .select('location_country')

    if (locError) throw locError

    const uniqueCountries = new Set(
      talentLocations
        ?.map((u: { location_country: string | null }) => u.location_country)
        .filter(Boolean)
    )

    return NextResponse.json({
      total_experts: expertsCount || 0,
      total_companies_hiring: companiesHiringCount || 0,
      total_live_jobs: openJobsCount || 0,
      total_applications: applicationsCount || 0,
      total_countries: uniqueCountries.size || 0,
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Stats GET error:', err)
    return NextResponse.json({
      total_experts: 0,
      total_companies_hiring: 0,
      total_live_jobs: 0,
      total_applications: 0,
      total_countries: 0,
      updated_at: new Date().toISOString(),
    })
  }
}
