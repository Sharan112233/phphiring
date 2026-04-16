// src/app/dashboard/profile/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { colors, spacing, typography, borderRadius } from '@/lib/design-system'

const AVAILABLE_SKILLS = [
  'Laravel',
  'WordPress',
  'Symfony',
  'PHP',
  'React',
  'Vue.js',
  'MySQL',
  'PostgreSQL',
  'REST API',
  'WooCommerce',
  'SugarCRM',
  'Drupal',
  'Magento',
  'Node.js',
  'Docker',
  'AWS',
  'Azure',
  'Git',
  'JavaScript',
  'Python',
  'MongoDB',
  'Redis',
  'CI/CD',
  'Kubernetes',
]

interface ProfileData {
  headline?: string
  bio?: string
  skills?: string[]
  languages?: string[]
  hourly_rate_usd?: number
  availability?: string
  portfolio_url?: string
  github_url?: string
  linkedin_url?: string
  location_city?: string
  location_country?: string
  certifications?: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Form fields
  const [formData, setFormData] = useState<ProfileData>({
    headline: '',
    bio: '',
    skills: [],
    languages: [],
    hourly_rate_usd: 0,
    availability: 'available',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    location_city: '',
    location_country: '',
    certifications: [],
  })

  // Load user data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('phphire_user')
        if (!storedUser) {
          router.push('/auth/login')
          return
        }

        const userData = JSON.parse(storedUser)
        setUser(userData)

        // Fetch profile from API
        const res = await fetch(`/api/users/${userData.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setFormData(data.profile)
            setSelectedSkills(data.profile.skills || [])
          }
        } else if (res.status !== 404) {
          setError('Failed to load profile')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]

    setSelectedSkills(newSkills)
    setFormData(prev => ({
      ...prev,
      skills: newSkills,
    }))
  }

  const handleSave = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: selectedSkills,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess('Profile saved successfully!')
        setFormData(data.profile)
        setTimeout(() => setSuccess(''), 3000)
      } else if (res.status === 404) {
        setError('User profile not found')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save profile')
      }
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: spacing.section, textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: colors.bgLight }}>
        {/* Header */}
        <section style={{
          background: colors.bgLight,
          padding: `${spacing.lg} ${spacing.lg}`,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{
              fontSize: typography.h2.fontSize,
              fontWeight: typography.h2.fontWeight,
              margin: `0 0 ${spacing.md} 0`,
              color: colors.textPrimary,
            }}>
              Edit Profile
            </h1>
            <p style={{
              fontSize: typography.bodyLarge.fontSize,
              color: colors.textTertiary,
              margin: 0,
            }}>
              Update your professional information
            </p>
          </div>
        </section>

        {/* Content */}
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: spacing.section,
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              padding: spacing.lg,
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: borderRadius.md,
              marginBottom: spacing.lg,
              fontSize: typography.body.fontSize,
            }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: spacing.lg,
              background: '#DCFCE7',
              color: '#166534',
              borderRadius: borderRadius.md,
              marginBottom: spacing.lg,
              fontSize: typography.body.fontSize,
            }}>
              {success}
            </div>
          )}

          {/* Profile Form */}
          <div style={{
            background: colors.bgWhite,
            border: `1.5px solid ${colors.borderLight}`,
            borderRadius: borderRadius.lg,
            padding: spacing.section,
            marginBottom: spacing.section,
          }}>
            {/* Headline */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}>
                Professional Headline
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Laravel Developer"
                value={formData.headline || ''}
                onChange={e => handleInputChange('headline', e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.lg,
                  border: `1.5px solid ${colors.borderLight}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.body.fontSize,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}>
                Bio
              </label>
              <textarea
                placeholder="Tell us about your experience and expertise..."
                value={formData.bio || ''}
                onChange={e => handleInputChange('bio', e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: spacing.lg,
                  border: `1.5px solid ${colors.borderLight}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.body.fontSize,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Location */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.label.fontSize,
                  fontWeight: 600,
                  marginBottom: spacing.md,
                  color: colors.textPrimary,
                }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hyderabad"
                  value={formData.location_city || ''}
                  onChange={e => handleInputChange('location_city', e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.lg,
                    border: `1.5px solid ${colors.borderLight}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.body.fontSize,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.label.fontSize,
                  fontWeight: 600,
                  marginBottom: spacing.md,
                  color: colors.textPrimary,
                }}>
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., India"
                  value={formData.location_country || ''}
                  onChange={e => handleInputChange('location_country', e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.lg,
                    border: `1.5px solid ${colors.borderLight}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.body.fontSize,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Hourly Rate */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}>
                Hourly Rate (USD)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <span style={{ fontSize: typography.bodyLarge.fontSize }}>$</span>
                <input
                  type="number"
                  placeholder="45"
                  value={formData.hourly_rate_usd || ''}
                  onChange={e => handleInputChange('hourly_rate_usd', parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    padding: spacing.lg,
                    border: `1.5px solid ${colors.borderLight}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.body.fontSize,
                    fontFamily: 'inherit',
                  }}
                />
                <span style={{ fontSize: typography.bodyLarge.fontSize }}>/hour</span>
              </div>
            </div>

