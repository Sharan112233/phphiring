'use client'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import PageLoader from '@/components/ui/PageLoader'

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadAgencies = async () => {
      try {
        const res = await fetch('/api/agencies?limit=20')
        const data = await res.json()
        if (res.ok) setAgencies(data.agencies || [])
      } catch (error) {
        console.error('Failed to load agencies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgencies()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return agencies
    const q = search.toLowerCase()
    return agencies.filter((agency) =>
      agency.agency_name?.toLowerCase().includes(q) ||
      agency.tagline?.toLowerCase().includes(q) ||
      agency.bio?.toLowerCase().includes(q) ||
      agency.location_city?.toLowerCase().includes(q) ||
      agency.location_country?.toLowerCase().includes(q) ||
      (agency.skills || []).some((skill: string) => skill.toLowerCase().includes(q))
    )
  }, [agencies, search])

  return (
    <>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #0F0A1E 0%, #1E1035 100%)', padding: '48px 0 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 999, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(196,181,253,0.45)', color: '#D8B4FE', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              PHP Agency Partners
            </div>
            <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 800, margin: '0 0 10px 0' }}>
              Find agencies that build serious PHP products
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, margin: '0 0 22px 0', lineHeight: 1.7 }}>
              Explore PHP-focused agencies for Laravel, Symfony, WordPress, Magento, CRM systems, and backend delivery teams.
            </p>
            <input
              type="text"
              placeholder="Search by agency name, city, stack, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', maxWidth: 620, padding: '14px 18px', borderRadius: 12, border: 'none', fontSize: 14, outline: 'none', background: '#fff', color: '#0F0A1E' }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '36px 24px 60px', background: '#FAFAF9', minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/jobs" style={{ padding: '10px 18px', background: '#fff', border: '1px solid #E8E4F0', borderRadius: 10, textDecoration: 'none', color: '#7C3AED', fontWeight: 700, fontSize: 13 }}>
              Browse Jobs
            </Link>
            <Link href="/post-job" style={{ padding: '10px 18px', background: '#7C3AED', border: 'none', borderRadius: 10, textDecoration: 'none', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              Post a Job
            </Link>
          </div>

          {loading ? (
            <PageLoader label="Loading agencies..." minHeight="50vh" />
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #E8E4F0', borderRadius: 18, padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🏢</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: '#0F0A1E' }}>No agencies found</h3>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Try another search term to explore PHP delivery partners.</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 22, fontWeight: 500 }}>
                Showing <strong style={{ color: '#0F0A1E', fontSize: 16 }}>{filtered.length}</strong> PHP agencies
              </div>
              <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                {filtered.map((agency) => (
                  <div key={agency.id} style={{ background: '#fff', padding: 28, borderRadius: 18, border: '1px solid #E8E4F0', boxShadow: '0 8px 30px rgba(15,10,30,0.04)' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                      <div style={{ width: 58, height: 58, borderRadius: 14, background: '#EDE9FE', color: '#5B21B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
                        {agency.agency_name?.charAt(0) || 'A'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0', color: '#0F0A1E' }}>{agency.agency_name}</h2>
                        <p style={{ fontSize: 13, color: '#7B7494', fontStyle: 'italic', margin: '0 0 8px 0' }}>{agency.tagline}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {agency.is_verified && <span style={{ fontSize: 10, background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: 999, fontWeight: 700 }}>Verified</span>}
                          {agency.is_featured && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: 999, fontWeight: 700 }}>Featured</span>}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: '#5B556E', marginBottom: 18, lineHeight: 1.7 }}>{agency.bio}</p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                      {(agency.skills || []).slice(0, 6).map((skill: string) => (
                        <span key={skill} style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 999, background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                      <div style={{ background: '#FAFAF9', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 11, color: '#7B7494', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                        <div style={{ fontSize: 13, color: '#0F0A1E', fontWeight: 600 }}>{agency.location_city}, {agency.location_country}</div>
                      </div>
                      <div style={{ background: '#FAFAF9', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 11, color: '#7B7494', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Team Size</div>
                        <div style={{ fontSize: 13, color: '#0F0A1E', fontWeight: 600 }}>{agency.team_size_min}-{agency.team_size_max}</div>
                      </div>
                      <div style={{ background: '#FAFAF9', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 11, color: '#7B7494', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Monthly Rate</div>
                        <div style={{ fontSize: 13, color: '#0F0A1E', fontWeight: 600 }}>${agency.monthly_rate_usd || 0}</div>
                      </div>
                      <div style={{ background: '#FAFAF9', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 11, color: '#7B7494', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Projects</div>
                        <div style={{ fontSize: 13, color: '#0F0A1E', fontWeight: 600 }}>{agency.total_projects || 0} delivered</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12, color: '#7B7494' }}>
                        Founded {agency.founded_year || 'recently'} · {(agency.languages || []).join(', ')}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {agency.website_url && (
                          <a href={agency.website_url} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #E8E4F0', color: '#3D3558', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                            Website
                          </a>
                        )}
                        <Link href="/post-job" style={{ padding: '10px 14px', borderRadius: 10, background: '#7C3AED', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                          Hire Agency
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
