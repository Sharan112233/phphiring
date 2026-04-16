import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import Razorpay from 'razorpay'

const PLANS = {
  job_seeker_pro:   { amount: 9900,  currency: 'INR', name: 'Job Seeker Pro' },
  recruiter_pro:    { amount: 9900,  currency: 'INR', name: 'Recruiter Pro' },
  featured_listing: { amount: 19900, currency: 'INR', name: 'Featured Profile' },
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const userId = user.userId

    const { purpose } = await req.json()

    if (!purpose || !PLANS[purpose as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const plan = PLANS[purpose as keyof typeof PLANS]

    const keyId     = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing from .env.local')
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id:     keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount:   plan.amount,
      currency: plan.currency,
      notes: {
        user_id: userId,
        purpose,
      },
    })

    const supabase = getSupabaseAdmin()
    await supabase
      .from('payments')
      .insert({
        user_id:           userId,
        razorpay_order_id: order.id,
        purpose,
        amount:            plan.amount,
        currency:          plan.currency,
        status:            'pending',
        created_at:        new Date().toISOString(),
      })

    return NextResponse.json({
      order_id:  order.id,
      amount:    plan.amount,
      currency:  plan.currency,
      key_id:    keyId,
      plan_name: plan.name,
    })

  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again.' },
      { status: 500 }
    )
  }
}