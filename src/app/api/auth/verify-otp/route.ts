import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { signToken, setSessionCookie } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
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
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.is_email_verified) {
      return NextResponse.json(
        { error: 'Email already verified. Please sign in.' },
        { status: 400 }
      )
    }

    if (!user.otp_code || user.otp_code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check your email and try again.' },
        { status: 400 }
      )
    }

    if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark as verified and clear OTP
    await supabase
      .from('users')
      .update({
        is_email_verified: true,
        otp_code: null,
        otp_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.full_name, user.user_type).catch(
      (e) => console.error('Welcome email failed:', e)
    )

    // Create welcome notification (non-blocking)
    createNotification(
      user.id,
      'system',
      'Welcome to PHPhire! 🎉',
      user.user_type === 'talent'
        ? 'Your account is verified! Complete your profile to start getting found by businesses.'
        : 'Your account is verified! Post your first job to find PHP talent.',
      '/dashboard'
    ).catch((e) => console.error('Welcome notification failed:', e))

    // Create talent profile row if talent
    if (user.user_type === 'talent') {
      const { data: existingProfile } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('talent_profiles').insert({
          user_id: user.id,
          is_active: true,
          is_verified: false,
          is_featured: false,
          availability: 'available',
          remote_ok: true,
          avg_rating: 0,
          total_reviews: 0,
          total_jobs: 0,
          profile_views: 0,
          skills: [],
          languages: ['English'],
          php_versions: [],
          hire_types: ['freelance'],
        })
      }
    }

    const token = signToken({ userId: user.id, email: user.email, user_type: user.user_type })
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

    return NextResponse.json({
      user: publicUser,
      message: 'Email verified successfully! Welcome to PHPhire.',
    })

  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}