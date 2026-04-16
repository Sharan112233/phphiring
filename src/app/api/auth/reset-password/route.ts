import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, new_password, otp, action } = body

    const supabase = getSupabaseAdmin()

    // ── SEND OTP ─────────────────────────────────────────────────────────────
    if (action === 'send-otp') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (!user) {
        // Do not reveal if email exists
        return NextResponse.json({
          message: 'If this email exists a reset code has been sent.',
        })
      }

      const resetOtp  = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await supabase
        .from('users')
        .update({
          otp_code:       resetOtp,
          otp_expires_at: otpExpiry.toISOString(),
        })
        .eq('id', user.id)

      await sendOTPEmail(user.email, user.full_name, resetOtp)

      return NextResponse.json({
        message: 'Reset code sent to your email.',
      })
    }

    // ── VERIFY OTP ────────────────────────────────────────────────────────────
    if (action === 'verify-otp') {
      if (!email || !otp) {
        return NextResponse.json(
          { error: 'Email and OTP are required' },
          { status: 400 }
        )
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, otp_code, otp_expires_at')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (!user.otp_code || user.otp_code !== otp) {
        return NextResponse.json(
          { error: 'Invalid code. Please check your email and try again.' },
          { status: 400 }
        )
      }

      if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Reset code has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      // Clear OTP after successful verify
      await supabase
        .from('users')
        .update({
          otp_code:       null,
          otp_expires_at: null,
        })
        .eq('id', user.id)

      return NextResponse.json({
        message: 'Code verified. You can now set a new password.',
        verified: true,
      })
    }

    // ── UPDATE PASSWORD ───────────────────────────────────────────────────────
    if (action === 'update-password') {
      if (!email || !new_password) {
        return NextResponse.json(
          { error: 'Email and new password are required' },
          { status: 400 }
        )
      }

      if (new_password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const passwordHash = await hashPassword(new_password)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at:    new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update password. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Password updated successfully.',
      })
    }

    // Unknown action
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (err) {
    console.error('Reset password route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}