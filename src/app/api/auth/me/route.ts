import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return fresh data from DB (not just cookie payload)
    const supabase = getSupabaseAdmin()
    const { data: freshUser, error } = await supabase
      .from('users')
      .select(
        'id, full_name, email, user_type, avatar_url, plan, jobs_applied_count, jobs_posted_count, is_email_verified, created_at'
      )
      .eq('id', user.userId)
      .single()

    if (error || !freshUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: freshUser })

  } catch (err) {
    console.error('Me error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}