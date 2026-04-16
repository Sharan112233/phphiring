'use client'
// src/app/dashboard/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id:string; full_name:string; user_type:string; plan:string; email:string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('phphire_user')
    if (!stored) { router.push('/auth/login'); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const isTalent = user.user_type === 'talent'

  const talentStats = [
    { label:'Profile views', value:'142', icon:'👁', trend:'+12%' },
    { label:'Applications', value:'8', icon:'📋', trend:'+3' },
    { label:'Shortlisted', value:'3', icon:'⭐', trend:'' },
    { label:'Jobs applied', value:`8 / ${user.plan === 'pro' ? '∞' : '10'}`, icon:'💼', trend:'' },
  ]
  const recruiterStats = [
    { label:'Jobs posted', value:'2', icon:'📋', trend:'' },
    { label:'Total applicants', value:'47', icon:'👥', trend:'+8 today' },
    { label:'Shortlisted', value:'6', icon:'⭐', trend:'' },
    { label:'Jobs remaining', value:`1 / ${user.plan === 'pro' ? '∞' : '3'}`, icon:'📊', trend:'' },
  ]
  const stats = isTalent ? talentStats : recruiterStats

  const recentActivity = isTalent ? [
    { icon:'💼', text:'Applied to "Senior Laravel Developer" at TechScale India', time:'2h ago', type:'success' },
    { icon:'👁', text:'Your profile was viewed by a recruiter from Singapore', time:'5h ago', type:'info' },
    { icon:'🎉', text:'Selected for "Vtiger CRM Developer" — check your email!', time:'1d ago', type:'success' },
    { icon:'📋', text:'Applied to "PHP API Developer (Symfony)"', time:'2d ago', type:'neutral' },
  ] : [
    { icon:'📥', text:'Arjun Reddy applied to "Senior Laravel Developer"', time:'1h ago', type:'info' },
    { icon:'📥', text:'Sofia Martinez applied to "Senior Laravel Developer"', time:'3h ago', type:'info' },
    { icon:'⭐', text:'Your job post reached 200+ PHP talent', time:'6h ago', type:'success' },
    { icon:'📋', text:'Job "PHP API Developer" posted successfully', time:'1d ago', type:'neutral' },
  ]

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1>Welcome back, {user.full_name.split(' ')[0]}! 👋</h1>
              <p>{isTalent ? 'Your PHP career dashboard' : 'Manage your PHP talent search'}</p>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {user.plan !== 'pro' && (
                <div className={styles.upgradeBanner}>
                  <span>Free plan · </span>
                  <Link href="#" className={styles.upgradeLink}>Upgrade to Pro ₹99 →</Link>
                </div>
              )}
              {user.plan === 'pro' && (
                <span className="badge badge-purple" style={{padding:'6px 12px',fontSize:12}}>⭐ Pro Plan</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div className={styles.statVal}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
                {s.trend && <div className={styles.statTrend}>{s.trend}</div>}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {/* Quick actions */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Quick Actions</h3>
              <div className={styles.actionList}>
                {isTalent ? (
                  <>
                    <Link href="/jobs" className={styles.actionItem}><span>💼</span> Browse PHP Jobs</Link>
                    <Link href="/dashboard/profile" className={styles.actionItem}><span>👤</span> Edit My Profile</Link>
                    <Link href="/dashboard/applications" className={styles.actionItem}><span>📋</span> My Applications</Link>
                    <Link href="/notifications" className={styles.actionItem}><span>🔔</span> Notifications</Link>
                    <Link href="/dashboard/payments" className={styles.actionItem}><span>💳</span> Billing & Plans</Link>
                  </>
                ) : (
                  <>
                    <Link href="/post-job" className={styles.actionItem}><span>📝</span> Post a New Job</Link>
                    <Link href="/browse" className={styles.actionItem}><span>🔍</span> Browse Talent</Link>
                    <Link href="/dashboard/applications" className={styles.actionItem}><span>📥</span> View Applications</Link>
                    <Link href="/agencies" className={styles.actionItem}><span>🏢</span> Browse Agencies</Link>
                    <Link href="/notifications" className={styles.actionItem}><span>🔔</span> Notifications</Link>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 className={styles.cardTitle} style={{margin:0}}>Recent Activity</h3>
                <Link href="/notifications" style={{fontSize:13,color:'var(--purple-light)'}}>View all →</Link>
              </div>
              <div className={styles.activityList}>
                {recentActivity.map((a, i) => (
                  <div key={i} className={styles.activityItem}>
                    <span className={styles.activityIcon}>{a.icon}</span>
                    <div className={styles.activityBody}>
                      <span className={styles.activityText}>{a.text}</span>
                      <span className={styles.activityTime}>{a.time}</span>
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
