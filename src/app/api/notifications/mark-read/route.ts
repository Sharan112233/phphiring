import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Body is optional — if no body or no id, mark ALL as read
    let body: { id?: string; ids?: string[] } = {}
    try {
      body = await req.json()
    } catch {
      // No body sent — that's fine, will mark all as read
    }

    if (body.id) {
      // Mark single notification as read
      // Verify it belongs to this user before updating
      const { data: notif } = await supabase
        .from('notifications')
        .select('id, user_id')
        .eq('id', body.id)
        .single()

      if (!notif || notif.user_id !== user.userId) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', body.id)
        .eq('user_id', user.userId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      })

    } else if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      // Mark multiple specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', body.ids)
        .eq('user_id', user.userId) // Security: only update own notifications

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `${body.ids.length} notifications marked as read`,
      })

    } else {
      // Mark ALL unread notifications as read for this user
      const { error, count } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.userId)
        .eq('is_read', false)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        updated_count: count || 0,
      })
    }

  } catch (err) {
    console.error('Mark read error:', err)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}