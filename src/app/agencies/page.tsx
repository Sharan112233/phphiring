'use client'
import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Link from 'next/link'

const STATIC_AGENCIES = [
  {
    id: '1',
    agency_name: 'TechScale India',
    tagline: 'Scalable PHP Solutions for Enterprises',
    bio: 'Specialized in Laravel and WordPress development with 15+ years of experience. Building scalable PHP solutions for startups and enterprises. We deliver custom web applications, e-commerce platforms, and CRM systems.',
    location_city: 'Bangalore',
    location_country: 'India',
    website_url: 'https://techscale.in',
    logo_url: 'https://via.placeholder.com/48/7C3AED/ffffff?text=TS',
    team_size_min: 5,
    team_size_max: 20,
    founded_year: 2009,
    min_project_usd: 5000,
    monthly_rate_usd: 15000,
    is_verified: true,
    is_featured: true,
    expertise: ['Laravel', 'WordPress', 'MySQL', 'Vue.js', 'REST API'],
    portfolio_url: 'https://techscale.in/portfolio',
    contact_email: 'contact@techscale.in',
    contact_phone: '+91-9876543210',
  },
  {
    id: '2',
    agency_name: 'FinStack Europe',
    tagline: 'Financial APIs & Secure Backend Systems',
    bio: 'European-based team specializing in financial software and secure APIs. Building robust, scalable backend systems with Symfony and microservices architecture. We handle payment integrations, banking APIs, and high-security applications.',
    location_city: 'Berlin',
    location_country: 'Germany',
    website_url: 'https://finstack.eu',
    logo_url: 'https://via.placeholder.com/48/1E40AF/ffffff?text=FS',
    team_size_min: 15,
    team_size_max: 25,
    founded_year: 2014,
    min_project_usd: 8000,
    monthly_rate_usd: 20000,
    is_verified: true,
    is_featured: true,
    expertise: ['Symfony', 'REST API', 'PostgreSQL', 'Docker', 'Microservices'],
    portfolio_url: 'https://finstack.eu/projects',
    contact_email: 'info@finstack.eu',
    contact_phone: '+49-30-12345678',
  },
]

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Use static agencies
    const filtered = STATIC_AGENCIES.filter(agency =>
      !search ||
      agency.agency_name.toLowerCase().includes(search.toLowerCase()) ||
      agency.location_city.toLowerCase().includes(search.toLowerCase()) ||
      agency.location_country.toLowerCase().includes(search.toLowerCase()) ||
      agency.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
    )
    setAgencies(filtered)
  }, [search])

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0A1E 0%, #1E1035 100%)',
        padding: '40px 0 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            PHP Development Agencies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>
            Vetted PHP development agencies ready to build your project
          </p>
          <input
            type="text"
            placeholder="Search agencies by name, location, expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* Main Container */}
      <div style={{ padding: '40px 24px', background: '#FAFAF9', minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Quick Links */}
          <div style={{ marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/jobs" style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #E8E4F0',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#7C3AED',
              fontWeight: 600,
              fontSize: 13,
            }}>
              💼 Browse Jobs
            </Link>
            <Link href="/browse" style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #E8E4F0',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#7C3AED',
              fontWeight: 600,
              fontSize: 13,
            }}>
              👥 Browse Talent
            </Link>
            <Link href="/post-job" style={{
              padding: '10px 20px',
              background: '#7C3AED',
              border: 'none',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}>
              📝 Post a Job
            </Link>
          </div>

          {/* Loading */}
          {loading && (
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
          )}

          {/* Agencies Grid */}
          {!loading && agencies.length > 0 && (
            <div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 24, fontWeight: 500 }}>
                Found <strong style={{ color: '#0F0A1E', fontSize: 16 }}>{agencies.length}</strong> PHP agencies
              </div>
              
              <div style={{
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))'
              }}>
                {agencies.map((agency) => (
                  <div
                    key={agency.id}
                    style={{
                      background: '#fff',
                      padding: '28px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(124,58,237,0.15)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.borderColor = '#C4B5FD'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                  >
                    {/* Agency Header */}
                    <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: '#EDE9FE',
                        color: '#5B21B6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {agency.agency_name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#0F0A1E' }}>
                          {agency.agency_name}
                        </h2>
                        <p style={{ fontSize: 12, color: '#7B7494', fontStyle: 'italic', marginBottom: 6 }}>
                          {agency.tagline}
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {agency.is_verified && (
                            <span style={{
                              fontSize: 10,
                              background: '#DBEAFE',
                              color: '#1E40AF',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontWeight: 600,
                            }}>
                              ✓ Verified
                            </span>
                          )}
                          {agency.is_featured && (
                            <span style={{
                              fontSize: 10,
                              background: '#FEF3C7',
                              color: '#D97706',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontWeight: 600,
                              border: '1px solid #FCD34D',
                            }}>
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: 1.6 }}>
                      {agency.bio}
                    </p>

                    {/* Expertise Tags */}
                    <div style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginBottom: 20,
                      paddingBottom: 20,
                      borderBottom: '1px solid #E8E4F0',
                    }}>
                      {agency.expertise.map((exp: string) => (
                        <span
                          key={exp}
                          style={{
                            fontSize: 11,
                            background: '#EDE9FE',
                            color: '#5B21B6',
                            padding: '5px 12px',
                            borderRadius: 14,
                            fontWeight: 500,
                            border: '1px solid #C4B5FD',
                          }}
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    {/* Location & Team Info */}
                    <div style={{ marginBottom: 20, fontSize: 13, color: '#666' }}>
                      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📍</span>
                        <span><strong>{agency.location_city}, {agency.location_country}</strong></span>
                      </div>
                      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>👥</span>
                        <span><strong>{agency.team_size_min}-{agency.team_size_max} developers</strong></span>
                      </div>
                      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📅</span>
                        <span><strong>Since {agency.founded_year}</strong></span>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div style={{ marginBottom: 20, fontSize: 13, color: '#666', paddingBottom: 20, borderBottom: '1px solid #E8E4F0' }}>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>💰</span>
                        <span>From <strong>${agency.min_project_usd.toLocaleString()}</strong> per project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📈</span>
                        <span><strong>${agency.monthly_rate_usd.toLocaleString()}</strong> monthly rate</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div style={{ marginBottom: 20, fontSize: 13, paddingBottom: 20, borderBottom: '1px solid #E8E4F0' }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#999' }}>📧 Email:</span>
                        <a href={`mailto:${agency.contact_email}`} style={{
                          color: '#7C3AED',
                          textDecoration: 'none',
                          fontWeight: 500,
                          marginLeft: 6,
                        }}>
                          {agency.contact_email}
                        </a>
                      </div>
                      <div>
                        <span style={{ color: '#999' }}>📞 Phone:</span>
                        <a href={`tel:${agency.contact_phone}`} style={{
                          color: '#7C3AED',
                          textDecoration: 'none',
                          fontWeight: 500,
                          marginLeft: 6,
                        }}>
                          {agency.contact_phone}
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <a
                        href={agency.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                          textDecoration: 'none',
                          textAlign: 'center',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#6D28D9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#7c3aed'
                        }}
                      >
                        🌐 Visit Website
                      </a>
                      <a
                        href={agency.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#f3f4f6',
                          border: '1.5px solid #E8E4F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                          textDecoration: 'none',
                          textAlign: 'center',
                          color: '#0F0A1E',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e5e7eb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f3f4f6'
                        }}
                      >
                        📄 Portfolio
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Agencies */}
          {!loading && agencies.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #E8E4F0',
            }}>
              <p style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🏢</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F0A1E' }}>
                No agencies found
              </h3>
              <p style={{ fontSize: 14, color: '#666' }}>
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}