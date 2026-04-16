import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, user_type } = await req.json()

    // Validation
    if (!full_name || !email || !password || !user_type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (!['talent', 'recruiter'].includes(user_type)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    const emailClean = email.toLowerCase().trim()
    const supabase = getSupabaseAdmin()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, is_email_verified')
      .eq('email', emailClean)
      .single()

    if (existing) {
      if (!existing.is_email_verified) {
        // Resend OTP if not verified yet
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await supabase
          .from('users')
          .update({ otp_code: otp, otp_expires_at: otpExpiry.toISOString() })
          .eq('id', existing.id)
        await sendOTPEmail(emailClean, full_name, otp)
        return NextResponse.json(
          {
            message: 'Account exists but not verified. New OTP sent.',
            email: emailClean,
            resent: true,
          },
          { status: 200 }
        )
      }
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name: full_name.trim(),
        email: emailClean,
        password_hash: passwordHash,
        user_type,
        is_email_verified: false,
        otp_code: otp,
        otp_expires_at: otpExpiry.toISOString(),
        plan: 'free',
        jobs_applied_count: 0,
        jobs_posted_count: 0,
      })
      .select('id, email, full_name')
      .single()

    if (error || !newUser) {
      console.error('Register insert error:', error)
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // Send OTP email
    await sendOTPEmail(emailClean, full_name.trim(), otp)

    return NextResponse.json(
      {
        message: 'Account created! OTP sent to your email.',
        email: emailClean,
      },
      { status: 201 }
    )

  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}