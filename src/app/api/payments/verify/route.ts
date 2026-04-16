import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import crypto from 'crypto'

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

    const body = await req.json()
    console.log('Verify called with body:', body)

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      )
    }

    // Verify signature
    const signatureBody      = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature  = crypto
      .createHmac('sha256', keySecret)
      .update(signatureBody)
      .digest('hex')

    let isValid = false
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      )
    } catch {
      isValid = expectedSignature === razorpay_signature
    }

    console.log('Signature valid:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment verification failed.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Check if payment record exists first
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, purpose, amount_paise')
      .eq('razorpay_order_id', razorpay_order_id)

    console.log('Existing payment records:', existingPayment)

    if (existingPayment && existingPayment.length > 0) {
      // Update existing record — NO .single()
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature:  razorpay_signature,
          status:              'paid',
          paid_at:             new Date().toISOString(),
          updated_at:          new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id)

      if (updateError) {
        console.error('Payment update error:', updateError)
      } else {
        console.log('Payment record updated successfully')
      }
    } else {
      // No existing record — insert a new one
      console.log('No existing record found — inserting new payment record')
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id:             userId,
          razorpay_order_id:   razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature:  razorpay_signature,
          amount_paise:        9900,
          currency:            'INR',
          status:              'paid',
          paid_at:             new Date().toISOString(),
          created_at:          new Date().toISOString(),
          updated_at:          new Date().toISOString(),
        })

      if (insertError) {
        console.error('Payment insert error:', insertError)
      } else {
        console.log('New payment record inserted successfully')
      }
    }

    // Upgrade user to pro — always do this regardless of payment record
    const { error: userError } = await supabase
      .from('users')
      .update({
        plan:       'pro',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (userError) {
      console.error('User upgrade error:', userError)
    } else {
      console.log('User upgraded to pro:', userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and plan upgraded to Pro!',
      payment_id: razorpay_payment_id,
      order_id:   razorpay_order_id,
    })

  } catch (err) {
    console.error('Verify payment error:', err)
    return NextResponse.json(
      { error: 'Payment verification failed. Please try again.' },
      { status: 500 }
    )
  }
}