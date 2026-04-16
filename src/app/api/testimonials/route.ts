import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'newest'

    const offset = (page - 1) * limit
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })

    // Sort by newest or highest rating
    if (sort === 'rating') {
      query = query.order('rating', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: testimonials, count, error } = await query

    if (error) {
      console.error('Testimonials fetch error:', error)
      throw error
    }

    return NextResponse.json({
      testimonials: testimonials || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (err) {
    console.error('Testimonials GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, author_name, author_role, rating } = body

    // Validate required fields
    if (!text || !author_name || !rating) {
      return NextResponse.json(
        { error: 'Text, author_name, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        text: text.trim(),
        author_name: author_name.trim(),
        author_role: author_role?.trim() || null,
        rating,
      })
      .select()
      .single()

    if (error) {
      console.error('Testimonial insert error:', error)
      throw error
    }

    return NextResponse.json(
      { testimonial, message: 'Testimonial added successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('Testimonials POST error:', err)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
