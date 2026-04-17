import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req)
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 100)

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, is_read, link, created_at')
      .eq('user_id', sessionUser.userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Notifications fetch error:', error)
      // Table may not exist yet — return empty gracefully
      return NextResponse.json({ success: true, notifications: [], unread_count: 0 })
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unread_count: (notifications || []).filter((n) => !n.is_read).length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req)
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (!body.user_id || !body.type || !body.title || !body.message) {
      return NextResponse.json({ error: 'Missing notification fields' }, { status: 400 })
    }

    await createNotification(body.user_id, body.type, body.title, body.message, body.link)
    return NextResponse.json({ message: 'Notification sent' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send notification' }, { status: 400 })
  }
}
