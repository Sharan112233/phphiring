'use client'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TalentDetailPage() {
  const { id } = useParams()
  const [talent, setTalent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchTalent = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/talent/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Talent not found')
        setTalent(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load talent profile')
      } finally {
        setLoading(false)
      }
    }

    fetchTalent()
  }, [id])

  const initials = useMemo(() => {
    const fullName = talent?.full_name || ''
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PD'
  }, [talent])

  const avatarColors = useMemo(() => {
    const colors = [
      { bg: '#EDE9FE', tc: '#5B21B6' },
      { bg: '#DBEAFE', tc: '#1E40AF' },
      { bg: '#D1FAE5', tc: '#065F46' },
      { bg: '#FEF3C7', tc: '#92400E' },
      { bg: '#FCE7F3', tc: '#9D174D' },
      { bg: '#ECFDF5', tc: '#064E3B' },
      { bg: '#FFF7ED', tc: '#7C2D12' },
    ]
    return colors[(talent?.full_name?.charCodeAt(0) || 0) % colors.length]
  }, [talent])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF9' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid #E8E4F0', borderTopColor: '#7C3AED', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ width: 220, height: 10, borderRadius: 999, margin: '0 auto 10px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9D5FF 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            <div style={{ width: 160, height: 10, borderRadius: 999, margin: '0 auto', background: 'linear-gradient(90deg, #F3F4F6 25%, #E9D5FF 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !talent) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', background: '#FAFAF9' }}>
          <p style={{ color: '#DC2626', fontSize: 18, marginBottom: 16 }}>Error: {error || 'Talent not found'}</p>
          <Link href="/browse" style={{ padding: '10px 20px', background: '#7C3AED', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
            Back to Find Talent
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const locationLabel = talent.location || [talent.location_city, talent.location_country].filter(Boolean).join(', ') || 'Remote'

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/browse" style={{ display: 'inline-block', marginBottom: 24, color: '#7C3AED', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Back to Find Talent
          </Link>

          <div style={{ background: '#fff', padding: 32, borderRadius: 16, marginBottom: 24, border: '1px solid #E8E4F0' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E8E4F0', flexWrap: 'wrap' }}>
              <div style={{ width: 120, height: 120, background: avatarColors.bg, color: avatarColors.tc, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 800, flexShrink: 0 }}>
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#0F0A1E' }}>{talent.full_name}</h1>
                  {talent.verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#D1FAE5', color: '#059669' }}>Verified</span>}
                  {talent.featured && <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }}>Featured</span>}
                </div>

                <p style={{ fontSize: 16, color: '#7B7494', margin: '0 0 12px 0', fontWeight: 500 }}>{talent.title || talent.headline || 'PHP Developer'}</p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14, color: '#7B7494' }}>
                  <span>Location: {locationLabel}</span>
                  {talent.languages?.length > 0 && <span>Languages: {talent.languages.join(', ')}</span>}
                </div>
              </div>
            </div>

            {talent.skills?.length > 0 && (
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #E8E4F0' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {talent.skills.map((skill: string) => (
                    <span key={skill} style={{ display: 'inline-block', padding: '6px 14px', background: '#EDE9FE', color: '#5B21B6', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1px solid #C4B5FD' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
              <div>
                <p style={{ fontSize: 12, color: '#7B7494', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 600 }}>Jobs Completed</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{talent.total_jobs || 0}+</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#7B7494', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 600 }}>Experience</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{talent.years_experience || 0}+ years</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#7B7494', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 600 }}>Availability</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{talent.availability === 'available' ? 'Available' : talent.availability === 'part_time' ? 'Part-time' : 'Unavailable'}</p>
              </div>
            </div>
          </div>

          {talent.bio && (
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid #E8E4F0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F0A1E' }}>About</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#3D3558', margin: 0, whiteSpace: 'pre-wrap' }}>{talent.bio}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
            {talent.hire_types?.length > 0 && (
              <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #E8E4F0' }}>
                <p style={{ fontSize: 12, color: '#7B7494', margin: '0 0 10px 0', textTransform: 'uppercase', fontWeight: 600 }}>Hire Types</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {talent.hire_types.map((type: string) => (
                    <span key={type} style={{ fontSize: 12, background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: 4, fontWeight: 500 }}>
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {talent.php_versions?.length > 0 && (
              <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #E8E4F0' }}>
                <p style={{ fontSize: 12, color: '#7B7494', margin: '0 0 10px 0', textTransform: 'uppercase', fontWeight: 600 }}>PHP Versions</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {talent.php_versions.map((version: string) => (
                    <span key={version} style={{ fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '4px 8px', borderRadius: 4, fontWeight: 500 }}>
                      {version}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(talent.portfolio_url || talent.github_url || talent.linkedin_url) && (
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid #E8E4F0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F0A1E' }}>Links</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {talent.portfolio_url && <a href={talent.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#7C3AED', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Portfolio</a>}
                {talent.github_url && <a href={talent.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#fff', color: '#3D3558', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, border: '1px solid #E8E4F0' }}>GitHub</a>}
                {talent.linkedin_url && <a href={talent.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#fff', color: '#3D3558', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, border: '1px solid #E8E4F0' }}>LinkedIn</a>}
              </div>
            </div>
          )}

          <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', padding: 40, borderRadius: 16, textAlign: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Interested in working with {talent?.full_name?.split(' ')?.[0] || 'this developer'}?
            </h2>
            <p style={{ fontSize: 14, marginBottom: 24, opacity: 0.9 }}>
              Post a PHP role and invite strong developers to apply.
            </p>
            <Link href="/post-job" style={{ padding: '12px 24px', background: '#fff', color: '#7C3AED', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>
              Post a Job
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
