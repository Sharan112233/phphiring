import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

function normalizeTalent(profile: Record<string, any>, user?: Record<string, any>) {
  const fullName = user?.full_name || 'Unknown Developer'
  const initials = fullName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PD'

  const avatarColors = [
    { bg: '#EDE9FE', text: '#5B21B6' },
    { bg: '#DBEAFE', text: '#1E40AF' },
    { bg: '#D1FAE5', text: '#065F46' },
    { bg: '#FEF3C7', text: '#92400E' },
    { bg: '#FCE7F3', text: '#9D174D' },
    { bg: '#ECFDF5', text: '#064E3B' },
  ]

  const colorIndex = (profile.user_id?.charCodeAt(0) || 0) % avatarColors.length
  const colors = avatarColors[colorIndex]

  return {
    id: profile.user_id,
    user_id: profile.user_id,
    full_name: fullName,
    email: user?.email || '',
    initials,
    avatarBg: colors.bg,
    avatarTc: colors.text,
    headline: profile.headline || 'PHP Developer',
    bio: profile.bio || '',
    location_city: profile.location_city || 'Remote',
    location_country: profile.location_country || '',
    location: [profile.location_city, profile.location_country].filter(Boolean).join(', '),
    hourly_rate_usd: profile.hourly_rate_usd || 0,
    php_years: profile.php_years || 0,
    avg_rating: profile.avg_rating || 0,
    total_reviews: profile.total_reviews || 0,
    total_jobs: profile.total_jobs || 0,
    profile_views: profile.profile_views || 0,
    availability: profile.availability || 'available',
    hire_types: Array.isArray(profile.hire_types) ? profile.hire_types : ['freelance'],
    is_verified: Boolean(profile.is_verified),
    is_featured: Boolean(profile.is_featured),
    languages: Array.isArray(profile.languages) ? profile.languages : ['English'],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    php_versions: Array.isArray(profile.php_versions) ? profile.php_versions : [],
    portfolio_url: profile.portfolio_url || '',
    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    remote_ok: profile.remote_ok !== false,
    type: 'individual',
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const availability = searchParams.get('availability') || ''
    const skillFilters = searchParams.getAll('skill')
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 100), 1), 100)

    const supabase = getSupabaseAdmin()
    const { data: profiles, error } = await supabase
      .from('talent_profiles')
      .select(
        `
        *,
        user:users!user_id(id, full_name, email, user_type, is_email_verified)
      `
      )
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('avg_rating', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('GET /api/talent error:', error)
      return NextResponse.json({ error: 'Failed to fetch talent' }, { status: 500 })
    }

    let talent = (profiles || [])
      .filter((profile: any) => profile.user?.user_type === 'talent' && profile.user?.is_email_verified)
      .map((profile: any) => normalizeTalent(profile, profile.user))

    if (q) {
      talent = talent.filter((item) =>
        item.full_name.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.bio.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.skills.some((skill: string) => skill.toLowerCase().includes(q))
      )
    }

    if (availability && availability !== 'all') {
      talent = talent.filter((item) => item.availability === availability)
    }

    if (skillFilters.length > 0) {
      const lowered = skillFilters.map((skill) => skill.toLowerCase())
      talent = talent.filter((item) =>
        item.skills.some((skill: string) => lowered.includes(skill.toLowerCase()))
      )
    }

    return NextResponse.json({
      talent,
      total: talent.length,
      page: 1,
      limit,
    })
  } catch (error) {
    console.error('GET /api/talent unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch talent' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req)

    if (!sessionUser || sessionUser.user_type !== 'talent') {
      return NextResponse.json({ error: 'Only developer accounts can update talent profiles' }, { status: 403 })
    }

    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const payload = {
      headline: body.headline || null,
      bio: body.bio || null,
      location_city: body.location_city || null,
      location_country: body.location_country || null,
      timezone: body.timezone || null,
      hourly_rate_usd: body.hourly_rate_usd || null,
      php_years: body.php_years || null,
      php_versions: Array.isArray(body.php_versions) ? body.php_versions : [],
      availability: body.availability || 'available',
      hire_types: Array.isArray(body.hire_types) ? body.hire_types : ['freelance'],
      remote_ok: body.remote_ok !== false,
      portfolio_url: body.portfolio_url || null,
      github_url: body.github_url || null,
      linkedin_url: body.linkedin_url || null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      languages: Array.isArray(body.languages) ? body.languages : ['English'],
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', sessionUser.userId)
      .single()

    const query = existingProfile
      ? supabase
          .from('talent_profiles')
          .update(payload)
          .eq('user_id', sessionUser.userId)
      : supabase
          .from('talent_profiles')
          .insert({
            user_id: sessionUser.userId,
            avg_rating: 0,
            total_reviews: 0,
            total_jobs: 0,
            profile_views: 0,
            is_verified: false,
            is_featured: false,
            created_at: new Date().toISOString(),
            ...payload,
          })

    const { data, error } = await query.select('*').single()

    if (error) {
      console.error('POST /api/talent save error:', error)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: data }, { status: existingProfile ? 200 : 201 })
  } catch (error) {
    console.error('POST /api/talent unexpected error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
