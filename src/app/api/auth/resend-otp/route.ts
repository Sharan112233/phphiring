import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, is_email_verified')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      // Don't reveal if user exists or not
      return NextResponse.json(
        { message: 'If this email exists, a new OTP has been sent.' }
      )
    }

    if (user.is_email_verified) {
      return NextResponse.json(
        { error: 'This email is already verified. Please sign in.' },
        { status: 400 }
      )
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await supabase
      .from('users')
      .update({
        otp_code: otp,
        otp_expires_at: otpExpiry.toISOString(),
      })
      .eq('id', user.id)

    await sendOTPEmail(user.email, user.full_name, otp)

    return NextResponse.json({
      message: 'New OTP sent to your email. Valid for 10 minutes.',
    })

  } catch (err) {
    console.error('Resend OTP error:', err)
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    )
  }
}