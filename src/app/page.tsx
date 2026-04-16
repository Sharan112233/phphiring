'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/jobs')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const popularSkills = ['Laravel', 'WordPress', 'Symfony', 'SugarCRM', 'Vtiger']

  return (
    <>
      <Navbar />
      <main>
        {/* ====== HERO SECTION (NEW) ====== */}
        <section style={{
          background: 'linear-gradient(135deg, #1a0f3f 0%, #2d1b4e 100%)',
          minHeight: '100vh',
          paddingTop: 60,
          paddingBottom: 60,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            {/* Badge */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid #7C3AED',
                borderRadius: 24,
                color: '#D8B4FE',
                fontSize: 12,
                fontWeight: 600,
              }}>
                💜 The PHP Talent Marketplace
              </div>
            </div>

            {/* Main Heading */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 16px 0',
                lineHeight: 1.2,
              }}>
                Find verified PHP experts<br />
                not just any developer
              </h1>
              <p style={{
                fontSize: 16,
                color: '#D1D5DB',
                margin: '0 0 32px 0',
                lineHeight: 1.6,
              }}>
                1,200+ developers and agencies filtered by framework, CRM, stack,<br />
                language and location. Every profile is PHP-first.
              </p>
            </div>

            {/* Search Section */}
            <div style={{
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: 16,
              padding: 32,
              marginBottom: 48,
              maxWidth: 800,
              margin: '0 auto 48px',
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: 24,
                marginBottom: 24,
                borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
                paddingBottom: 16,
              }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  paddingBottom: 8,
                  borderBottom: '2px solid #7C3AED',
                }}>
                  Find Talent
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  paddingBottom: 8,
                }}>
                  Find Jobs
                </button>
              </div>

              {/* Search Input */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 16,
              }}>
                <input
                  type="text"
                  placeholder="Search Laravel, SugarCRM, Symfony, WooCommerce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    padding: '14px 32px',
                    background: '#7C3AED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#6D28D9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#7C3AED'
                  }}
                >
                  Search →
                </button>
              </div>

              {/* Popular Tags */}
              <div>
                <p style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Popular:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {popularSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSearchQuery(skill)
                        router.push(`/jobs?q=${encodeURIComponent(skill)}`)
                      }}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(124, 58, 237, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        color: '#D8B4FE',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)'
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 32,
              textAlign: 'center',
              marginBottom: 60,
            }}>
              <div>
                <p style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px 0',
                }}>
                  1,240+
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  PHP Experts
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px 0',
                }}>
                  86
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Agencies
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px 0',
                }}>
                  4,800+
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Jobs Filled
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px 0',
                }}>
                  34
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Countries
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                href="/jobs"
                style={{
                  padding: '14px 32px',
                  background: '#7C3AED',
                  color: '#fff',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#6D28D9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#7C3AED'
                }}
              >
                Find Jobs →
              </Link>
              <Link
                href="/browse"
                style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #7C3AED',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Find Talent →
              </Link>
            </div>
          </div>
        </section>

        {/* ====== FEATURES SECTION (NEW) ====== */}
        <section style={{
          background: '#fff',
          padding: '60px 24px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
            }}>
              <div>
                <div style={{
                  fontSize: 40,
                  marginBottom: 16,
                }}>
                  👥
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#0F0A1E',
                }}>
                  Verified Experts
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.6,
                }}>
                  Every profile is verified and PHP-focused. No generalists here.
                </p>
              </div>
              <div>
                <div style={{
                  fontSize: 40,
                  marginBottom: 16,
                }}>
                  🎯
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#0F0A1E',
                }}>
                  Skill Matching
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.6,
                }}>
                  Filter by framework, CRM, stack, and technology. Find exactly what you need.
                </p>
              </div>
              <div>
                <div style={{
                  fontSize: 40,
                  marginBottom: 16,
                }}>
                  ⚡
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#0F0A1E',
                }}>
                  Quick Hiring
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.6,
                }}>
                  Post a job and connect with qualified PHP experts instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====== KEEP ALL YOUR EXISTING CONTENT BELOW ====== */}
        {/* Add your existing page content here - testimonials, call-to-action sections, etc. */}

      </main>
      <Footer />
    </>
  )
}