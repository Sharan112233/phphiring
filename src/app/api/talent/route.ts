// src/app/api/talent/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ talent: [], total: 0, page: 1, limit: 100 })
    }

    // Fetch talent profiles
    const profileUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)
    profileUrl.searchParams.set('select', '*')
    profileUrl.searchParams.set('order', 'created_at.desc')
    profileUrl.searchParams.set('limit', '100')

    const profileResponse = await fetch(profileUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ talent: [], total: 0, page: 1, limit: 100 })
    }

    const profiles = await profileResponse.json()

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json({ talent: [], total: 0, page: 1, limit: 100 })
    }

    // Get user IDs
    const userIds = profiles.map((p: any) => p.user_id).filter(Boolean)

    if (userIds.length === 0) {
      return NextResponse.json({ talent: [], total: 0, page: 1, limit: 100 })
    }

    // Fetch users
    const userUrl = new URL(`${baseUrl}/rest/v1/users`)
    userUrl.searchParams.set('select', 'id,full_name,email')
    userUrl.searchParams.set('id', `in.(${userIds.join(',')})`)

    const userResponse = await fetch(userUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    let users: any[] = []
    if (userResponse.ok) {
      users = await userResponse.json()
    }

    const userMap = new Map(Array.isArray(users) ? users.map((u: any) => [u.id, u]) : [])

    // Transform to talent objects
    const avatarColors = [
      { bg: '#EDE9FE', text: '#5B21B6' },
      { bg: '#DBEAFE', text: '#1E40AF' },
      { bg: '#D1FAE5', text: '#065F46' },
      { bg: '#FEF3C7', text: '#92400E' },
      { bg: '#FCE7F3', text: '#9D174D' },
      { bg: '#ECFDF5', text: '#064E3B' },
      { bg: '#FFF7ED', text: '#92400E' },
    ]

    const talent = profiles.map((profile: any) => {
      const user = userMap.get(profile.user_id)
      const fullName = user?.full_name || 'Unknown'
      const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

      const colorIndex = (profile.user_id?.charCodeAt(0) || 0) % avatarColors.length
      const colors = avatarColors[colorIndex]

      return {
        id: profile.user_id,
        full_name: fullName,
        email: user?.email || '',
        initials: initials || '?',
        avatarBg: colors.bg,
        avatarTc: colors.text,
        headline: profile.headline || 'PHP Developer',
        location_city: profile.location_city || 'Remote',
        location_country: profile.location_country || '',
        hourly_rate_usd: profile.hourly_rate_usd || 0,
        php_years: profile.php_years || 0,
        avg_rating: profile.avg_rating || 0,
        total_reviews: profile.total_reviews || 0,
        total_jobs: profile.total_jobs || 0,
        availability: profile.availability || 'available',
        hire_types: profile.hire_types || ['freelance'],
        is_verified: profile.is_verified || false,
        is_featured: profile.is_featured || false,
        languages: Array.isArray(profile.languages) ? profile.languages : ['English'],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        php_versions: Array.isArray(profile.php_versions) ? profile.php_versions : ['PHP 8.3'],
        type: profile.type || 'individual',
        monthly_rate: profile.monthly_rate || 0,
      }
    })

    return NextResponse.json({
      talent,
      total: talent.length,
      page: 1,
      limit: 100,
    })
  } catch (error: any) {
    console.error('GET /api/talent error:', error?.message)
    // Return empty array on error instead of 500
    return NextResponse.json({ talent: [], total: 0, page: 1, limit: 100 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: 'Missing config' }, { status: 500 })
    }

    const body = await req.json()

    // Check if exists
    const checkUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)
    checkUrl.searchParams.set('user_id', `eq.${userId}`)
    checkUrl.searchParams.set('select', 'id')

    const checkResponse = await fetch(checkUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const existing = await checkResponse.json()
    const exists = Array.isArray(existing) && existing.length > 0

    let result: any

    if (exists) {
      // Update
      const updateUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)
      updateUrl.searchParams.set('user_id', `eq.${userId}`)

      const updateResponse = await fetch(updateUrl.toString(), {
        method: 'PATCH',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          ...body,
          updated_at: new Date().toISOString(),
        }),
        cache: 'no-store',
      })

      if (updateResponse.ok) {
        const updated = await updateResponse.json()
        result = Array.isArray(updated) ? updated[0] : null
      }
    } else {
      // Create
      const createUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)

      const createResponse = await fetch(createUrl.toString(), {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: userId,
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        cache: 'no-store',
      })

      if (createResponse.ok) {
        const created = await createResponse.json()
        result = Array.isArray(created) ? created[0] : null
      }
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/talent error:', error?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}