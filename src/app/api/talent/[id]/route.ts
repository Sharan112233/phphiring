import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

function formatTalentDetail(profile: Record<string, any>, user: Record<string, any>) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    title: profile.headline || 'PHP Developer',
    headline: profile.headline || 'PHP Developer',
    bio: profile.bio || '',
    location_city: profile.location_city || '',
    location_country: profile.location_country || '',
    location: [profile.location_city, profile.location_country].filter(Boolean).join(', '),
    hourly_rate: profile.hourly_rate_usd || 0,
    hourly_rate_usd: profile.hourly_rate_usd || 0,
    years_experience: profile.php_years || 0,
    php_years: profile.php_years || 0,
    rating: profile.avg_rating || 0,
    avg_rating: profile.avg_rating || 0,
    reviews_count: profile.total_reviews || 0,
    total_reviews: profile.total_reviews || 0,
    total_jobs: profile.total_jobs || 0,
    profile_views: profile.profile_views || 0,
    availability: profile.availability || 'available',
    hire_types: Array.isArray(profile.hire_types) ? profile.hire_types : [],
    php_versions: Array.isArray(profile.php_versions) ? profile.php_versions : [],
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    portfolio_url: profile.portfolio_url || '',
    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    remote_ok: profile.remote_ok !== false,
    verified: Boolean(profile.is_verified),
    featured: Boolean(profile.is_featured),
    type: 'individual',
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { data: profile, error } = await supabase
      .from('talent_profiles')
      .select(
        `
        *,
        user:users!user_id(id, full_name, email, user_type, is_email_verified)
      `
      )
      .eq('user_id', params.id)
      .single()

    if (error || !profile || profile.user?.user_type !== 'talent') {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 })
    }

    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.userId !== params.id) {
      await supabase
        .from('talent_profiles')
        .update({
          profile_views: (profile.profile_views || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', params.id)
    }

    return NextResponse.json(formatTalentDetail(profile, profile.user))
  } catch (error) {
    console.error('GET /api/talent/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch talent profile' }, { status: 500 })
  }
}
