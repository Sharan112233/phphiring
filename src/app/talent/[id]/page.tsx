'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'

export default function TalentDetailPage() {
  const { id } = useParams()
  const [talent, setTalent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchTalent = async () => {
      try {
        const res = await fetch(`/api/talent/${id}`)
        if (!res.ok) throw new Error('Talent not found')
        const data = await res.json()
        setTalent(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load talent profile')
      } finally {
        setLoading(false)
      }
    }

    fetchTalent()
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}>
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

  if (error || !talent) {
    return (
      <>
        <Navbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          flexDirection: 'column',
        }}>
          <p style={{ color: '#red', fontSize: 18, marginBottom: 16 }}>
            Error: {error || 'Talent not found'}
          </p>
          <Link
            href="/browse"
            style={{
              padding: '10px 20px',
              background: '#7C3AED',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to Find Talent
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return 'XX'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    if (!name) {
      return { bg: '#EDE9FE', tc: '#5B21B6' }
    }
    const colors = [
      { bg: '#EDE9FE', tc: '#5B21B6' },
      { bg: '#DBEAFE', tc: '#1E40AF' },
      { bg: '#D1FAE5', tc: '#065F46' },
      { bg: '#FEF3C7', tc: '#92400E' },
      { bg: '#FCE7F3', tc: '#9D174D' },
      { bg: '#ECFDF5', tc: '#064E3B' },
      { bg: '#FFF7ED', tc: '#7C2D12' },
    ]
    return colors[name.charCodeAt(0) % colors.length]
  }

  const colors = getAvatarColor(talent?.full_name || '')
  const initials = getInitials(talent?.full_name || 'XX')
  const isAgency = talent.type === 'agency'
  const rateLabel = isAgency
    ? `$${(talent.hourly_rate || talent.monthly_rate || 0) / 1000}k/mo`
    : `$${talent.hourly_rate || 0}/hr`

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          {/* Back Button */}
          <Link
            href="/browse"
            style={{
              display: 'inline-block',
              marginBottom: 24,
              color: '#7C3AED',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ← Back to Find Talent
          </Link>

          {/* Header Card */}
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            marginBottom: 24,
            border: '1px solid #E8E4F0',
          }}>
            {/* Top section - Avatar + Info + Rate */}
            <div style={{
              display: 'flex',
              gap: 24,
              alignItems: 'flex-start',
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: '1px solid #E8E4F0',
            }}>
              {/* Avatar */}
              <div style={{
                width: 120,
                height: 120,
                background: colors.bg,
                color: colors.tc,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                {/* Name + Badges */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}>
                  <h1 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    margin: 0,
                    color: '#0F0A1E',
                  }}>
                    {talent.full_name}
                  </h1>
                  {talent.verified && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: '#D1FAE5',
                      color: '#059669',
                    }}>
                      ✓ Verified
                    </span>
                  )}
                  {isAgency && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: '#DBEAFE',
                      color: '#1E40AF',
                    }}>
                      Agency
                    </span>
                  )}
                  {talent.featured && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: '#FEF3C7',
                      color: '#D97706',
                      border: '1px solid #FCD34D',
                    }}>
                      ★ Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <p style={{
                  fontSize: 16,
                  color: '#7B7494',
                  margin: '0 0 12px 0',
                  fontWeight: 500,
                }}>
                  {talent.title || 'PHP Developer'}
                </p>

                {/* Location & Languages */}
                <div style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  fontSize: 14,
                  color: '#7B7494',
                }}>
                  {talent.location && <span>📍 {talent.location}</span>}
                  {talent.languages && talent.languages.length > 0 && (
                    <span>🗣 {talent.languages.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Rate - Right Side */}
              <div style={{
                textAlign: 'right',
                flexShrink: 0,
              }}>
                <p style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#7C3AED',
                  margin: '0 0 4px 0',
                }}>
                  {rateLabel}
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: 0,
                }}>
                  {isAgency ? 'from/month' : 'per hour'}
                </p>
              </div>
            </div>

            {/* Skills Section - Right Below Header */}
            {talent.skills && talent.skills.length > 0 && (
              <div style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid #E8E4F0',
              }}>
                <div style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}>
                  {talent.skills.map((skill: string) => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-block',
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

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 20,
            }}>
              <div>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Rating
                </p>
                <p style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  ⭐ {(talent.rating || 0).toFixed(1)}
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '4px 0 0 0',
                }}>
                  ({talent.reviews_count || 0} reviews)
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Jobs Completed
                </p>
                <p style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {talent.total_jobs || 0}+
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Experience
                </p>
                <p style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {talent.years_experience || 0}+ years
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Type
                </p>
                <p style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {isAgency ? 'Agency' : 'Individual'}
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          {talent.bio && (
            <div style={{
              background: '#fff',
              padding: 24,
              borderRadius: 16,
              marginBottom: 24,
              border: '1px solid #E8E4F0',
            }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 16,
                color: '#0F0A1E',
              }}>
                About
              </h2>
              <p style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: '#3D3558',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {talent.bio}
              </p>
            </div>
          )}

          {/* Work Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {talent.hire_types && talent.hire_types.length > 0 && (
              <div style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #E8E4F0',
              }}>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 10px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Hire Types
                </p>
                <div style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}>
                  {talent.hire_types.map((type: string) => (
                    <span
                      key={type}
                      style={{
                        fontSize: 12,
                        background: '#DBEAFE',
                        color: '#1E40AF',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontWeight: 500,
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {talent.availability && (
              <div style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #E8E4F0',
              }}>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 10px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Availability
                </p>
                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  color: talent.availability === 'available' ? '#059669' : talent.availability === 'part_time' ? '#D97706' : '#9CA3AF',
                }}>
                  {talent.availability === 'available'
                    ? '● Available now'
                    : talent.availability === 'part_time'
                      ? '● Part-time'
                      : '● Unavailable'}
                </p>
              </div>
            )}

            {talent.php_versions && talent.php_versions.length > 0 && (
              <div style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #E8E4F0',
              }}>
                <p style={{
                  fontSize: 12,
                  color: '#7B7494',
                  margin: '0 0 10px 0',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  PHP Versions
                </p>
                <div style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}>
                  {talent.php_versions.map((ver: string) => (
                    <span
                      key={ver}
                      style={{
                        fontSize: 12,
                        background: '#D1FAE5',
                        color: '#065F46',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontWeight: 500,
                      }}
                    >
                      {ver}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Link */}
          {talent.portfolio_url && (
            <div style={{
              background: '#fff',
              padding: 24,
              borderRadius: 16,
              marginBottom: 24,
              border: '1px solid #E8E4F0',
            }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 16,
                color: '#0F0A1E',
              }}>
                Portfolio
              </h2>
              <a
                href={talent.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#7C3AED',
                  color: '#fff',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                View Portfolio →
              </a>
            </div>
          )}

          {/* Contact CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            padding: 40,
            borderRadius: 16,
            textAlign: 'center',
            color: '#fff',
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Interested in working with {talent?.full_name?.split(' ')?.[0] || 'them'}?
            </h2>
            <p style={{
              fontSize: 14,
              marginBottom: 24,
              opacity: 0.9,
            }}>
              Post a job or send a message to start collaborating
            </p>
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                href="/post-job"
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#7C3AED',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Post a Job
              </Link>
              <button
                onClick={() => alert('Contact feature coming soon!')}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}