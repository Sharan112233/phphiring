'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

interface NavUser {
  id: string
  full_name: string
  email: string
  user_type: string
  plan: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

const NOTIF_ICONS: Record<string, string> = {
  job_match:            '💼',
  application_received: '📥',
  application_selected: '🎉',
  application_rejected: '📋',
  message:              '💬',
  payment_success:      '✅',
  profile_view:         '👁',
  review_received:      '⭐',
  system:               '🔔',
}

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()

  const [user,          setUser]          = useState<NavUser | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [scrolled,      setScrolled]      = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const syncUser = async () => {
      const stored = localStorage.getItem('phphire_user')
      if (stored) {
        try { setUser(JSON.parse(stored)) } catch {
          localStorage.removeItem('phphire_user')
        }
      }

      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          localStorage.removeItem('phphire_user')
          setUser(null)
          return
        }
        const data = await res.json()
        localStorage.setItem('phphire_user', JSON.stringify(data.user))
        setUser(data.user)
      } catch {}
    }

    syncUser()
  }, [pathname])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
    setNotifOpen(false)
  }, [pathname])

  async function fetchNotifications() {
    try {
      if (!user?.id) return

      const res = await fetch('/api/notifications?limit=8')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
  }

  async function handleNotifClick(notif: Notification) {
    setNotifOpen(false)
    if (!notif.is_read) {
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {})
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (notif.link) router.push(notif.link)
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem('phphire_user')
    setUser(null)
    setNotifications([])
    setUnreadCount(0)
    setMenuOpen(false)
    setNotifOpen(false)
    router.replace('/')
    router.refresh()
  }

  function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60)    return 'Just now'
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Role-based nav links
  const isTalent    = user?.user_type === 'talent'
  const isRecruiter = user?.user_type === 'recruiter'

  const NAV_LINKS = !user
    ? [
        // { href: '/browse',   label: 'Find Talent' },
        { href: '/agencies', label: 'Agencies' },
        { href: '/jobs',     label: 'PHP Jobs' },
        { href: '/post-job', label: 'Post a Job' },
        { href: '/resources', label: 'PHP Resources' },
      ]
    : isTalent
    ? [
        { href: '/jobs',                   label: 'Browse Jobs' },
        { href: '/dashboard/applications', label: 'My Applications' },
        { href: '/notifications',          label: 'Notifications' },
      ]
    : [
        { href: '/post-job',               label: 'Post a Job' },
        { href: '/browse',                 label: 'Browse Talent' },
        { href: '/agencies',               label: 'Agencies' },
        { href: '/dashboard/applications', label: 'Applications' },
      ]

  // Role-based dropdown items
  const DROPDOWN_ITEMS = isTalent
    ? [
        { href: '/dashboard',              icon: '📊', label: 'Dashboard' },
        { href: '/dashboard/profile',      icon: '👤', label: 'My Profile' },
        { href: '/jobs',                   icon: '💼', label: 'Browse Jobs' },
        { href: '/dashboard/applications', icon: '📋', label: 'My Applications' },
        { href: '/notifications',          icon: '🔔', label: 'Notifications' },
        { href: '/dashboard/payments',     icon: '💳', label: 'Billing and Plans' },
      ]
    : [
        { href: '/dashboard',              icon: '📊', label: 'Dashboard' },
        { href: '/post-job',               icon: '📝', label: 'Post a Job' },
        { href: '/browse',                 icon: '🔍', label: 'Browse Talent' },
        { href: '/dashboard/applications', icon: '📥', label: 'Applications' },
        { href: '/notifications',          icon: '🔔', label: 'Notifications' },
        { href: '/dashboard/payments',     icon: '💳', label: 'Billing and Plans' },
      ]

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          PHP<span>hire</span>
          <sup className={styles.beta}>β</sup>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.links}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${pathname?.startsWith(l.href) ? styles.navLinkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className={styles.right}>
          {user ? (
            <>
              {/* Notification bell */}
              <div className={styles.notifWrap} ref={notifRef}>
                <button
                  className={styles.notifBtn}
                  onClick={() => {
                    setNotifOpen(prev => !prev)
                    setMenuOpen(false)
                    if (!notifOpen) fetchNotifications()
                  }}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className={styles.notifBadge}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                      <span className={styles.notifHeaderTitle}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          className={styles.markReadBtn}
                          onClick={markAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className={styles.notifList}>
                      {notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>
                          <span>🔔</span>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            className={`${styles.notifItem} ${!n.is_read ? styles.notifItemUnread : ''}`}
                            onClick={() => handleNotifClick(n)}
                          >
                            <span className={styles.notifIcon}>
                              {NOTIF_ICONS[n.type] || '🔔'}
                            </span>
                            <div className={styles.notifContent}>
                              <div className={styles.notifTitle}>{n.title}</div>
                              <div className={styles.notifMsg}>{n.message}</div>
                              <div className={styles.notifTime}>
                                {timeAgo(n.created_at)}
                              </div>
                            </div>
                            {!n.is_read && <div className={styles.unreadDot} />}
                          </button>
                        ))
                      )}
                    </div>

                    <Link
                      href="/notifications"
                      className={styles.notifFooter}
                      onClick={() => setNotifOpen(false)}
                    >
                      View all notifications →
                    </Link>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className={styles.userMenu} ref={menuRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => {
                    setMenuOpen(prev => !prev)
                    setNotifOpen(false)
                  }}
                >
                  <div className={styles.userAvatar}>{initials}</div>
                  <span className={styles.userName}>
                    {user.full_name.split(' ')[0]}
                  </span>
                  <span className={styles.chevron}>▾</span>
                </button>

                {menuOpen && (
                  <div className={styles.dropdown}>
                    {/* User info */}
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{user.full_name}</div>
                      <div className={styles.dropdownEmail}>{user.email}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: isTalent ? '#EDE9FE' : '#D1FAE5',
                          color: isTalent ? '#5B21B6' : '#065F46',
                        }}>
                          {isTalent ? '👨‍💻 Developer' : '🏢 Recruiter'}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: user.plan === 'pro' ? '#FEF3C7' : '#F4F3F7',
                          color: user.plan === 'pro' ? '#D97706' : '#7B7494',
                        }}>
                          {user.plan === 'pro' ? '⭐ Pro' : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.dropdownDivider} />

                    {DROPDOWN_ITEMS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={styles.dropItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                        {item.label === 'Notifications' && unreadCount > 0 && (
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 20,
                            background: '#FEE2E2',
                            color: '#DC2626',
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}

                    <div className={styles.dropdownDivider} />

                    <button
                      className={`${styles.dropItem} ${styles.dropItemLogout}`}
                      onClick={handleLogout}
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn hide-mobile">
                Sign In
              </Link>
              <Link href="/auth/login" className="btn btn-primary">
                Join Free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.mobileLink} ${pathname?.startsWith(l.href) ? styles.mobileLinkActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                My Profile
              </Link>
              <Link
                href="/notifications"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Link>
              <button
                className={`${styles.mobileLink} ${styles.mobileLinkLogout}`}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/login"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Join Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
