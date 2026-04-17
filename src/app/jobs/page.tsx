'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PaymentModal from '@/components/ui/PaymentModal'
import PageLoader from '@/components/ui/PageLoader'

const QUICK_FILTERS = ['All', 'Laravel', 'WordPress', 'Symfony', 'Remote', 'Full Time', 'Contract', 'Closing Soon']
const FRAMEWORKS = ['Laravel', 'Symfony', 'CodeIgniter', 'Yii2', 'CakePHP', 'Slim', 'Zend', 'Phalcon']
const CMS_ECOM = ['WordPress', 'WooCommerce', 'Drupal', 'Joomla', 'Magento', 'PrestaShop', 'OpenCart']
const CRMS = ['SugarCRM', 'SuiteCRM', 'Vtiger', 'Dolibarr', 'Odoo', 'EspoCRM', 'CiviCRM']
const COMBINED = ['PHP', 'MySQL', 'PostgreSQL', 'Redis', 'REST API', 'GraphQL', 'Docker', 'AWS']

function BrowseJobsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('All')
  const [applying, setApplying] = useState<string | null>(null)
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [toast, setToast] = useState('')
  const [coverModal, setCoverModal] = useState<string | null>(null)
  const [coverNote, setCoverNote] = useState('')
  const [sortBy, setSortBy] = useState('Newest')
  const [selFrameworks, setSelFrameworks] = useState<string[]>([])
  const [selCMS, setSelCMS] = useState<string[]>([])
  const [selCRMs, setSelCRMs] = useState<string[]>([])
  const [selCombined, setSelCombined] = useState<string[]>([])
  const [selType, setSelType] = useState('All')
  const [selRemote, setSelRemote] = useState('All')
  const [selDate, setSelDate] = useState('All')

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    fetchJobs()
  }, [searchParams])

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

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter((item) => item !== val) : [...list, val])
  }

  const clearAll = () => {
    setSearch('')
    setQuickFilter('All')
    setSelFrameworks([])
    setSelCMS([])
    setSelCRMs([])
    setSelCombined([])
    setSelType('All')
    setSelRemote('All')
    setSelDate('All')
    setSortBy('Newest')
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
    if (!deadline) return { text: 'No deadline', color: '#6B7280', diffDays: 999 }
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { text: 'Closed', color: '#DC2626', diffDays }
    if (diffDays === 0) return { text: 'Closes today', color: '#DC2626', diffDays }
    if (diffDays === 1) return { text: 'Closes tomorrow', color: '#D97706', diffDays }
    return { text: `${diffDays} days left`, color: '#059669', diffDays }
  }

  function formatBudget(job: any) {
    if (!job.budget_min && !job.budget_max) return 'Budget on discussion'
    if (job.budget_type === 'hourly') return `$${job.budget_min || 0}-$${job.budget_max || 0}/hr`
    return `₹${job.budget_min || 0}-₹${job.budget_max || 0}`
  }

  function filterJobs() {
    let filtered = [...jobs]

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((j) =>
        j.title?.toLowerCase().includes(q) ||
        j.company_name?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        (j.required_skills || []).some((s: string) => s.toLowerCase().includes(q))
      )
    }

    if (quickFilter !== 'All') {
      if (quickFilter === 'Remote') {
        filtered = filtered.filter((j) => j.remote_ok)
      } else if (quickFilter === 'Full Time') {
        filtered = filtered.filter((j) => j.hire_type === 'full_time')
      } else if (quickFilter === 'Contract') {
        filtered = filtered.filter((j) => j.hire_type === 'contract')
      } else if (quickFilter === 'Closing Soon') {
        filtered = filtered.filter((j) => daysUntilDeadline(j.expires_at).diffDays <= 3)
      } else {
        filtered = filtered.filter((j) =>
          (j.required_skills || []).some((skill: string) => skill.toLowerCase() === quickFilter.toLowerCase())
        )
      }
    }

    const allSelected = [...selFrameworks, ...selCMS, ...selCRMs, ...selCombined]
    if (allSelected.length > 0) {
      filtered = filtered.filter((j) =>
        allSelected.some((sel) =>
          (j.required_skills || []).some((skill: string) => skill.toLowerCase() === sel.toLowerCase())
        )
      )
    }

    if (selType !== 'All') {
      filtered = filtered.filter((j) => j.hire_type === selType)
    }

    if (selRemote !== 'All') {
      filtered = filtered.filter((j) => selRemote === 'remote' ? j.remote_ok : !j.remote_ok)
    }

    if (selDate !== 'All') {
      const today = new Date()
      filtered = filtered.filter((j) => {
        const postedAt = new Date(j.created_at)
        const diffDays = Math.ceil((today.getTime() - postedAt.getTime()) / (1000 * 60 * 60 * 24))
        if (selDate === 'today') return diffDays === 0
        if (selDate === 'week') return diffDays <= 7
        if (selDate === 'month') return diffDays <= 30
        if (selDate === 'active') return new Date(j.expires_at) > today
        return true
      })
    }

    if (sortBy === 'Closing Soon') {
      filtered.sort((a, b) => daysUntilDeadline(a.expires_at).diffDays - daysUntilDeadline(b.expires_at).diffDays)
    } else if (sortBy === 'Highest Budget') {
      filtered.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0))
    } else if (sortBy === 'Lowest Budget') {
      filtered.sort((a, b) => (a.budget_min || 0) - (b.budget_min || 0))
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
      setAppliedJobs((prev) => [...prev, coverModal])
      setCoverModal(null)
      setCoverNote('')
      showToast('Application submitted successfully!')
    } catch {
      showToast('Something went wrong. Try again.')
    }
    setApplying(null)
  }

  const filtered = filterJobs()

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: active ? 600 : 400,
    padding: '4px 10px',
    borderRadius: 20,
    border: '1.5px solid',
    borderColor: active ? '#7C3AED' : '#E8E4F0',
    background: active ? '#EDE9FE' : '#fff',
    color: active ? '#5B21B6' : '#3D3558',
    cursor: 'pointer',
    transition: 'all 0.12s',
  })

  return (
    <>
      <Navbar />

      <div style={{ background: '#fff', borderBottom: '1px solid #E8E4F0', padding: '10px 0', position: 'sticky', top: 64, zIndex: 90 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#7B7494', fontWeight: 500, marginRight: 4 }}>Quick:</span>
          {QUICK_FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setQuickFilter(item)}
              style={{
                fontSize: 12,
                fontWeight: quickFilter === item ? 700 : 500,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1.5px solid',
                borderColor: quickFilter === item ? '#7C3AED' : '#E8E4F0',
                background: quickFilter === item ? '#7C3AED' : '#fff',
                color: quickFilter === item ? '#fff' : '#3D3558',
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 16, padding: 20, position: 'sticky', top: 120, height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0A1E' }}>Filters</span>
            <button onClick={clearAll} style={{ fontSize: 12, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Clear all
            </button>
          </div>

          <input
            type="text"
            placeholder="Search title, skill, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8E4F0', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 16, boxSizing: 'border-box', fontFamily: 'inherit' }}
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7B7494', marginBottom: 8 }}>Job Type</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'freelance', 'contract', 'full_time', 'part_time'].map((type) => (
                <button key={type} onClick={() => setSelType(type)} style={filterBtnStyle(selType === type)}>
                  {type === 'All' ? 'All' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7B7494', marginBottom: 8 }}>Remote</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'remote', 'onsite'].map((item) => (
                <button key={item} onClick={() => setSelRemote(item)} style={filterBtnStyle(selRemote === item)}>
                  {item === 'All' ? 'All' : item === 'remote' ? 'Remote' : 'On-site/Hybrid'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7B7494', marginBottom: 8 }}>Posted</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'today', 'week', 'month', 'active'].map((item) => (
                <button key={item} onClick={() => setSelDate(item)} style={filterBtnStyle(selDate === item)}>
                  {item === 'All' ? 'All' : item === 'week' ? 'This week' : item === 'month' ? 'This month' : item === 'active' ? 'Still active' : 'Today'}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: 'Frameworks', items: FRAMEWORKS, state: selFrameworks, setter: setSelFrameworks },
            { label: 'CMS / E-Commerce', items: CMS_ECOM, state: selCMS, setter: setSelCMS },
            { label: 'PHP CRMs', items: CRMS, state: selCRMs, setter: setSelCRMs },
            { label: 'Combined Skills', items: COMBINED, state: selCombined, setter: setSelCombined },
          ].map((section) => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7B7494', marginBottom: 8 }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {section.items.map((item) => {
                  const active = section.state.includes(item)
                  return (
                    <button key={item} onClick={() => toggle(section.state, section.setter, item)} style={filterBtnStyle(active)}>
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 14, color: '#3D3558' }}>
              <strong style={{ fontSize: 16, color: '#0F0A1E' }}>{filtered.length}</strong> PHP jobs found
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: 13, padding: '7px 12px', border: '1.5px solid #E8E4F0', borderRadius: 8, background: '#fff', outline: 'none', cursor: 'pointer', color: '#0F0A1E' }}
            >
              {['Newest', 'Closing Soon', 'Highest Budget', 'Lowest Budget'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          {loading ? (
            <PageLoader label="Loading jobs..." minHeight="50vh" />
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.35 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No jobs found</h3>
              <p style={{ fontSize: 14, color: '#7B7494', marginBottom: 16 }}>Try changing your filters or search term</p>
              <button onClick={clearAll} style={{ padding: '9px 20px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((job) => {
                const deadline = daysUntilDeadline(job.expires_at)
                return (
                  <div key={job.id} style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 16, padding: '18px 20px', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EDE9FE', color: '#5B21B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                        {job.company_name?.charAt(0) || 'J'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                          <div>
                            <Link href={`/jobs/${job.id}`} style={{ fontSize: 16, fontWeight: 700, color: '#0F0A1E', textDecoration: 'none' }}>
                              {job.title}
                            </Link>
                            <div style={{ fontSize: 13, color: '#7B7494', marginTop: 2 }}>
                              🏢 {job.company_name || 'Hiring company'} · 📍 {job.preferred_location || 'Remote'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#7C3AED' }}>{formatBudget(job)}</div>
                            <div style={{ fontSize: 11, color: '#7B7494', marginTop: 2 }}>{job.hire_type?.replace('_', ' ') || 'Freelance'}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '10px 0' }}>
                          {(job.required_skills || []).slice(0, 6).map((skill: string) => (
                            <span key={skill} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: '#EDE9FE', color: '#5B21B6', border: '1px solid #C4B5FD' }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#7B7494', flexWrap: 'wrap' }}>
                            <span>⏰ {timeAgo(job.created_at)}</span>
                            <span>⏳ <span style={{ color: deadline.color, fontWeight: 600 }}>{deadline.text}</span></span>
                            <span>{job.remote_ok ? 'Remote-friendly' : 'Location based'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link href={`/jobs/${job.id}`} style={{ fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #E8E4F0', background: '#fff', color: '#3D3558', textDecoration: 'none' }}>
                              View Details
                            </Link>
                            <button
                              onClick={() => handleApplyClick(job.id)}
                              disabled={!!applying || appliedJobs.includes(job.id)}
                              style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: 'none', background: appliedJobs.includes(job.id) ? '#D1FAE5' : '#7C3AED', color: appliedJobs.includes(job.id) ? '#065F46' : '#fff', cursor: appliedJobs.includes(job.id) ? 'default' : 'pointer' }}
                            >
                              {applying === job.id ? 'Submitting...' : appliedJobs.includes(job.id) ? 'Applied' : 'Apply Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {coverModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,10,30,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => e.target === e.currentTarget && setCoverModal(null)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Apply for this job</h3>
            <p style={{ fontSize: 13, color: '#7B7494', marginBottom: 20 }}>Add a cover note to stand out (optional but recommended)</p>
            <textarea
              placeholder="Briefly explain your relevant PHP experience and why you are a great fit..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              style={{ width: '100%', minHeight: 120, padding: '10px 14px', border: '1.5px solid #E8E4F0', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCoverModal(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #E8E4F0', borderRadius: 10, background: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#3D3558' }}>
                Cancel
              </button>
              <button onClick={submitApplication} disabled={!!applying} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 10, background: '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {applying ? 'Submitting...' : 'Submit Application →'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0F0A1E', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <Footer />
    </>
  )
}

export default function BrowseJobsPage() {
  return (
    <Suspense>
      <BrowseJobsContent />
    </Suspense>
  )
}
