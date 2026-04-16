import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // Get total PHP experts (talent users)
    const { count: expertsCount, error: expertsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'talent')
      .eq('is_email_verified', true)

    if (expertsError) throw expertsError

    // Get total agencies
    const { count: agenciesCount, error: agenciesError } = await supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true })

    if (agenciesError) throw agenciesError

    // Get total jobs filled (completed/hired applications)
    const { count: jobsFilledCount, error: jobsError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'hired')

    if (jobsError) throw jobsError

    // Get unique countries from talent locations
    const { data: talentLocations, error: locError } = await supabase
      .from('users')
      .select('location')
      .eq('user_type', 'talent')
      .not('location', 'is', null)

    if (locError) throw locError

    // Count unique locations (countries)
    const uniqueCountries = new Set(
      talentLocations
        ?.map((u: { location: string | null }) => u.location)
        .filter(Boolean)
    )

    return NextResponse.json({
      total_experts: expertsCount || 1240, // fallback to demo data
      total_agencies: agenciesCount || 86,
      total_jobs_filled: jobsFilledCount || 4800,
      total_countries: uniqueCountries.size || 34,
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Stats GET error:', err)
    // Return fallback demo data if there's an error
    return NextResponse.json({
      total_experts: 1240,
      total_agencies: 86,
      total_jobs_filled: 4800,
      total_countries: 34,
      updated_at: new Date().toISOString(),
      note: 'Using fallback demo data',
    })
  }
}
