import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function cleanUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  )
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params?.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, user_type, plan')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      if (userError) {
        console.error('GET /api/users user fetch error:', userError)
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: profiles, error: profileError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (profileError) {
      console.error('GET /api/users profile fetch error:', profileError)
    }

    return NextResponse.json({
      success: true,
      user,
      profile: Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null,
    })
  } catch (error) {
    console.error('GET /api/users error:', error)
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

    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userCheckError || !existingUser) {
      if (userCheckError) {
        console.error('PUT /api/users user check error:', userCheckError)
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userFields = cleanUndefined({
      full_name: body.full_name,
      email: typeof body.email === 'string' ? body.email.toLowerCase().trim() : body.email,
      plan: body.plan,
      updated_at: new Date().toISOString(),
    })

    const profileFields = cleanUndefined({
      headline: body.headline ?? null,
      bio: body.bio ?? null,
      skills: Array.isArray(body.skills) ? body.skills : body.skills ?? null,
      languages: Array.isArray(body.languages) ? body.languages : body.languages ?? null,
      certifications: Array.isArray(body.certifications) ? body.certifications : body.certifications ?? null,
      hourly_rate_usd: body.hourly_rate_usd ?? null,
      php_years: body.php_years ?? null,
      total_jobs: body.total_jobs ?? null,
      availability: body.availability ?? null,
      portfolio_url: body.portfolio_url ?? null,
      github_url: body.github_url ?? null,
      linkedin_url: body.linkedin_url ?? null,
      location_city: body.location_city ?? null,
      location_country: body.location_country ?? null,
      updated_at: new Date().toISOString(),
    })

    if (Object.keys(userFields).length > 1) {
      const { error: updateUserError } = await supabase
        .from('users')
        .update(userFields)
        .eq('id', userId)

      if (updateUserError) {
        console.error('PUT /api/users user update error:', updateUserError)
        return NextResponse.json(
          { error: updateUserError.message || 'Failed to update user' },
          { status: 500 }
        )
      }
    }

    const { data: existingProfiles, error: profileCheckError } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (profileCheckError) {
      console.error('PUT /api/users profile check error:', profileCheckError)
      return NextResponse.json(
        { error: profileCheckError.message || 'Failed to check profile' },
        { status: 500 }
      )
    }

    let profile = null

    if (Array.isArray(existingProfiles) && existingProfiles.length > 0) {
      const { data: updatedProfiles, error: updateProfileError } = await supabase
        .from('talent_profiles')
        .update(profileFields)
        .eq('user_id', userId)
        .select('*')

      if (updateProfileError) {
        console.error('PUT /api/users profile update error:', updateProfileError)
        return NextResponse.json(
          { error: updateProfileError.message || 'Failed to update profile' },
          { status: 500 }
        )
      }

      profile = Array.isArray(updatedProfiles) ? updatedProfiles[0] : null
    } else {
      const { data: createdProfiles, error: createProfileError } = await supabase
        .from('talent_profiles')
        .insert({
          user_id: userId,
          ...profileFields,
        })
        .select('*')

      if (createProfileError) {
        console.error('PUT /api/users profile create error:', createProfileError)
        return NextResponse.json(
          { error: createProfileError.message || 'Failed to create profile' },
          { status: 500 }
        )
      }

      profile = Array.isArray(createdProfiles) ? createdProfiles[0] : null
    }

    const { data: finalUser, error: finalUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (finalUserError) {
      console.error('PUT /api/users final user fetch error:', finalUserError)
    }

    return NextResponse.json({
      success: true,
      user: finalUser || null,
      profile,
    })
  } catch (error) {
    console.error('PUT /api/users error:', error)
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

    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const { data: profiles, error } = await supabase
      .from('talent_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')

    if (error) {
      console.error('PATCH /api/users profile update error:', error)
      return NextResponse.json(
        { error: error.message || 'Update failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: Array.isArray(profiles) ? profiles[0] : null,
    })
  } catch (error) {
    console.error('PATCH /api/users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
