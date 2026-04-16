'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PaymentModal from '../../components/ui/PaymentModal'

export default function BrowseJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [applying, setApplying] = useState<string | null>(null)
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [toast, setToast] = useState('')
  const [coverModal, setCoverModal] = useState<string | null>(null)
  const [coverNote, setCoverNote] = useState('')

  // Filters
  const [filterType, setFilterType] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  function timeAgo(d: string) {
    if (!d) return 'N/A'
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  function daysUntilDeadline(deadline: string | null | undefined) {
    if (!deadline) return { text: 'No deadline', color: '#6B7280' }
    
    const today = new Date()
    const deadlineDate = new Date(deadline)
    
    if (isNaN(deadlineDate.getTime())) {
      return { text: 'Invalid date', color: '#6B7280' }
    }
    
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Closed', color: '#DC2626' }
    if (diffDays === 0) return { text: 'Closes today', color: '#DC2626' }
    if (diffDays === 1) return { text: 'Closes tomorrow', color: '#D97706' }
    return { text: `${diffDays} days left`, color: '#059669' }
  }

  function formatBudget(job: any) {
    if (job.budget_type === 'monthly' || job.budget_type === 'fixed') {
      const formatNum = (n: number) => {
        if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`
        if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
        return `₹${n}`
      }
      return `${formatNum(job.budget_min)}–${formatNum(job.budget_max)}`
    }
    return `$${job.budget_min}–$${job.budget_max}/hr`
  }

  function filterJobs() {
    let filtered = jobs

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.company_name?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        (j.required_skills || []).some((s: string) => s.toLowerCase().includes(q))
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(j => j.hire_type === filterType)
    }

    // Budget filter
    if (minBudget) {
      filtered = filtered.filter(j => j.budget_min >= parseInt(minBudget))
    }
    if (maxBudget) {
      filtered = filtered.filter(j => j.budget_max <= parseInt(maxBudget))
    }

    // Date filter
    if (filterDate !== 'all') {
      const today = new Date()
      filtered = filtered.filter(j => {
        const jobDate = new Date(j.created_at)
        const diffDays = Math.ceil((today.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))

        if (filterDate === 'today') return diffDays === 0
        if (filterDate === 'week') return diffDays <= 7
        if (filterDate === 'month') return diffDays <= 30
        if (filterDate === 'active') {
          if (!j.deadline_date) return true
          const deadline = new Date(j.deadline_date)
          return deadline > today
        }
        return true
      })
    }

    return filtered
  }

  function handleApplyClick(jobId: string) {
    const stored = localStorage.getItem('phphire_user')
    if (!stored) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(stored)
    if (user.user_type !== 'talent') {
      showToast('Only talent accounts can apply to jobs.')
      return
    }
    setCoverModal(jobId)
  }

  async function submitApplication() {
    if (!coverModal) return
    setApplying(coverModal)
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: coverModal, cover_note: coverNote }),
      })
      const data = await res.json()
      if (res.status === 402 && data.needs_payment) {
        setCoverModal(null)
        setShowPayment(true)
        setApplying(null)
        return
      }
      if (!res.ok) {
        showToast(data.error || 'Failed to apply')
        setApplying(null)
        return
      }
      setAppliedJobs(prev => [...prev, coverModal])
      setCoverModal(null)
      setCoverNote('')
      showToast('Application submitted successfully! 🎉')
    } catch {
      showToast('Something went wrong. Try again.')
    }
    setApplying(null)
  }

  const filtered = filterJobs()

  return (
    <>
      <Navbar />

      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0A1E 0%, #1E1035 100%)',
        padding: '40px 0 32px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            PHP Jobs
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
            Latest PHP jobs from verified businesses — Laravel, Symfony, WordPress, CRM and more
          </p>
          <input
            type="text"
            placeholder="Search by title, skill, framework, company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 560,
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              color: '#0F0A1E',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E8E4F0',
        padding: '16px 0',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8E4F0',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="all">All Types</option>
              <option value="freelance">Freelance</option>
              <option value="contract">Contract</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
            </select>

            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8E4F0',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Posted Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="active">Still Active</option>
            </select>

            <input
              type="number"
              placeholder="Min Budget"
              value={minBudget}
              onChange={e => setMinBudget(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8E4F0',
                borderRadius: 8,
                fontSize: 13,
              }}
            />

            <input
              type="number"
              placeholder="Max Budget"
              value={maxBudget}
              onChange={e => setMaxBudget(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8E4F0',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </div>
        </div>
      </div>

      {/* Jobs list */}
      <div style={{ background: '#FAFAF9', minHeight: '70vh', padding: '24px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

          {loading ? (
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
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #E8E4F0',
            }}>
              <p style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔍</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No jobs found</h3>
              <p style={{ fontSize: 14, color: '#666' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#7B7494', marginBottom: 14 }}>
                <strong style={{ color: '#0F0A1E' }}>{filtered.length}</strong> PHP jobs found
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(job => {
                  const deadline = daysUntilDeadline(job.deadline_date)
                  return (
                    <div key={job.id} style={{
                      background: '#fff',
                      border: '1px solid #E8E4F0',
                      borderRadius: 16,
                      padding: '18px 20px',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#C4B5FD'
                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(91,33,182,0.06)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E4F0'
                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* Company logo */}
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 10,
                          background: '#EDE9FE',
                          color: '#5B21B6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {job.company_name?.charAt(0) || 'J'}
                        </div>

                        {/* Job info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 12,
                            marginBottom: 4,
                          }}>
                            <div>
                              <Link href={`/jobs/${job.id}`} style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: '#0F0A1E',
                                textDecoration: 'none',
                              }}>
                                {job.title}
                              </Link>
                              <div style={{ fontSize: 13, color: '#7B7494', marginTop: 2 }}>
                                🏢 {job.company_name} · 📍 {job.preferred_location || 'Remote'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#7C3AED' }}>
                                {formatBudget(job)}
                              </div>
                              <div style={{ fontSize: 11, color: '#7B7494', marginTop: 2 }}>
                                {job.hire_type?.replace('_', ' ') || 'Freelance'}
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '10px 0' }}>
                            {(job.required_skills || []).slice(0, 5).map((s: string) => (
                              <span key={s} style={{
                                fontSize: 11,
                                fontWeight: 500,
                                padding: '3px 9px',
                                borderRadius: 20,
                                background: '#EDE9FE',
                                color: '#5B21B6',
                                border: '1px solid #C4B5FD',
                              }}>
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Footer row */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}>
                            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#7B7494' }}>
                              <span>⏰ {timeAgo(job.created_at)}</span>
                              <span>⏳ <span style={{ color: deadline.color, fontWeight: 600 }}>{deadline.text}</span></span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Link href={`/jobs/${job.id}`} style={{
                                fontSize: 12,
                                fontWeight: 500,
                                padding: '7px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #E8E4F0',
                                background: '#fff',
                                color: '#3D3558',
                                textDecoration: 'none',
                              }}>
                                View Details
                              </Link>
                              <button
                                onClick={() => handleApplyClick(job.id)}
                                disabled={!!applying || appliedJobs.includes(job.id)}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  padding: '7px 14px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: appliedJobs.includes(job.id) ? '#D1FAE5' : '#7C3AED',
                                  color: appliedJobs.includes(job.id) ? '#065F46' : '#fff',
                                  cursor: appliedJobs.includes(job.id) ? 'default' : 'pointer',
                                }}
                              >
                                {applying === job.id
                                  ? 'Submitting...'
                                  : appliedJobs.includes(job.id)
                                  ? '✓ Applied'
                                  : 'Apply Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cover note modal */}
      {coverModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(15,10,30,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
          onClick={e => e.target === e.currentTarget && setCoverModal(null)}
        >
          <div style={{
            background: '#fff', borderRadius: 20, padding: 32,
            maxWidth: 480, width: '100%',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Apply for this job
            </h3>
            <p style={{ fontSize: 13, color: '#7B7494', marginBottom: 20 }}>
              Add a cover note to stand out (optional but recommended)
            </p>
            <textarea
              placeholder="Briefly explain your relevant PHP experience and why you are a great fit..."
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              style={{
                width: '100%', minHeight: 120,
                padding: '10px 14px',
                border: '1.5px solid #E8E4F0',
                borderRadius: 10, fontSize: 14,
                outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setCoverModal(null)}
                style={{
                  flex: 1, padding: '12px',
                  border: '1.5px solid #E8E4F0',
                  borderRadius: 10, background: '#fff',
                  fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', color: '#3D3558',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={!!applying}
                style={{
                  flex: 2, padding: '12px',
                  border: 'none', borderRadius: 10,
                  background: '#7C3AED', color: '#fff',
                  fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {applying ? 'Submitting...' : 'Submit Application →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          purpose="job_seeker_pro"
          onSuccess={() => {
            setShowPayment(false)
            showToast('Pro activated! You can now apply unlimited times.')
          }}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#0F0A1E', color: '#fff',
          padding: '12px 20px', borderRadius: 10,
          fontSize: 14, zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      <Footer />
    </>
  )
}