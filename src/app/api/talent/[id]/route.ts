// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase config')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Fetch user
    const userRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${id}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!userRes.ok) {
      console.error('User fetch failed:', userRes.status)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 404 }
      )
    }

    const users = await userRes.json()
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Fetch profile
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${id}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let profile = null
    if (profileRes.ok) {
      const profiles = await profileRes.json()
      if (profiles && profiles.length > 0) {
        profile = profiles[0]
      }
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
  } catch (err: any) {
    console.error('GET /api/users error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify user exists
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${id}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const users = await checkRes.json()
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Separate user and profile fields
    const userFields = {
      full_name: body.full_name,
      email: body.email,
      plan: body.plan,
      updated_at: new Date().toISOString(),
    }

    const profileFields = {
      headline: body.headline,
      bio: body.bio,
      skills: body.skills,
      languages: body.languages,
      certifications: body.certifications,
      hourly_rate_usd: body.hourly_rate_usd,
      availability: body.availability,
      portfolio_url: body.portfolio_url,
      github_url: body.github_url,
      linkedin_url: body.linkedin_url,
      location_city: body.location_city,
      location_country: body.location_country,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined fields
    Object.keys(userFields).forEach(
      (key) => userFields[key as keyof typeof userFields] === undefined && delete userFields[key as keyof typeof userFields]
    )
    Object.keys(profileFields).forEach(
      (key) => profileFields[key as keyof typeof profileFields] === undefined && delete profileFields[key as keyof typeof profileFields]
    )

    // Update user if needed
    if (Object.keys(userFields).length > 1) { // more than just updated_at
      await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(userFields),
        }
      )
    }

    // Check if profile exists
    const profileCheckRes = await fetch(
      `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${id}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const existingProfiles = await profileCheckRes.json()
    let profile = null

    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(profileFields),
        }
      )

      if (updateRes.ok) {
        const profiles = await updateRes.json()
        profile = profiles[0]
      }
    } else {
      // Create new profile
      const createRes = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            user_id: id,
            ...profileFields,
          }),
        }
      )

      if (createRes.ok) {
        const profiles = await createRes.json()
        profile = profiles[0]
      }
    }

    // Fetch updated user
    const finalUserRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${id}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const finalUsers = await finalUserRes.json()
    const finalUser = finalUsers[0]

    return NextResponse.json({
      success: true,
      user: finalUser,
      profile: profile,
    })
  } catch (err: any) {
    console.error('PUT /api/users error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Update profile
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          ...body,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (updateRes.ok) {
      const profiles = await updateRes.json()
      return NextResponse.json({
        success: true,
        profile: profiles[0],
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
  } catch (err: any) {
    console.error('PATCH /api/users error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}