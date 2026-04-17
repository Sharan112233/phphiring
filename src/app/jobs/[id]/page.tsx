'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageLoader from '@/components/ui/PageLoader'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [viewer, setViewer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [applyMessage, setApplyMessage] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchJob = async () => {
      try {
        const [jobRes, meRes] = await Promise.all([
          fetch(`/api/jobs/${id}`),
          fetch('/api/auth/me'),
        ])

        const jobData = await jobRes.json()
        if (!jobRes.ok) throw new Error(jobData.error || 'Job not found')
        setJob(jobData)

        if (meRes.ok) {
          const meData = await meRes.json()
          setViewer(meData.user || null)

          // Check if already applied
          if (meData.user?.user_type === 'talent') {
            const appRes = await fetch('/api/applications?limit=100')
            if (appRes.ok) {
              const appData = await appRes.json()
              const alreadyApplied = (appData.applications || []).some(
                (a: any) => a.job_id === id || a.job?.id === id
              )
              if (alreadyApplied) setApplied(true)
            }
          }
        } else {
          setViewer(null)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplying(true)
    setApplyMessage('')

    try {
      const userStr = localStorage.getItem('phphire_user')
      if (!userStr) {
        router.push('/auth/login')
        return
      }

      const user = JSON.parse(userStr)
      if (user.user_type !== 'talent') {
        setApplyMessage('Only developer accounts can apply to jobs.')
        setApplying(false)
        return
      }

      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id, cover_note: coverNote }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to apply')

      setApplied(true)
      setApplyMessage('Application submitted successfully.')
      setCoverNote('')
      setTimeout(() => router.push('/dashboard/applications'), 1200)
    } catch (err: any) {
      setApplyMessage(err.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const formatBudget = () => {
    if (!job) return ''
    if (job.budget_min && job.budget_max) {
      return `${job.budget_min} - ${job.budget_max} ${job.budget_type === 'hourly' ? 'per hour' : job.budget_type === 'monthly' ? 'per month' : 'total'}`
    }
    return 'Budget on discussion'
  }

  const formatMetaValue = (value: unknown, fallback = 'Not provided') => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <PageLoader label="Loading job..." minHeight="70vh" />
        <Footer />
      </>
    )
  }

  if (!job || error) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: '#DC2626' }}>{error || 'Job not found'}</p>
          <Link href="/jobs" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Back to Jobs</Link>
        </div>
        <Footer />
      </>
    )
  }

  const expired = new Date(job.expires_at) < new Date()
  const isRecruiter = viewer?.user_type === 'recruiter'
  const isTalent = viewer?.user_type === 'talent'
  const isOwnerRecruiter = Boolean(isRecruiter && (viewer?.id === job.poster_id || viewer?.id === job.poster?.id))
  const canApply = !isRecruiter && (!viewer || isTalent)
  const blockedRecruiter = Boolean(isRecruiter && !isOwnerRecruiter)

  if (blockedRecruiter) {
    return (
      <>
        <Navbar />
        <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0', color: '#0F0A1E' }}>This job is not in your recruiter account</h1>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px 0', lineHeight: 1.7 }}>
                Recruiter job review pages only show jobs posted by your own account. You can manage your own postings from the dashboard.
              </p>
              <Link href="/dashboard/applications" style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 10, background: '#7C3AED', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                Back to My Posted Jobs
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <Link
            href={isOwnerRecruiter ? '/dashboard/applications' : '/jobs'}
            style={{ display: 'inline-block', marginBottom: 24, color: '#7C3AED', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
          >
            {isOwnerRecruiter ? 'Back to My Posted Jobs' : 'Back to Jobs'}
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
            <div>
              <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E8E4F0', marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: '#0F0A1E' }}>{job.title}</h1>
                <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
                  {job.company_name || 'Hiring company'} · {job.hire_type?.replace('_', ' ')} · {job.preferred_location || 'Remote'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 6px 0' }}>Budget</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#7C3AED', margin: 0 }}>{formatBudget()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 6px 0' }}>Posted</p>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 6px 0' }}>Deadline</p>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: expired ? '#DC2626' : '#059669' }}>
                      {new Date(job.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E8E4F0', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0F0A1E' }}>Description</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#3D3558', whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </div>

              <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E8E4F0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0F0A1E' }}>Required Skills</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(job.required_skills || []).map((skill: string) => (
                    <span key={skill} style={{ padding: '6px 14px', background: '#EDE9FE', color: '#5B21B6', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1px solid #C4B5FD' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E8E4F0', position: 'sticky', top: 96 }}>
              {isOwnerRecruiter ? (
                <>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: '#0F0A1E' }}>Your Posted Job Details</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      ['Company', job.company_name],
                      ['Contact Name', job.contact_name],
                      ['Contact Email', job.contact_email],
                      ['Job Type', job.hire_type?.replace('_', ' ')],
                      ['Duration', job.duration],
                      ['Preferred Location', job.preferred_location],
                      ['Remote OK', job.remote_ok],
                      ['Language', job.required_language],
                      ['Applications', job.applications_count],
                      ['Status', job.status],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: '#FAFAF9', border: '1px solid #F1EDF7', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 11, color: '#7B7494', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, color: '#0F0A1E', fontWeight: 600 }}>{formatMetaValue(value)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : canApply ? (
                <form onSubmit={handleApply}>
                  {applyMessage && (
                    <div style={{ padding: 10, marginBottom: 12, borderRadius: 6, background: applyMessage.includes('successfully') ? '#D1FAE5' : '#FEE2E2', color: applyMessage.includes('successfully') ? '#059669' : '#DC2626', fontSize: 12, fontWeight: 500 }}>
                      {applyMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Cover Note</label>
                    <textarea
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Summarize your PHP experience, similar projects, and availability."
                      style={{ width: '100%', padding: 10, border: '1px solid #E8E4F0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', minHeight: 120, boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying || applied || expired}
                    style={{ width: '100%', padding: 12, background: applied ? '#D1FAE5' : expired ? '#CBD5E1' : '#7C3AED', color: applied ? '#065F46' : '#fff', border: applied ? '1px solid #6EE7B7' : 'none', borderRadius: 8, fontWeight: 600, cursor: applied || expired ? 'not-allowed' : 'pointer', opacity: applying ? 0.7 : 1, marginBottom: 12 }}
                  >
                    {applying ? 'Applying...' : applied ? '✓ Applied' : expired ? 'Applications Closed' : 'Apply Now'}
                  </button>
                </form>
              ) : (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px 0', color: '#0F0A1E' }}>Sign in as a developer to apply</h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: '0 0 16px 0' }}>
                    Candidate applications are available only for developer accounts. Recruiters can manage their own jobs from the dashboard.
                  </p>
                  <Link href="/auth/login" style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 10, background: '#7C3AED', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
