'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1a0f3f 0%, #2d1b4e 100%)', padding: '64px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(124,58,237,0.2)', border: '1px solid #7C3AED', borderRadius: 24, color: '#D8B4FE', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
              Get in Touch
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Contact PHPhire
            </h1>
            <p style={{ fontSize: 16, color: '#D1D5DB', margin: 0, lineHeight: 1.6 }}>
              Have a question, partnership idea, or need support? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ background: '#f9fafb', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'start' }}>

            {/* Info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '📧', title: 'Email Us', desc: 'For general enquiries and support', value: 'support@phphire.com' },
                { icon: '💼', title: 'Partnerships', desc: 'Agencies, integrations, and business deals', value: 'partners@phphire.com' },
                { icon: '🐛', title: 'Report a Bug', desc: 'Found something broken? Let us know', value: 'Open a GitHub Issue' },
                { icon: '⏱️', title: 'Response Time', desc: 'We typically reply within', value: '1–2 business days' },
              ].map(({ icon, title, desc, value }) => (
                <div key={title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: 15, color: '#0F0A1E' }}>{title}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#6b7280' }}>{desc}</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '36px 32px' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F0A1E', margin: '0 0 24px 0' }}>Send a Message</h2>

              {status === 'sent' ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F0A1E', marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>We&apos;ll get back to you within 1–2 business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name *</label>
                      <input
                        required
                        style={inputStyle}
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email *</label>
                      <input
                        required
                        type="email"
                        style={inputStyle}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject *</label>
                    <select
                      required
                      style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    >
                      <option value="">Select a subject</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing & Payments">Billing &amp; Payments</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Report a Bug">Report a Bug</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message *</label>
                    <textarea
                      required
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="Describe your question or issue in detail..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  {status === 'error' && (
                    <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Something went wrong. Please try again or email us directly.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{ padding: '13px 28px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: status === 'sending' ? 'not-allowed' : 'pointer', opacity: status === 'sending' ? 0.7 : 1 }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
