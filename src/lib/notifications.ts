import { getSupabaseAdmin } from './supabase'
import type { NotificationType } from '@/types'

// ─── CREATE SINGLE NOTIFICATION ──────────────────────────────────────────────

export async function createNotification(
  userId:  string,
  type:    NotificationType,
  title:   string,
  message: string,
  link?:   string,
  meta?:   Record<string, unknown>
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('notifications').insert({
      user_id:    userId,
      type,
      title,
      message,
      link:       link || null,
      meta:       meta || null,
      is_read:    false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('createNotification error:', error)
    }
  } catch (err) {
    console.error('createNotification threw:', err)
  }
}

// ─── CREATE BULK NOTIFICATIONS ───────────────────────────────────────────────

export async function createBulkNotifications(
  userIds: string[],
  type:    NotificationType,
  title:   string,
  message: string,
  link?:   string,
  meta?:   Record<string, unknown>
): Promise<void> {
  if (!userIds.length) return

  try {
    const supabase = getSupabaseAdmin()

    const rows = userIds.map(userId => ({
      user_id:    userId,
      type,
      title,
      message,
      link:       link || null,
      meta:       meta || null,
      is_read:    false,
      created_at: new Date().toISOString(),
    }))

    // Insert in batches of 50 to avoid payload limits
    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await supabase
        .from('notifications')
        .insert(rows.slice(i, i + 50))

      if (error) {
        console.error(`createBulkNotifications batch ${i} error:`, error)
      }
    }
  } catch (err) {
    console.error('createBulkNotifications threw:', err)
  }
}

// ─── MARK NOTIFICATIONS AS READ ──────────────────────────────────────────────

export async function markNotificationsRead(
  userId: string,
  ids?:   string[]
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)

    if (ids && ids.length > 0) {
      query = query.in('id', ids)
    } else {
      query = query.eq('is_read', false)
    }

    const { error } = await query
    if (error) console.error('markNotificationsRead error:', error)
  } catch (err) {
    console.error('markNotificationsRead threw:', err)
  }
}

// ─── GET UNREAD COUNT ─────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) return 0
    return count || 0
  } catch {
    return 0
  }
}