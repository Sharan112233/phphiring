'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageLoader from '@/components/ui/PageLoader'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('phphire_user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [router])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=100')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, is_read: true } : item))
    } catch (error) {
      console.error(error)
    }
  }

  const getIcon = (type: string) => {
    if (type === 'job_match') return '💼'
    if (type === 'application_received') return '📥'
    if (type === 'application_selected') return '🎉'
    if (type === 'application_rejected') return '📭'
    return '🔔'
  }

  const getColor = (type: string) => {
    if (type === 'job_match') return '#EDE9FE'
    if (type === 'application_received') return '#DBEAFE'
    if (type === 'application_selected') return '#D1FAE5'
    if (type === 'application_rejected') return '#FEE2E2'
    return '#F3F4F6'
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 4px 0' }}>Notifications</h1>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              {notifications.length === 0 ? 'No notifications yet' : `You have ${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <PageLoader label="Loading notifications..." minHeight="50vh" />
          ) : notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{ background: notif.is_read ? '#fff' : '#F8F7FF', border: `1px solid ${notif.is_read ? '#E8E4F0' : '#D8CCFF'}`, borderRadius: 12, padding: 16, display: 'flex', gap: 16, cursor: 'pointer' }}
                >
                  <div style={{ width: 48, height: 48, minWidth: 48, background: getColor(notif.type), borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: notif.is_read ? 400 : 600, color: '#0F0A1E', margin: '0 0 4px 0' }}>{notif.title}</p>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>{notif.message}</p>
                    <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{timeAgo(notif.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 12, border: '1px solid #E8E4F0' }}>
              <p style={{ fontSize: 48, margin: '0 0 12px 0' }}>🔔</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>No notifications</h3>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                Notifications appear here for welcome messages, new PHP jobs, applications, shortlists, and rejections.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
