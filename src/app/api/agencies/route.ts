import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const FALLBACK_AGENCIES = [
  {
    id: 'seed-agency-1',
    agency_name: 'TechScale India',
    tagline: 'Laravel, WordPress and product engineering teams on demand',
    bio: 'A PHP-first delivery agency helping startups and enterprises build Laravel platforms, WordPress systems, internal dashboards and custom APIs.',
    location_city: 'Bangalore',
    location_country: 'India',
    website_url: 'https://example.com/techscale',
    logo_url: null,
    team_size_min: 8,
    team_size_max: 25,
    founded_year: 2015,
    min_project_usd: 5000,
    monthly_rate_usd: 12000,
    is_verified: true,
    is_featured: true,
    is_active: true,
    avg_rating: 4.8,
    total_reviews: 18,
    total_projects: 64,
    skills: ['Laravel', 'WordPress', 'REST API', 'MySQL', 'Vue.js'],
    languages: ['English', 'Hindi'],
  },
  {
    id: 'seed-agency-2',
    agency_name: 'FinStack Europe',
    tagline: 'Secure backend teams for fintech and SaaS products',
    bio: 'Specialists in Symfony, API integrations, payment systems and high-availability PHP architecture for regulated businesses.',
    location_city: 'Berlin',
    location_country: 'Germany',
    website_url: 'https://example.com/finstack',
    logo_url: null,
    team_size_min: 12,
    team_size_max: 30,
    founded_year: 2017,
    min_project_usd: 9000,
    monthly_rate_usd: 18000,
    is_verified: true,
    is_featured: true,
    is_active: true,
    avg_rating: 4.9,
    total_reviews: 12,
    total_projects: 39,
    skills: ['Symfony', 'PostgreSQL', 'Docker', 'Microservices', 'REST API'],
    languages: ['English', 'German'],
  },
  {
    id: 'seed-agency-3',
    agency_name: 'CommerceForge',
    tagline: 'E-commerce builds for Magento, WooCommerce and subscriptions',
    bio: 'A commerce-focused PHP agency handling catalog architecture, performance optimization, checkout flows and ERP integrations.',
    location_city: 'Pune',
    location_country: 'India',
    website_url: 'https://example.com/commerceforge',
    logo_url: null,
    team_size_min: 6,
    team_size_max: 16,
    founded_year: 2019,
    min_project_usd: 4000,
    monthly_rate_usd: 10000,
    is_verified: true,
    is_featured: false,
    is_active: true,
    avg_rating: 4.7,
    total_reviews: 9,
    total_projects: 28,
    skills: ['Magento', 'WooCommerce', 'Laravel', 'Redis', 'MySQL'],
    languages: ['English'],
  },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdmin()
    const { data, count, error } = await supabase
      .from('agencies')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('avg_rating', { ascending: false })
      .range(offset, offset + limit - 1)

    let agencies = (data || []) as Record<string, any>[]
    if (agencies.length === 0) {
      agencies = FALLBACK_AGENCIES
    }

    if (q) {
      agencies = agencies.filter((agency) =>
        agency.agency_name?.toLowerCase().includes(q) ||
        agency.tagline?.toLowerCase().includes(q) ||
        agency.bio?.toLowerCase().includes(q) ||
        agency.location_city?.toLowerCase().includes(q) ||
        agency.location_country?.toLowerCase().includes(q) ||
        (agency.skills || []).some((skill: string) => skill.toLowerCase().includes(q))
      )
    }

    return NextResponse.json({
      agencies,
      total: count || agencies.length,
      page,
      limit,
      total_pages: Math.ceil((count || agencies.length) / limit),
      fallback_used: !data || data.length === 0 || !!error,
    })
  } catch (error) {
    console.error('Agencies GET error:', error)
    return NextResponse.json({
      agencies: FALLBACK_AGENCIES,
      total: FALLBACK_AGENCIES.length,
      page: 1,
      limit: FALLBACK_AGENCIES.length,
      total_pages: 1,
      fallback_used: true,
    })
  }
}