            {/* Availability */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}>
                Availability
              </label>
              <select
                value={formData.availability || 'available'}
                onChange={e => handleInputChange('availability', e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.lg,
                  border: `1.5px solid ${colors.borderLight}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.body.fontSize,
                  fontFamily: 'inherit',
                  background: colors.bgWhite,
                }}
              >
                <option value="available">Available Now</option>
                <option value="part_time">Part-time</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Skills Selection */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}>
                Skills ({selectedSkills.length} selected)
              </label>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div style={{
                  marginBottom: spacing.lg,
                  padding: spacing.lg,
                  background: colors.primaryLighter,
                  borderRadius: borderRadius.md,
                }}>
                  <div style={{
                    display: 'flex',
                    gap: spacing.md,
                    flexWrap: 'wrap',
                  }}>
                    {selectedSkills.map(skill => (
                      <div
                        key={skill}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: spacing.sm,
                          padding: `${spacing.sm} ${spacing.md}`,
                          background: colors.bgWhite,
                          color: colors.primary,
                          borderRadius: borderRadius.md,
                          fontSize: typography.label.fontSize,
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillToggle(skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: colors.primary,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Checkboxes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: spacing.md,
              }}>
                {AVAILABLE_SKILLS.map(skill => (
                  <label
                    key={skill}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: spacing.md,
                      background: selectedSkills.includes(skill)
                        ? colors.primaryLighter
                        : colors.bgLight,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: colors.primary,
                      }}
                    />
                    <span style={{
                      fontSize: typography.label.fontSize,
                      color: selectedSkills.includes(skill)
                        ? colors.primary
                        : colors.textSecondary,
                      fontWeight: selectedSkills.includes(skill) ? 600 : 500,
                    }}>
                      {skill}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div style={{
              paddingTop: spacing.lg,
              borderTop: `1px solid ${colors.borderLight}`,
              marginTop: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              <h3 style={{
                fontSize: typography.h5.fontSize,
                fontWeight: typography.h5.fontWeight,
                margin: `0 0 ${spacing.lg} 0`,
                color: colors.textPrimary,
              }}>
                Social Links
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: typography.label.fontSize,
                    fontWeight: 600,
                    marginBottom: spacing.md,
                    color: colors.textPrimary,
                  }}>
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio_url || ''}
                    onChange={e => handleInputChange('portfolio_url', e.target.value)}
                    style={{
                      width: '100%',
                      padding: spacing.lg,
                      border: `1.5px solid ${colors.borderLight}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: typography.label.fontSize,
                    fontWeight: 600,
                    marginBottom: spacing.md,
                    color: colors.textPrimary,
                  }}>
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourname"
                    value={formData.github_url || ''}
                    onChange={e => handleInputChange('github_url', e.target.value)}
                    style={{
                      width: '100%',
                      padding: spacing.lg,
                      border: `1.5px solid ${colors.borderLight}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / 2' }}>
                  <label style={{
                    display: 'block',
                    fontSize: typography.label.fontSize,
                    fontWeight: 600,
                    marginBottom: spacing.md,
                    color: colors.textPrimary,
                  }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.linkedin_url || ''}
                    onChange={e => handleInputChange('linkedin_url', e.target.value)}
                    style={{
                      width: '100%',
                      padding: spacing.lg,
                      border: `1.5px solid ${colors.borderLight}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: spacing.lg,
                background: colors.primary,
                color: colors.textWhite,
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.label.fontSize,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}