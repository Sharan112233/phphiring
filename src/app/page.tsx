'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

type Stats = {
  total_experts: number
  total_companies_hiring: number
  total_live_jobs: number
  total_applications: number
  total_countries: number
}

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<Stats>({
    total_experts: 0,
    total_companies_hiring: 0,
    total_live_jobs: 0,
    total_applications: 0,
    total_countries: 0,
  })

  useEffect(() => {
    const loadHome = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.ok) setStats(await statsRes.json())
      } catch (error) {
        console.error('Failed to load homepage data:', error)
      }
    }

    loadHome()
  }, [])

  const handleSearch = () => {
    router.push(searchQuery.trim() ? `/jobs?q=${encodeURIComponent(searchQuery.trim())}` : '/jobs')
  }

  return (
    <>
      <Navbar />
      <main>
        <section style={{ background: 'linear-gradient(135deg, #1a0f3f 0%, #2d1b4e 100%)', minHeight: '85vh', paddingTop: 60, paddingBottom: 60 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7C3AED', borderRadius: 24, color: '#D8B4FE', fontSize: 12, fontWeight: 600 }}>
                The PHP Developer Hiring Platform
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 56, fontWeight: 800, color: '#fff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
                Hire PHP developers the way teams use Naukri
              </h1>
              <p style={{ fontSize: 16, color: '#D1D5DB', margin: '0 0 32px 0', lineHeight: 1.6 }}>
                Recruiters post real PHP jobs, developers build living profiles, and every listing, application, and dashboard runs on live platform data.
              </p>
            </div>

            <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 16, padding: 32, margin: '0 auto 48px', maxWidth: 820 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Search Laravel, Symfony, WordPress, REST API..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ flex: 1, padding: '14px 16px', background: '#fff', border: 'none', borderRadius: 10, fontSize: 14, outline: 'none' }}
                />
                <button onClick={handleSearch} style={{ padding: '14px 32px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Search →
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Laravel', 'WordPress', 'Symfony', 'API', 'MySQL'].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => router.push(`/jobs?q=${encodeURIComponent(skill)}`)}
                    style={{ padding: '6px 14px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#D8B4FE', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center', marginBottom: 60 }}>
              <div><p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{stats.total_experts}+</p><p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>PHP Developers</p></div>
              <div><p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{stats.total_companies_hiring}+</p><p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Recruiters Hiring</p></div>
              <div><p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{stats.total_live_jobs}+</p><p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Live Jobs</p></div>
              <div><p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{stats.total_countries}+</p><p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Countries</p></div>
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/jobs" style={{ padding: '14px 32px', background: '#7C3AED', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Find PHP Jobs →</Link>
              <Link href="/browse" style={{ padding: '14px 32px', background: 'transparent', color: '#fff', border: '1px solid #7C3AED', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Browse Developers →</Link>
            </div>
          </div>
        </section>

        <section style={{ background: '#fff', padding: '60px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
              <div><div style={{ fontSize: 40, marginBottom: 16 }}>👥</div><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F0A1E' }}>Separate Recruiter and Developer Accounts</h3><p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>Recruiters post and manage jobs. Developers maintain PHP-only profiles and apply from their own dashboard.</p></div>
              <div><div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F0A1E' }}>Dynamic Search and Matching</h3><p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>Every browse page now reads live Supabase data for skills, availability, applications, and activity.</p></div>
              <div><div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F0A1E' }}>Real Hiring Workflow</h3><p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>From registration to posting jobs to applying and tracking pipelines, the platform behaves like a focused PHP hiring marketplace.</p></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
