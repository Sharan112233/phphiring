// src/components/CandidateCard.tsx
'use client'
import Link from 'next/link'
import { colors, spacing, typography, borderRadius, shadows, transitions } from '@/lib/design-system'

interface CandidateCardProps {
  id: string
  name: string
  headline?: string
  initials: string
  bgColor: string
  textColor: string
  skills?: string[]
  rate?: number
  location?: string
  link?: string
}

const specialtyColors = [
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#ECFDF5', text: '#064E3B' },
  { bg: '#FFF7ED', text: '#92400E' },
]

export default function CandidateCard({
  id,
  name,
  headline,
  initials,
  bgColor,
  textColor,
  skills = [],
  rate,
  location,
  link = `/talent/${id}`,
}: CandidateCardProps) {
  
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    background: colors.bgLightestPurple,
    border: `1.5px solid ${colors.borderLight}`,
    borderRadius: borderRadius.lg,
    textDecoration: 'none',
    color: colors.textPrimary,
    textAlign: 'center' as const,
    transition: `all ${transitions.normal}`,
    cursor: 'pointer',
  }

  return (
    <Link href={link} style={cardStyle as any}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.borderColor = colors.primary
        target.style.boxShadow = shadows.hover
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.borderColor = colors.borderLight
        target.style.boxShadow = 'none'
      }}
    >
      {/* Avatar Circle */}
      <div style={{
        width: 60,
        height: 60,
        borderRadius: borderRadius.lg,
        background: bgColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '18px',
      }}>
        {initials}
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: typography.label.fontSize,
        fontWeight: typography.h6.fontWeight,
        margin: 0,
        color: colors.textPrimary,
      }}>
        {name}
      </h3>

      {/* Headline - Optional */}
      {headline && (
        <p style={{
          fontSize: typography.labelSmall.fontSize,
          color: colors.textTertiary,
          margin: 0,
          maxWidth: '100%',
        }}>
          {headline}
        </p>
      )}

      {/* Location - Optional */}
      {location && (
        <p style={{
          fontSize: typography.labelSmall.fontSize,
          color: colors.textTertiary,
          margin: 0,
        }}>
          📍 {location}
        </p>
      )}

      {/* Rate - Optional */}
      {rate && (
        <p style={{
          fontSize: typography.label.fontSize,
          fontWeight: 600,
          color: colors.primary,
          margin: 0,
        }}>
          ${rate}/hr
        </p>
      )}

      {/* Skills - Optional */}
      {skills.length > 0 && (
        <div style={{
          display: 'flex',
          gap: spacing.sm,
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
        }}>
          {skills.slice(0, 3).map((skill, idx) => (
            <span
              key={skill}
              style={{
                fontSize: typography.labelTiny.fontSize,
                padding: `4px ${spacing.md}`,
                background: specialtyColors[idx % specialtyColors.length].bg,
                color: specialtyColors[idx % specialtyColors.length].text,
                borderRadius: borderRadius.md,
                fontWeight: 600,
              }}
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span style={{
              fontSize: typography.labelTiny.fontSize,
              padding: `4px ${spacing.md}`,
              background: colors.bgLight,
              color: colors.textTertiary,
              borderRadius: borderRadius.md,
              fontWeight: 600,
            }}>
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}