'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageLoader from '@/components/ui/PageLoader'

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [postedJobs, setPostedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [role, setRole] = useState<'talent' | 'recruiter'>('talent')
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    const loadApplications = async () => {
      const userStr = localStorage.getItem('phphire_user')
      if (!userStr) {
        router.push('/auth/login')
        return
      }

      const user = JSON.parse(userStr)
      try {
        const [appsRes, jobsRes] = await Promise.all([
          fetch('/api/applications?limit=100'),
          fetch(`/api/jobs?poster_id=${encodeURIComponent(user.id)}&limit=20`),
        ])
        const appsData = appsRes.ok ? await appsRes.json() : { applications: [], role: user.user_type }
        const jobsData = jobsRes.ok ? await jobsRes.json() : { jobs: [] }
        setApplications(appsData.applications || [])
        setRole(appsData.role || user.user_type || 'talent')
        setPostedJobs(jobsData.jobs || [])
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [router])

  const filtered = useMemo(() => {
    if (filter === 'all') return applications
    if (filter === 'not_selected') return applications.filter((app) => app.status === 'rejected')
    return applications.filter((app) => app.status === filter)
  }, [applications, filter])

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    selected: applications.filter((a) => a.status === 'selected').length,
    not_selected: applications.filter((a) => a.status === 'rejected').length,
  }

  const getStatusColor = (status: string) => {
    if (status === 'selected') return { bg: '#D1FAE5', color: '#059669', label: 'Selected' }
    if (status === 'shortlisted') return { bg: '#FEF3C7', color: '#D97706', label: 'Shortlisted' }
    if (status === 'pending') return { bg: '#F3F4F6', color: '#6B7280', label: 'Pending' }
    if (status === 'viewed') return { bg: '#DBEAFE', color: '#1D4ED8', label: 'Viewed' }
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' }
    return { bg: '#F3F4F6', color: '#6B7280', label: status }
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return `${Math.floor(diff / 604800)}w ago`
  }

  const updateStatus = async (applicationId: string, status: 'shortlisted' | 'rejected' | 'selected') => {
    setActingId(applicationId)
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update application')
      setApplications((prev) => prev.map((app) => app.id === applicationId ? { ...app, status } : app))
    } catch (error) {
      console.error(error)
    } finally {
      setActingId(null)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
                {role === 'talent' ? 'My Applications' : 'Hiring Pipeline'}
              </h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                {role === 'talent' ? 'Track every PHP job application you have sent.' : 'Review posted jobs and take action on incoming developer applications.'}
              </p>
            </div>
            <Link href={role === 'talent' ? '/jobs' : '/post-job'} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #E8E4F0', borderRadius: 8, textDecoration: 'none', color: '#666', fontWeight: 500, fontSize: 14 }}>
              {role === 'talent' ? 'Browse Jobs' : 'Post Another Job'}
            </Link>
          </div>

          {role === 'recruiter' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
              {postedJobs.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>No posted jobs yet</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#666' }}>Post a PHP role to start receiving developer applications.</p>
                </div>
              ) : postedJobs.map((job) => (
                <div key={job.id} style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0A1E', marginBottom: 6 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: '#7B7494', marginBottom: 10 }}>{job.company_name || 'Hiring company'} · {job.preferred_location || 'Remote'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}>{job.applications_count || 0} applicants</span>
                    <Link href={`/jobs/${job.id}`} style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>View job →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E8E4F0', marginBottom: 24, overflowX: 'auto' }}>
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
              { key: 'selected', label: 'Selected', count: counts.selected },
              { key: 'not_selected', label: 'Rejected', count: counts.not_selected },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: filter === tab.key ? '2px solid #7C3AED' : 'none', color: filter === tab.key ? '#7C3AED' : '#666', cursor: 'pointer', fontSize: 14, fontWeight: filter === tab.key ? 600 : 500, whiteSpace: 'nowrap' }}>
                {tab.label} {tab.count}
              </button>
            ))}
          </div>

          {loading ? (
            <PageLoader label="Loading applications..." minHeight="50vh" />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 12, border: '1px solid #E8E4F0' }}>
              <p style={{ fontSize: 48, margin: '0 0 12px 0' }}>📭</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>{role === 'talent' ? 'No applications yet' : 'No developer applications yet'}</h3>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>{role === 'talent' ? 'Start applying to live PHP jobs to populate this page.' : 'Once developers apply to your jobs, they will appear here.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map((app) => {
                const statusInfo = getStatusColor(app.status)
                const talentProfile = Array.isArray(app.applicant?.talent_profile) ? app.applicant.talent_profile[0] : app.applicant?.talent_profile
                return (
                  <div key={app.id} style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 12, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F0A1E' }}>{role === 'talent' ? app.job?.title || 'PHP Job' : app.applicant?.full_name || 'Developer'}</h3>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 4, background: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0' }}>
                          {role === 'talent'
                            ? `${app.job?.company_name || 'Company'} · ${app.job?.hire_type || 'Role'}`
                            : `${app.job?.title || 'PHP Role'} · ${talentProfile?.headline || 'PHP Developer'} · ${talentProfile?.php_years || 0} years exp`}
                        </p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {(role === 'talent' ? app.job?.required_skills : talentProfile?.skills || []).slice(0, 6).map((skill: string) => (
                            <span key={skill} style={{ fontSize: 11, background: '#EDE9FE', color: '#5B21B6', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>{skill}</span>
                          ))}
                        </div>
                        {app.cover_note && (
                          <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderLeft: '4px solid #7C3AED', padding: 12, borderRadius: 6, marginTop: 12 }}>
                            <p style={{ fontSize: 11, color: '#666', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 600 }}>Cover Note</p>
                            <p style={{ fontSize: 13, color: '#3D3558', margin: 0, lineHeight: 1.5 }}>{app.cover_note}</p>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', minWidth: 180 }}>
                        <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px 0' }}>{timeAgo(app.created_at)}</p>
                        {role === 'recruiter' && app.applicant?.id ? (
                          <>
                            <Link href={`/talent/${app.applicant.id}`} style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none', marginBottom: 10 }}>Review Profile →</Link>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button onClick={() => updateStatus(app.id, 'shortlisted')} disabled={actingId === app.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #FCD34D', background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                Shortlist
                              </button>
                              <button onClick={() => updateStatus(app.id, 'rejected')} disabled={actingId === app.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEE2E2', color: '#991B1B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                Reject
                              </button>
                            </div>
                          </>
                        ) : role === 'talent' && app.job?.id ? (
                          <Link href={`/jobs/${app.job.id}`} style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none', marginBottom: 8 }}>View Job →</Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
