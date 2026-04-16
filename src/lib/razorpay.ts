import Razorpay from 'razorpay'
import crypto   from 'crypto'

// ─── CLIENT ──────────────────────────────────────────────────────────────────

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ─── PLANS ───────────────────────────────────────────────────────────────────

export const PLANS = {
  job_seeker_pro: {
    name:        'Job Seeker Pro',
    description: 'Unlimited job applications per month',
    amount:      9900,   // ₹99 in paise
    currency:    'INR',
  },
  recruiter_pro: {
    name:        'Recruiter Pro',
    description: 'Unlimited job postings per month',
    amount:      9900,   // ₹99 in paise
    currency:    'INR',
  },
  featured_listing: {
    name:        'Featured Profile',
    description: 'Featured profile placement for 30 days',
    amount:      19900,  // ₹199 in paise
    currency:    'INR',
  },
} as const

export type PlanKey = keyof typeof PLANS

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────

export async function createOrder(
  purpose: PlanKey,
  userId:  string
) {
  const plan = PLANS[purpose]

  const order = await razorpay.orders.create({
    amount:   plan.amount,
    currency: plan.currency,
    notes:    {
      userId,
      purpose,
      plan_name: plan.name,
    },
  })

  return order
}

// ─── VERIFY SIGNATURE ────────────────────────────────────────────────────────

export function verifyPaymentSignature(
  orderId:   string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const body             = `${orderId}|${paymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature,         'hex')
    )
  } catch {
    return false
  }
}