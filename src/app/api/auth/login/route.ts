
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.is_email_verified) {
      return NextResponse.json(
        {
          error: 'Please verify your email first. Check your inbox for the OTP.',
          needs_verification: true,
          email: user.email,
        },
        { status: 403 }
      )
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      user_type: user.user_type,
    })

    await setSessionCookie(token)

    const publicUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      user_type: user.user_type,
      plan: user.plan,
      jobs_applied_count: user.jobs_applied_count,
      jobs_posted_count: user.jobs_posted_count,
    }

    return NextResponse.json({ user: publicUser })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
