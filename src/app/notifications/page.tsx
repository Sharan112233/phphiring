'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('phphire_user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    fetchNotifications()

    // Refresh every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [router])

  const fetchNotifications = async () => {
    try {
      const userStr = localStorage.getItem('phphire_user')
      if (!userStr) return

      const userData = JSON.parse(userStr)
      const res = await fetch(`/api/notifications?user_id=${userData.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/mark-read`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const getIcon = (type: string) => {
    if (type === 'job_posted') return '💼'
    if (type === 'application_received') return '📥'
    return '🔔'
  }

  const getColor = (type: string) => {
    if (type === 'job_posted') return '#EDE9FE'
    if (type === 'application_received') return '#DBEAFE'
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
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 4px 0' }}>
              Notifications
            </h1>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              {notifications.length === 0 ? 'No notifications yet' : `You have ${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                display: 'inline-block',
                width: 40,
                height: 40,
                border: '3px solid #E8E4F0',
                borderTopColor: '#7C3AED',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    background: notif.is_read ? '#fff' : '#F8F7FF',
                    border: `1px solid ${notif.is_read ? '#E8E4F0' : '#D8CCFF'}`,
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    gap: 16,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    minWidth: 48,
                    background: getColor(notif.type),
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: notif.is_read ? 400 : 600,
                      color: '#0F0A1E',
                      margin: '0 0 4px 0',
                    }}>
                      {notif.title}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: '#666',
                      margin: '0 0 4px 0',
                    }}>
                      {notif.message}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: '#999',
                      margin: 0,
                    }}>
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#F3F4F6',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#666',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E8E4F0',
            }}>
              <p style={{ fontSize: 48, margin: '0 0 12px 0' }}>🔔</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>
                No notifications
              </h3>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                Notifications will appear here when new jobs are posted or when candidates apply
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}