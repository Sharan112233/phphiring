'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [applyMessage, setApplyMessage] = useState('')

  useEffect(() => {
    if (!id) return
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`)
      if (!res.ok) throw new Error('Job not found')
      const data = await res.json()
      setJob(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

      const userData = JSON.parse(userStr)

      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.id,
          cover_note: coverNote,
          job_id: id,
        }),
      })

      if (!res.ok) throw new Error('Failed to apply')

      setApplyMessage('✓ Application submitted successfully!')
      setCoverNote('')
      setTimeout(() => router.push('/dashboard/applications'), 2000)
    } catch (err: any) {
      setApplyMessage('✗ Error: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  const daysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Closed', color: '#DC2626' }
    if (diffDays === 0) return { text: 'Closes today', color: '#DC2626' }
    if (diffDays === 1) return { text: 'Closes tomorrow', color: '#D97706' }
    return { text: `${diffDays} days left`, color: '#059669' }
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return `${Math.floor(diff / 604800)}w ago`
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #E8E4F0',
            borderTopColor: '#7C3AED',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !job) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column' }}>
          <p style={{ color: '#DC2626', fontSize: 18, marginBottom: 16 }}>Error: {error || 'Job not found'}</p>
          <Link href="/jobs" style={{
            padding: '10px 20px',
            background: '#7C3AED',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Back to Jobs
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const deadline = daysUntilDeadline(job.deadline_date)

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          {/* Back Button */}
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              marginBottom: 24,
              color: '#7C3AED',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ← Back to Jobs
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'flex-start' }}>
            {/* Main Content */}
            <div>
              {/* Header */}
              <div style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #E8E4F0',
                marginBottom: 24,
              }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: '#0F0A1E' }}>
                  {job.title}
                </h1>
                <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
                  {job.company_name} · {job.hire_type}
                </p>

                {/* Dates Info */}
                <div style={{
                  background: '#F8F7FF',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>📅 Posted: {timeAgo(job.created_at)}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>⏰ Deadline: {deadline.text}</span>
                    <span style={{
                      color: deadline.color,
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      {new Date(job.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Budget */}
                <div style={{
                  display: 'flex',
                  gap: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #E8E4F0',
                }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 6px 0' }}>
                      Budget
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED', margin: 0 }}>
                      ${job.budget_min}-${job.budget_max}
                    </p>
                    <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0 0' }}>
                      {job.budget_type === 'hourly' ? 'per hour' : 'total'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #E8E4F0',
                marginBottom: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0F0A1E' }}>
                  Description
                </h2>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#3D3558',
                  whiteSpace: 'pre-wrap',
                }}>
                  {job.description}
                </p>
              </div>

              {/* Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid #E8E4F0',
                }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0F0A1E' }}>
                    Required Skills
                  </h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {job.required_skills.map((skill: string) => (
                      <span
                        key={skill}
                        style={{
                          padding: '6px 14px',
                          background: '#EDE9FE',
                          color: '#5B21B6',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          border: '1px solid #C4B5FD',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Apply Form */}
            <div style={{
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #E8E4F0',
              height: 'fit-content',
              position: 'sticky',
              top: 100,
            }}>
              <form onSubmit={handleApply}>
                {applyMessage && (
                  <div style={{
                    padding: 10,
                    marginBottom: 12,
                    borderRadius: 6,
                    background: applyMessage.includes('✓') ? '#D1FAE5' : '#FEE2E2',
                    color: applyMessage.includes('✓') ? '#059669' : '#DC2626',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {applyMessage}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
                    Cover Note
                  </label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell the recruiter why you're a great fit..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #E8E4F0',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'inherit',
                      minHeight: 100,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  style={{
                    width: '100%',
                    padding: 12,
                    background: '#7C3AED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: applying ? 'not-allowed' : 'pointer',
                    opacity: applying ? 0.7 : 1,
                    marginBottom: 12,
                  }}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>

                {new Date(job.deadline_date) < new Date() && (
                  <div style={{
                    padding: 10,
                    background: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: 6,
                    fontSize: 12,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}>
                    This job has closed
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}