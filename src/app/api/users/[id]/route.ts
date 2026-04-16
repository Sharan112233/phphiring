import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params?.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: 'Missing config' }, { status: 500 })
    }

    // Fetch user
    const userUrl = new URL(`${baseUrl}/rest/v1/users`)
    userUrl.searchParams.set('id', `eq.${userId}`)
    userUrl.searchParams.set('select', '*')

    const userResponse = await fetch(userUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const users = await userResponse.json()
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    // Fetch profile
    const profileUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)
    profileUrl.searchParams.set('user_id', `eq.${userId}`)
    profileUrl.searchParams.set('select', '*')

    let profile = null
    try {
      const profileResponse = await fetch(profileUrl.toString(), {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (profileResponse.ok) {
        const profiles = await profileResponse.json()
        if (Array.isArray(profiles) && profiles.length > 0) {
          profile = profiles[0]
        }
      }
    } catch (e) {
      console.log('Profile fetch error (non-critical):', e)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        plan: user.plan,
      },
      profile: profile,
    })
  } catch (error: any) {
    console.error('GET /api/users error:', error?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params?.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: 'Missing config' }, { status: 500 })
    }

    const body = await req.json()

    // Check user exists
    const checkUrl = new URL(`${baseUrl}/rest/v1/users`)
    checkUrl.searchParams.set('id', `eq.${userId}`)
    checkUrl.searchParams.set('select', 'id')

    const checkResponse = await fetch(checkUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const users = await checkResponse.json()
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update talent_profiles
    const profileData = {
      headline: body.headline || null,
      bio: body.bio || null,
      skills: body.skills || null,
      languages: body.languages || null,
      certifications: body.certifications || null,
      hourly_rate_usd: body.hourly_rate_usd || null,
      availability: body.availability || null,
      portfolio_url: body.portfolio_url || null,
      github_url: body.github_url || null,
      linkedin_url: body.linkedin_url || null,
      location_city: body.location_city || null,
      location_country: body.location_country || null,
      updated_at: new Date().toISOString(),
    }

    // Check if profile exists
    const profileCheckUrl = new URL(`${baseUrl}/rest/v1/talent_profiles`)
    profileCheckUrl.searchParams.set('user_id', `eq.${userId}`)
    profileCheckUrl.searchParams.set('select', 'id')

    const profileCheckResponse = await fetch(profileCheckUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const existingProfiles = await profileCheckResponse.json()

    let profile = null

    if (Array.isArray(existingProfiles) && existingProfiles.length > 0) {
      // Update existing
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
        body: JSON.stringify(profileData),
        cache: 'no-store',
      })

      if (updateResponse.ok) {
        const profiles = await updateResponse.json()
        if (Array.isArray(profiles) && profiles.length > 0) {
          profile = profiles[0]
        }
      }
    } else {
      // Create new
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
          ...profileData,
        }),
        cache: 'no-store',
      })

      if (createResponse.ok) {
        const profiles = await createResponse.json()
        if (Array.isArray(profiles) && profiles.length > 0) {
          profile = profiles[0]
        }
      }
    }

    // Get updated user
    const finalUserUrl = new URL(`${baseUrl}/rest/v1/users`)
    finalUserUrl.searchParams.set('id', `eq.${userId}`)
    finalUserUrl.searchParams.set('select', '*')

    const finalUserResponse = await fetch(finalUserUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const finalUsers = await finalUserResponse.json()
    const finalUser = Array.isArray(finalUsers) ? finalUsers[0] : null

    return NextResponse.json({
      success: true,
      user: finalUser,
      profile: profile,
    })
  } catch (error: any) {
    console.error('PUT /api/users error:', error?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params?.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: 'Missing config' }, { status: 500 })
    }

    const body = await req.json()

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
      const profiles = await updateResponse.json()
      return NextResponse.json({
        success: true,
        profile: Array.isArray(profiles) ? profiles[0] : null,
      })
    }

    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  } catch (error: any) {
    console.error('PATCH /api/users error:', error?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
