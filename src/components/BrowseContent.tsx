// src/components/BrowseContent.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface Talent {
  id: string
  full_name: string
  initials: string
  avatarBg: string
  avatarTc: string
  headline: string
  location_city: string
  location_country: string
  hourly_rate_usd: number
  php_years?: number
  avg_rating?: number
  total_reviews?: number
  total_jobs?: number
  availability: string
  hire_types?: string[]
  is_verified?: boolean
  is_featured?: boolean
  languages: string[]
  skills: string[]
  php_versions?: string[]
  type: 'individual' | 'agency'
  monthly_rate?: number
}

const FRAMEWORKS = ['Laravel', 'Symfony', 'CodeIgniter', 'Yii2', 'CakePHP', 'Slim', 'Zend', 'Phalcon']
const CMS_ECOM = ['WordPress', 'WooCommerce', 'Drupal', 'Joomla', 'Magento', 'PrestaShop', 'OpenCart']
const CRMS = ['SugarCRM', 'SuiteCRM', 'Vtiger', 'Dolibarr', 'Odoo', 'EspoCRM', 'CiviCRM']
const COMBINED = ['MySQL', 'PostgreSQL', 'Redis', 'React', 'Vue.js', 'REST API', 'GraphQL', 'Docker']
const PHP_VERSIONS = ['PHP 8.3', 'PHP 8.2', 'PHP 8.1', 'PHP 8.0', 'PHP 7.4']
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Polish', 'Portuguese']
const QUICK_FILTERS = [
  'All', 'Laravel', 'WordPress', 'Symfony', 'SugarCRM',
  'Vtiger', 'WooCommerce', 'Magento', 'Drupal', 'Available now', 'Top rated',
]

