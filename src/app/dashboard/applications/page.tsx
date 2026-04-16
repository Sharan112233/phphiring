'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('phphire_user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setUser(JSON.parse(userStr))
    fetchApplications()
  }, [router])

  const fetchApplications = async () => {
    try {
      const userStr = localStorage.getItem('phphire_user')
      if (!userStr) return

      const userData = JSON.parse(userStr)
      const res = await fetch(`/api/applications?user_id=${userData.id}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter applications by status
  const filtered = applications.filter(app => {
    if (filter === 'all') return true
    if (filter === 'pending') return app.status === 'pending'
    if (filter === 'shortlisted') return app.status === 'shortlisted'
    if (filter === 'selected') return app.status === 'selected'
    if (filter === 'not_selected') return app.status === 'rejected'
    return true
  })

  // Count by status
  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    selected: applications.filter(a => a.status === 'selected').length,
    not_selected: applications.filter(a => a.status === 'rejected').length,
  }

  const getStatusColor = (status: string) => {
    if (status === 'selected') return { bg: '#D1FAE5', color: '#059669', label: 'Selected' }
    if (status === 'shortlisted') return { bg: '#FEF3C7', color: '#D97706', label: 'Shortlisted' }
    if (status === 'pending') return { bg: '#F3F4F6', color: '#6B7280', label: 'Pending' }
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#DC2626', label: 'Not Selected' }
    return { bg: '#F3F4F6', color: '#6B7280', label: 'Pending' }
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return `${Math.floor(diff / 604800)}w ago`
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAF9', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
          }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, margin: 0 }}>
                My Applications
              </h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                Track all your PHP job applications
              </p>
            </div>
            <Link
              href="/dashboard"
              style={{
                padding: '10px 20px',
                background: '#fff',
                border: '1px solid #E8E4F0',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#666',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Dashboard
            </Link>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: 24,
            borderBottom: '1px solid #E8E4F0',
            marginBottom: 24,
          }}>
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
              { key: 'selected', label: 'Selected', count: counts.selected },
              { key: 'not_selected', label: 'Not Selected', count: counts.not_selected },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === tab.key ? '2px solid #7C3AED' : 'none',
                  color: filter === tab.key ? '#7C3AED' : '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: filter === tab.key ? 600 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label} {tab.count}
              </button>
            ))}
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

          {/* Applications List */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(app => {
                const statusInfo = getStatusColor(app.status)
                return (
                  <div
                    key={app.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #E8E4F0',
                      borderRadius: 12,
                      padding: 24,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 4,
                        }}>
                          <h3 style={{
                            fontSize: 16,
                            fontWeight: 700,
                            margin: 0,
                            color: '#0F0A1E',
                          }}>
                            {app.job?.title || 'Job Title'}
                          </h3>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 4,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <p style={{
                          fontSize: 13,
                          color: '#666',
                          margin: '0 0 8px 0',
                        }}>
                          {app.job?.company_name || 'Company'} · {app.job?.hire_type || 'Type'} · {app.job?.budget_min || '$'}-{app.job?.budget_max || '$'}{app.job?.budget_type === 'hourly' ? '/hr' : '/mo'}
                        </p>

                        <div style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                          marginBottom: 10,
                        }}>
                          {(app.job?.required_skills || []).slice(0, 5).map((skill: string) => (
                            <span
                              key={skill}
                              style={{
                                fontSize: 11,
                                background: '#EDE9FE',
                                color: '#5B21B6',
                                padding: '4px 10px',
                                borderRadius: 4,
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {app.cover_note && (
                          <div style={{
                            background: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            borderLeft: '4px solid #7C3AED',
                            padding: 12,
                            borderRadius: 6,
                            marginTop: 12,
                          }}>
                            <p style={{
                              fontSize: 11,
                              color: '#666',
                              margin: '0 0 6px 0',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}>
                              Cover Note
                            </p>
                            <p style={{
                              fontSize: 13,
                              color: '#3D3558',
                              margin: 0,
                              lineHeight: 1.5,
                            }}>
                              {app.cover_note}
                            </p>
                          </div>
                        )}
                      </div>

                      <div style={{
                        textAlign: 'right',
                        flexShrink: 0,
                        marginLeft: 16,
                        minWidth: 120,
                      }}>
                        <p style={{
                          fontSize: 12,
                          color: '#999',
                          margin: '0 0 12px 0',
                        }}>
                          {timeAgo(app.created_at)}
                        </p>
                        <span style={{
                          display: 'inline-block',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E8E4F0',
            }}>
              <p style={{ fontSize: 48, margin: '0 0 12px 0' }}>📝</p>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                margin: '0 0 8px 0',
              }}>
                No applications yet
              </h3>
              <p style={{
                fontSize: 14,
                color: '#666',
                margin: '0 0 16px 0',
              }}>
                {filter === 'all'
                  ? 'Start applying to PHP jobs to see them here'
                  : `No applications with ${filter} status yet`}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '10px 20px',
                    background: '#7C3AED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  View All Applications
                </button>
              )}
              {filter === 'all' && (
                <Link
                  href="/browse"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#7C3AED',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  Browse Jobs
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}