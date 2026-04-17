'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageLoader from '@/components/ui/PageLoader'
import styles from './dashboard.module.css'

type User = {
  id: string
  full_name: string
  user_type: 'talent' | 'recruiter'
  plan: string
  email: string
  jobs_applied_count?: number
  jobs_posted_count?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [postedJobs, setPostedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      const stored = localStorage.getItem('phphire_user')
      if (!stored) {
        router.push('/auth/login')
        return
      }

      try {
        const localUser = JSON.parse(stored)
        const [meRes, applicationsRes, notificationsRes, jobsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/applications?limit=8'),
          fetch('/api/notifications?limit=8'),
          fetch(`/api/jobs?poster_id=${encodeURIComponent(localUser.id)}&limit=8`),
        ])

        const meData = meRes.ok ? await meRes.json() : { user: localUser }
        const applicationsData = applicationsRes.ok ? await applicationsRes.json() : { applications: [] }
        const notificationsData = notificationsRes.ok ? await notificationsRes.json() : { notifications: [] }
        const jobsData = jobsRes.ok ? await jobsRes.json() : { jobs: [] }

        setUser(meData.user || localUser)
        localStorage.setItem('phphire_user', JSON.stringify(meData.user || localUser))
        setApplications(applicationsData.applications || [])
        setNotifications(notificationsData.notifications || [])
        setPostedJobs(jobsData.jobs || [])
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const derived = useMemo(() => {
    const isTalent = user?.user_type === 'talent'
    const shortlisted = applications.filter((app) => app.status === 'shortlisted').length
    const selected = applications.filter((app) => app.status === 'selected').length
    const pending = applications.filter((app) => app.status === 'pending').length
    const totalApplicants = applications.length
    const unreadNotifications = notifications.filter((item) => !item.is_read).length

    if (isTalent) {
      return [
        { label: 'Applications', value: String(totalApplicants), icon: '📋', trend: `${pending} pending` },
        { label: 'Shortlisted', value: String(shortlisted), icon: '⭐', trend: selected ? `${selected} selected` : '' },
        { label: 'Unread alerts', value: String(unreadNotifications), icon: '🔔', trend: '' },
        {
          label: 'Jobs applied',
          value: `${user?.jobs_applied_count || 0} / ${user?.plan === 'pro' ? '∞' : '10'}`,
          icon: '💼',
          trend: '',
        },
      ]
    }

    const selectedCandidates = applications.filter((app) => app.status === 'selected').length
    const activeJobs = postedJobs.length
    return [
      { label: 'Live jobs', value: String(activeJobs), icon: '📝', trend: '' },
      { label: 'Applicants', value: String(totalApplicants), icon: '👥', trend: `${shortlisted} shortlisted` },
      { label: 'Selected', value: String(selectedCandidates), icon: '⭐', trend: '' },
      {
        label: 'Jobs posted',
        value: `${user?.jobs_posted_count || 0} / ${user?.plan === 'pro' ? '∞' : '3'}`,
        icon: '📊',
        trend: '',
      },
    ]
  }, [applications, notifications, postedJobs, user])

  if (loading) {
    return (
      <>
        <Navbar />
        <PageLoader label="Loading dashboard..." minHeight="70vh" />
        <Footer />
      </>
    )
  }
  if (!user) return null

  const isTalent = user.user_type === 'talent'
  const recentItems = isTalent ? applications.slice(0, 4) : applications.slice(0, 4)

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div>
              <h1>Welcome back, {user.full_name.split(' ')[0]}!</h1>
              <p>{isTalent ? 'Track your PHP job hunt in real time.' : 'Manage your PHP hiring pipeline in one place.'}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {user.plan !== 'pro' ? (
                <div className={styles.upgradeBanner}>
                  <span>Free plan · </span>
                  <Link href="/dashboard/payments" className={styles.upgradeLink}>Upgrade to Pro →</Link>
                </div>
              ) : (
                <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: 12 }}>Pro Plan</span>
              )}
            </div>
          </div>

          <div className={styles.statsGrid}>
            {derived.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statVal}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                {stat.trend && <div className={styles.statTrend}>{stat.trend}</div>}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Quick Actions</h3>
              <div className={styles.actionList}>
                {isTalent ? (
                  <>
                    <Link href="/jobs" className={styles.actionItem}><span>💼</span> Browse PHP Jobs</Link>
                    <Link href="/dashboard/profile" className={styles.actionItem}><span>👤</span> Edit Developer Profile</Link>
                    <Link href="/dashboard/applications" className={styles.actionItem}><span>📋</span> My Applications</Link>
                    <Link href="/notifications" className={styles.actionItem}><span>🔔</span> Notifications</Link>
                    <Link href="/dashboard/payments" className={styles.actionItem}><span>💳</span> Billing & Plans</Link>
                  </>
                ) : (
                  <>
                    <Link href="/post-job" className={styles.actionItem}><span>📝</span> Post a New Job</Link>
                    <Link href="/browse" className={styles.actionItem}><span>🔍</span> Browse Developers</Link>
                    <Link href="/dashboard/applications" className={styles.actionItem}><span>📥</span> Review Applications</Link>
                    <Link href="/notifications" className={styles.actionItem}><span>🔔</span> Notifications</Link>
                    <Link href="/dashboard/payments" className={styles.actionItem}><span>💳</span> Billing & Plans</Link>
                  </>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>Recent Activity</h3>
                <Link href={isTalent ? '/dashboard/applications' : '/dashboard/applications'} style={{ fontSize: 13, color: 'var(--purple-light)' }}>
                  View all →
                </Link>
              </div>
              <div className={styles.activityList}>
                {recentItems.length === 0 ? (
                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>{isTalent ? '📭' : '📬'}</span>
                    <div className={styles.activityBody}>
                      <span className={styles.activityText}>
                        {isTalent ? 'You have not applied yet. Start exploring live PHP jobs.' : 'No applicants yet. Publish a clear PHP job to attract developers faster.'}
                      </span>
                      <span className={styles.activityTime}>Just now</span>
                    </div>
                  </div>
                ) : recentItems.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <span className={styles.activityIcon}>{isTalent ? '💼' : '📥'}</span>
                    <div className={styles.activityBody}>
                      <span className={styles.activityText}>
                        {isTalent
                          ? `Applied to "${item.job?.title || 'PHP Role'}" at ${item.job?.company_name || 'a company'}`
                          : `${item.applicant?.full_name || 'A developer'} applied to "${item.job?.title || 'your PHP role'}"`}
                      </span>
                      <span className={styles.activityTime}>
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
