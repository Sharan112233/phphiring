import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'rating'
    const expertise = searchParams.get('expertise')
    const location = searchParams.get('location')
    const q = searchParams.get('q') || '' // search by name

    const offset = (page - 1) * limit
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('agencies')
      .select('*', { count: 'exact' })

    // Search by name or description
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,description.ilike.%${q}%`
      )
    }

    // Filter by expertise
    if (expertise) {
      query = query.contains('expertise', [expertise])
    }

    // Filter by location
    if (location && location !== 'any') {
      query = query.ilike('location', `%${location}%`)
    }

    // Sort by rating or newest
    if (sort === 'rating') {
      query = query.order('rating', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: agencies, count, error } = await query

    if (error) {
      console.error('Agencies fetch error:', error)
      throw error
    }

    return NextResponse.json({
      agencies: agencies || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (err) {
    console.error('Agencies GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, location, website, expertise, logo_url } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Agency name is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: agency, error } = await supabase
      .from('agencies')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        website: website?.trim() || null,
        expertise: expertise || [],
        logo_url: logo_url || null,
        rating: 0,
        verified: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Agency insert error:', error)
      throw error
    }

    return NextResponse.json(
      { agency, message: 'Agency created successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('Agencies POST error:', err)
    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    )
  }
}
