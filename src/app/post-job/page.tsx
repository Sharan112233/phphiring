'use client'
// src/app/post-job/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PaymentModal from '@/components/ui/PaymentModal'
import styles from './post-job.module.css'

const PHP_SKILLS = [
  'Laravel','Symfony','CodeIgniter','Yii2','CakePHP','WordPress','WooCommerce',
  'Drupal','Joomla','Magento','PrestaShop','SugarCRM','SuiteCRM','Vtiger',
  'Odoo','EspoCRM','MySQL','PostgreSQL','Redis','Vue.js','React','Docker','AWS','REST API','GraphQL'
]

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '', 
    description: '', 
    company_name: '',
    budget_type: 'fixed', 
    budget_min: '', 
    budget_max: '',
    duration: '1-3 months', 
    hire_type: 'freelance',
    preferred_location: 'Remote', 
    remote_ok: true,
    required_language: 'English',
    contact_email: '', 
    contact_name: '', 
    deadline_date: '', // ADD THIS
  })

  function toggleSkill(skill: string) {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client side auth check
    const stored = localStorage.getItem('phphire_user')
    if (!stored) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          required_skills: selectedSkills,
          deadline_date: form.deadline_date, // FIXED: Use form.deadline_date not formData
        }),
      })
      const data = await res.json()

      if (res.status === 402 && data.needs_payment) {
        setShowPayment(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError(data.error || 'Failed to post job')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function onPaymentSuccess() {
    setShowPayment(false)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className={styles.successPage}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2>Job posted successfully!</h2>
            <p>Your job is live and visible to 1,200+ PHP experts. We'll notify matching developers immediately.</p>
            <p style={{fontSize:13,color:'var(--ink-light)',marginTop:8}}>Check your email for confirmation and applicant notifications.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:24,flexWrap:'wrap'}}>
              <button className="btn btn-primary" onClick={() => router.push('/dashboard/applications')}>
                View Applications →
              </button>
              <button className="btn" onClick={() => router.push('/browse')}>
                Browse Talent
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.pageInner}>
          <div className={styles.pageHeader}>
            <h1>Post a PHP Job</h1>
            <p>Describe your project and get matched with verified PHP experts. <strong>Free to post</strong> (3 jobs/month on free plan).</p>
          </div>

          <div className={styles.layout}>
            <form className={styles.form} onSubmit={handleSubmit}>
              {error && <div className="alert alert-error" style={{marginBottom:20}}>{error}</div>}

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Job Details</h3>
                <div className="form-group">
                  <label className="form-label">Job Title <span className="required">*</span></label>
                  <input className="form-input" type="text" placeholder="e.g. Senior Laravel Developer for E-commerce API, Vtiger CRM Customization Expert..." value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Description <span className="required">*</span></label>
                  <textarea className="form-textarea" style={{minHeight:140}} placeholder="Describe what you need built, your current tech setup, goals, deliverables, and any constraints. Be specific — it helps you get better applications." value={form.description} onChange={e => setForm({...form,description:e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Company / Project Name</label>
                  <input className="form-input" type="text" placeholder="Your company or project name (optional)" value={form.company_name} onChange={e => setForm({...form,company_name:e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Posted Date (Today)</label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    readOnly
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Required PHP Skills</h3>
                <p style={{fontSize:13,color:'var(--ink-light)',marginBottom:12}}>Select all technologies the expert needs to know</p>
                <div className={styles.skillGrid}>
                  {PHP_SKILLS.map(s => (
                    <button
                      key={s} type="button"
                      className={`${styles.skillToggle} ${selectedSkills.includes(s) ? styles.skillToggleActive : ''}`}
                      onClick={() => toggleSkill(s)}
                    >
                      {selectedSkills.includes(s) ? '✓ ' : ''}{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Budget & Timeline</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Budget Type</label>
                    <select className="form-select" value={form.budget_type} onChange={e => setForm({...form,budget_type:e.target.value})}>
                      <option value="fixed">Fixed price</option>
                      <option value="hourly">Hourly rate</option>
                      <option value="monthly">Monthly retainer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select className="form-select" value={form.duration} onChange={e => setForm({...form,duration:e.target.value})}>
                      <option>Under 1 week</option>
                      <option>1–4 weeks</option>
                      <option>1–3 months</option>
                      <option>3–6 months</option>
                      <option>Ongoing</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Min Budget (USD/₹)</label>
                    <input className="form-input" type="number" placeholder="e.g. 500" value={form.budget_min} onChange={e => setForm({...form,budget_min:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Budget (USD/₹)</label>
                    <input className="form-input" type="number" placeholder="e.g. 2000" value={form.budget_max} onChange={e => setForm({...form,budget_max:e.target.value})} />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Preferences</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hire Type</label>
                    <select className="form-select" value={form.hire_type} onChange={e => setForm({...form,hire_type:e.target.value})}>
                      <option value="freelance">Freelancer</option>
                      <option value="contract">Contract</option>
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.deadline_date}
                      onChange={e => setForm({...form, deadline_date: e.target.value})}
                      required
                    />
                    <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '4px 0 0 0' }}>
                      Candidates will see when applications close
                    </p>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Required Language</label>
                    <select className="form-select" value={form.required_language} onChange={e => setForm({...form,required_language:e.target.value})}>
                      <option>English</option><option>Hindi</option><option>Spanish</option>
                      <option>French</option><option>German</option><option>Any</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Location</label>
                    <select className="form-select" value={form.preferred_location} onChange={e => setForm({...form,preferred_location:e.target.value})}>
                      <option>Remote — anywhere</option>
                      <option>India preferred</option>
                      <option>Europe preferred</option>
                      <option>USA/Canada only</option>
                      <option>My timezone ±3hrs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Your Contact Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Jane Smith" value={form.contact_name} onChange={e => setForm({...form,contact_name:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input className="form-input" type="email" placeholder="jane@company.com" value={form.contact_email} onChange={e => setForm({...form,contact_email:e.target.value})} required />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '🚀 Post Job — Free →'}
              </button>
            </form>

            {/* Sidebar tips */}
            <div className={styles.tips}>
              <div className={styles.tipCard}>
                <h4>💡 Tips for a great job post</h4>
                <ul className={styles.tipList}>
                  <li>Be specific about the PHP version required</li>
                  <li>Mention your existing tech stack</li>
                  <li>Include realistic timeline and budget</li>
                  <li>Specify timezone requirements if any</li>
                </ul>
              </div>
              <div className={styles.tipCard} style={{background:'var(--purple-pale)',border:'1px solid var(--purple-mid)'}}>
                <h4 style={{color:'var(--purple)'}}>📊 Plan limits</h4>
                <div style={{fontSize:13,color:'var(--ink-mid)',marginTop:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                    <span>Free plan</span><span>3 jobs/month</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',color:'var(--purple)',fontWeight:600}}>
                    <span>Pro plan (₹99)</span><span>Unlimited</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{width:'100%',marginTop:10,fontSize:13}} onClick={() => setShowPayment(true)}>
                  Upgrade to Pro →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          purpose="recruiter_pro"
          onSuccess={onPaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
      <Footer />
    </>
  )
}