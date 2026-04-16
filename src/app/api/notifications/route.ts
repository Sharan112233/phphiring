import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Create the notification
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: body.user_id,
        type: 'job_posted',
        title: `New Job: ${body.job_title}`,
        message: `${body.company_name} posted a new job: ${body.job_title}`,
        is_read: false,
        job_id: body.job_id,
      })

    if (error) throw error

    return NextResponse.json(
      { message: 'Notification sent' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}