export default function BrowseContent() {
  const router = useRouter()
  
  const [allTalent, setAllTalent] = useState<Talent[]>([])
  const [filteredTalent, setFilteredTalent] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState('Best match')

  const [selFrameworks, setSelFrameworks] = useState<string[]>([])
  const [selCMS, setSelCMS] = useState<string[]>([])
  const [selCRMs, setSelCRMs] = useState<string[]>([])
  const [selCombined, setSelCombined] = useState<string[]>([])
  const [selVersions, setSelVersions] = useState<string[]>([])
  const [selLanguages, setSelLanguages] = useState<string[]>([])
  const [selType, setSelType] = useState('All')
  const [selAvail, setSelAvail] = useState('All')
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [minRating, setMinRating] = useState('')

  // Load talent from API
  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/talent')
        if (res.ok) {
          const data = await res.json()
          setAllTalent(data.talent || [])
          setFilteredTalent(data.talent || [])
        }
      } catch (err) {
        console.error('Error fetching talent:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTalent()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...allTalent]

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t => {
        const match =
          t.full_name.toLowerCase().includes(q) ||
          t.headline.toLowerCase().includes(q) ||
          t.skills.some(s => s.toLowerCase().includes(q)) ||
          t.location_city.toLowerCase().includes(q)
        return match
      })
    }

    if (quickFilter !== 'All') {
      if (quickFilter === 'Available now') {
        filtered = filtered.filter(t => t.availability === 'available')
      } else if (quickFilter === 'Top rated') {
        filtered = filtered.filter(t => (t.avg_rating || 0) >= 4.8)
      } else {
        filtered = filtered.filter(t =>
          t.skills.some(s => s.toLowerCase() === quickFilter.toLowerCase())
        )
      }
    }

    const allSelected = [
      ...selFrameworks, ...selCMS, ...selCRMs,
      ...selCombined, ...selVersions,
    ]
    if (allSelected.length > 0) {
      filtered = filtered.filter(t => {
        return allSelected.some(sel =>
          t.skills.some(s => s.toLowerCase() === sel.toLowerCase()) ||
          (t.php_versions?.some(v => v.toLowerCase() === sel.toLowerCase()) || false)
        )
      })
    }

    if (selLanguages.length > 0) {
      filtered = filtered.filter(t =>
        selLanguages.some(l => t.languages.includes(l))
      )
    }

    if (selType !== 'All') {
      filtered = filtered.filter(t => t.type === selType)
    }

    if (selAvail !== 'All') {
      filtered = filtered.filter(t => t.availability === selAvail)
    }

    if (minRate) {
      filtered = filtered.filter(t => t.hourly_rate_usd >= parseInt(minRate))
    }
    if (maxRate) {
      filtered = filtered.filter(t => t.hourly_rate_usd <= parseInt(maxRate))
    }

    if (minRating) {
      filtered = filtered.filter(t => (t.avg_rating || 0) >= parseFloat(minRating))
    }

    if (sortBy === 'Highest rated') {
      filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    } else if (sortBy === 'Most reviews') {
      filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
    } else if (sortBy === 'Lowest rate') {
      filtered.sort((a, b) => a.hourly_rate_usd - b.hourly_rate_usd)
    } else if (sortBy === 'Highest rate') {
      filtered.sort((a, b) => b.hourly_rate_usd - a.hourly_rate_usd)
    } else if (sortBy === 'Most experience') {
      filtered.sort((a, b) => (b.php_years || 0) - (a.php_years || 0))
    }

    setFilteredTalent(filtered)
  }, [allTalent, search, quickFilter, selFrameworks, selCMS, selCRMs, selCombined, selVersions, selLanguages, selType, selAvail, minRate, maxRate, minRating, sortBy])

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])
  }

  const clearAll = () => {
    setSelFrameworks([])
    setSelCMS([])
    setSelCRMs([])
    setSelCombined([])
    setSelVersions([])
    setSelLanguages([])
    setSelType('All')
    setSelAvail('All')
    setMinRate('')
    setMaxRate('')
    setMinRating('')
    setSearch('')
    setQuickFilter('All')
  }

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: active ? 600 : 400,
    padding: '4px 10px',
    borderRadius: 20,
    border: '1.5px solid',
    borderColor: active ? '#7C3AED' : '#E8E4F0',
    background: active ? '#EDE9FE' : '#fff',
    color: active ? '#5B21B6' : '#3D3558',
    cursor: 'pointer',
    transition: 'all 0.12s',
  })

  function TalentCard({ t }: { t: Talent }) {
    const isAgency = t.type === 'agency'
    const rateLabel = isAgency
      ? `$${(t.hourly_rate_usd / 1000).toFixed(0)}k/mo`
      : `$${t.hourly_rate_usd}/hr`

    const availColor =
      t.availability === 'available' ? '#059669' :
        t.availability === 'part_time' ? '#D97706' : '#9CA3AF'

    const availLabel =
      t.availability === 'available' ? 'Available now' :
        t.availability === 'part_time' ? 'Part-time' : 'Unavailable'

    return (
      <Link
        href={`/talent/${t.id}`}
        style={{
          background: '#fff',
          border: '1px solid #E8E4F0',
          borderRadius: 16,
          padding: '18px 20px',
          textDecoration: 'none',
          display: 'block',
          transition: 'all 0.15s',
          marginBottom: 10,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = '#C4B5FD'
          el.style.boxShadow = '0 4px 16px rgba(91,33,182,0.07)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = '#E8E4F0'
          el.style.boxShadow = 'none'
          el.style.transform = 'translateY(0)'
        }}
      >
        <div style={{
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
          marginBottom: 10,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: t.avatarBg,
            color: t.avatarTc,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            fontWeight: 800,
            flexShrink: 0,
          }}>
            {t.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              marginBottom: 3,
            }}>
              <span style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#0F0A1E',
              }}>
                {t.full_name}
              </span>
              {t.is_verified && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 20,
                  background: '#D1FAE5',
                  color: '#059669',
                }}>
                  Verified
                </span>
              )}
              {t.type === 'agency' && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 20,
                  background: '#DBEAFE',
                  color: '#1E40AF',
                }}>
                  Agency
                </span>
              )}
              {t.is_featured && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 20,
                  background: '#FEF3C7',
                  color: '#D97706',
                  border: '1px solid #FCD34D',
                }}>
                  Featured
                </span>
              )}
            </div>
            <div style={{
              fontSize: 13,
              color: '#7B7494',
              lineHeight: 1.4,
            }}>
              {t.headline}
            </div>
          </div>

          <div style={{
            textAlign: 'right',
            flexShrink: 0,
            marginLeft: 8,
          }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#7C3AED',
              lineHeight: 1,
            }}>
              {rateLabel}
            </div>
            <div style={{
              fontSize: 11,
              color: '#7B7494',
              marginTop: 3,
            }}>
              {isAgency ? 'from/month' : 'per hour'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}>
          {t.skills.slice(0, 5).map(s => (
            <span key={s} style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: 20,
              background: '#EDE9FE',
              color: '#5B21B6',
              border: '1px solid #C4B5FD',
            }}>
              {s}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 12,
          color: '#7B7494',
        }}>
          <span>⭐ {t.avg_rating || 'N/A'} ({t.total_reviews || 0} reviews)</span>
          <span>💼 {t.total_jobs || 0}+ jobs</span>
          <span>📍 {t.location_city}, {t.location_country}</span>
          <span>🗣 {t.languages.slice(0, 2).join(', ')}</span>
          <span style={{ color: availColor, fontWeight: 600 }}>
            ● {availLabel}
          </span>
        </div>
      </Link>
    )
  }

  function GridCard({ t }: { t: Talent }) {
    const isAgency = t.type === 'agency'
    const rateLabel = isAgency
      ? `$${(t.hourly_rate_usd / 1000).toFixed(0)}k/mo`
      : `$${t.hourly_rate_usd}/hr`

    return (
      <Link
        href={`/talent/${t.id}`}
        style={{
          background: '#fff',
          border: '1px solid #E8E4F0',
          borderRadius: 16,
          padding: '18px 16px',
          textDecoration: 'none',
          display: 'block',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = '#C4B5FD'
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 4px 12px rgba(91,33,182,0.08)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = '#E8E4F0'
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: t.avatarBg,
            color: t.avatarTc,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 19,
            fontWeight: 800,
          }}>
            {t.initials}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#7C3AED',
            }}>
              {rateLabel}
            </div>
            {t.is_featured && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 20,
                background: '#FEF3C7',
                color: '#D97706',
                display: 'inline-block',
                marginTop: 3,
                border: '1px solid #FCD34D',
              }}>
                Featured
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap',
          marginBottom: 3,
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#0F0A1E',
          }}>
            {t.full_name}
          </span>
          {t.is_verified && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 20,
              background: '#D1FAE5',
              color: '#059669',
            }}>
              Verified
            </span>
          )}
          {t.type === 'agency' && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 20,
              background: '#DBEAFE',
              color: '#1E40AF',
            }}>
              Agency
            </span>
          )}
        </div>

        <div style={{
          fontSize: 12,
          color: '#7B7494',
          marginBottom: 10,
          lineHeight: 1.4,
        }}>
          {t.headline}
        </div>

        <div style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}>
          {t.skills.slice(0, 3).map(s => (
            <span key={s} style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 20,
              background: '#EDE9FE',
              color: '#5B21B6',
              border: '1px solid #C4B5FD',
            }}>
              {s}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#7B7494',
          paddingTop: 10,
          borderTop: '1px solid #E8E4F0',
        }}>
          <span>⭐ {t.avg_rating || 'N/A'} ({t.total_reviews || 0})</span>
          <span>📍 {t.location_city}</span>
        </div>
      </Link>
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p>Loading talent...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E8E4F0',
        padding: '10px 0',
        position: 'sticky',
        top: 64,
        zIndex: 90,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: 7,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7B7494', fontWeight: 500, marginRight: 4 }}>
            Quick:
          </span>
          {QUICK_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setQuickFilter(f)}
              style={{
                fontSize: 12,
                fontWeight: quickFilter === f ? 700 : 500,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1.5px solid',
                borderColor: quickFilter === f ? '#7C3AED' : '#E8E4F0',
                background: quickFilter === f ? '#7C3AED' : '#fff',
                color: quickFilter === f ? '#fff' : '#3D3558',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        {/* Sidebar */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8E4F0',
          borderRadius: 16,
          padding: 20,
          position: 'sticky',
          top: 120,
          height: 'fit-content',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0A1E' }}>
              Filters
            </span>
            <button
              onClick={clearAll}
              style={{
                fontSize: 12,
                color: '#7C3AED',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Clear all
            </button>
          </div>

          <input
            type="text"
            placeholder="Search name, skill, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1.5px solid #E8E4F0',
              borderRadius: 10,
              fontSize: 13,
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />

          {/* Type */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7B7494',
              marginBottom: 8,
            }}>
              Type
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'individual', 'agency'].map((t: string) => (
                <button
                  key={t}
                  onClick={() => setSelType(t)}
                  style={{...filterBtnStyle(selType === t)}}
                >
                  {t === 'individual' ? 'Developer' : t === 'agency' ? 'Agency' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7B7494',
              marginBottom: 8,
            }}>
              Availability
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'available', 'part_time', 'unavailable'].map((a: string) => (
                <button
                  key={a}
                  onClick={() => setSelAvail(a)}
                  style={{...filterBtnStyle(selAvail === a)}}
                >
                  {a === 'All' ? 'All' : a === 'available' ? 'Available' : a === 'part_time' ? 'Part-time' : 'Unavailable'}
                </button>
              ))}
            </div>
          </div>

          {/* Rate range */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7B7494',
              marginBottom: 8,
            }}>
              Hourly Rate (USD)
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={minRate}
                onChange={e => setMinRate(e.target.value)}
                style={{
                  width: '50%',
                  padding: '7px 10px',
                  border: '1.5px solid #E8E4F0',
                  borderRadius: 8,
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ color: '#7B7494', fontSize: 12 }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxRate}
                onChange={e => setMaxRate(e.target.value)}
                style={{
                  width: '50%',
                  padding: '7px 10px',
                  border: '1.5px solid #E8E4F0',
                  borderRadius: 8,
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Min rating */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7B7494',
              marginBottom: 8,
            }}>
              Min Rating
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['', '4.0', '4.5', '4.8'].map((r: string) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  style={{...filterBtnStyle(minRating === r)}}
                >
                  {r === '' ? 'Any' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Filter sections with inline buttons */}
          {[
            { label: 'Frameworks', items: FRAMEWORKS, state: selFrameworks, setter: setSelFrameworks },
            { label: 'CMS / E-Commerce', items: CMS_ECOM, state: selCMS, setter: setSelCMS },
            { label: 'PHP CRMs', items: CRMS, state: selCRMs, setter: setSelCRMs },
            { label: 'Combined Skills', items: COMBINED, state: selCombined, setter: setSelCombined },
            { label: 'PHP Version', items: PHP_VERSIONS, state: selVersions, setter: setSelVersions },
            { label: 'Language', items: LANGUAGES, state: selLanguages, setter: setSelLanguages },
          ].map((section) => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#7B7494',
                marginBottom: 8,
              }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {section.items.map((item: string) => {
                  const isActive = section.state.includes(item)
                  return (
                    <button
                      key={item}
                      onClick={() => toggle(section.state, section.setter, item)}
                      style={{
                        fontSize: 11,
                        fontWeight: isActive ? 600 : 400,
                        padding: '3px 9px',
                        borderRadius: 20,
                        border: '1.5px solid',
                        borderColor: isActive ? '#7C3AED' : '#E8E4F0',
                        background: isActive ? '#EDE9FE' : '#fff',
                        color: isActive ? '#5B21B6' : '#3D3558',
                        cursor: 'pointer',
                      }}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Main results */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 10,
          }}>
            <div style={{ fontSize: 14, color: '#3D3558' }}>
              <strong style={{ fontSize: 16, color: '#0F0A1E' }}>
                {filteredTalent.length}
              </strong>{' '}
              PHP experts found
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                border: '1.5px solid #E8E4F0',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 10px',
                    background: viewMode === 'list' ? '#EDE9FE' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: viewMode === 'list' ? '#5B21B6' : '#7B7494',
                  }}
                >
                  ☰
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 10px',
                    background: viewMode === 'grid' ? '#EDE9FE' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: viewMode === 'grid' ? '#5B21B6' : '#7B7494',
                  }}
                >
                  ⊞
                </button>
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  fontSize: 13,
                  padding: '7px 12px',
                  border: '1.5px solid #E8E4F0',
                  borderRadius: 8,
                  background: '#fff',
                  outline: 'none',
                  cursor: 'pointer',
                  color: '#0F0A1E',
                }}
              >
                {['Best match', 'Highest rated', 'Most reviews', 'Lowest rate', 'Highest rate', 'Most experience'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredTalent.length === 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid #E8E4F0',
              borderRadius: 16,
              padding: '60px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.35 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No talent found</h3>
              <p style={{ fontSize: 14, color: '#7B7494', marginBottom: 16 }}>Try changing your filters or search term</p>
              <button
                onClick={clearAll}
                style={{
                  padding: '9px 20px',
                  background: '#7C3AED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div>
              {filteredTalent.map(t => <TalentCard key={t.id} t={t} />)}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}>
              {filteredTalent.map(t => <GridCard key={t.id} t={t} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}