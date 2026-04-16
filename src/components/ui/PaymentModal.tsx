'use client'
import { useState } from 'react'
import styles from './PaymentModal.module.css'

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
  }
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => void
  modal: {
    ondismiss: () => void
    escape: boolean
    animation: boolean
  }
}

interface RazorpayInstance {
  open(): void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

const PLAN_INFO = {
  job_seeker_pro: {
    name: 'Job Seeker Pro',
    price: '₹99',
    priceNum: 99,
    period: '/month',
    icon: '🚀',
    color: '#EDE9FE',
    textColor: '#5B21B6',
    tagline: 'Unlimited applications every month',
    features: [
      'Unlimited job applications per month',
      'Priority profile visibility in search',
      'Full application tracking dashboard',
      'Email alerts for new matching jobs',
      'PHP verified badge on your profile',
    ],
  },
  recruiter_pro: {
    name: 'Recruiter Pro',
    price: '₹99',
    priceNum: 99,
    period: '/month',
    icon: '🏢',
    color: '#D1FAE5',
    textColor: '#065F46',
    tagline: 'Unlimited job postings every month',
    features: [
      'Unlimited job postings per month',
      'Access to all talent profiles',
      'Applicant management dashboard',
      'Email alerts for new applications',
      'Featured job badge on listings',
    ],
  },
  featured_listing: {
    name: 'Featured Profile',
    price: '₹199',
    priceNum: 199,
    period: '/30 days',
    icon: '⭐',
    color: '#FEF3C7',
    textColor: '#92400E',
    tagline: 'Get 3x more visibility for 30 days',
    features: [
      'Featured badge on your profile',
      'Top placement in all search results',
      '3x more profile views guaranteed',
      'Priority in job match notifications',
      'Highlighted in talent listings page',
    ],
  },
}

interface Props {
  purpose: keyof typeof PLAN_INFO
  onSuccess: () => void
  onClose: () => void
}

export default function PaymentModal({ purpose, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [step, setStep]       = useState<'details' | 'processing' | 'success'>('details')

  const plan = PLAN_INFO[purpose]

  async function handlePay() {
    setLoading(true)
    setError('')

    try {
      // Step 1 — Create Razorpay order via our API
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to create payment order. Please try again.')
        setLoading(false)
        return
      }

      // Step 2 — Open Razorpay checkout
      const options: RazorpayOptions = {
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'PHPhire',
        description: plan.name,
        order_id:    orderData.order_id,
        prefill: {
          name:  orderData.user_name  || '',
          email: orderData.user_email || '',
        },
        theme: {
          color: '#7C3AED',
        },
        handler: async (response: RazorpayResponse) => {
          setStep('processing')

          // Step 3 — Verify payment signature on our server
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyRes.ok && verifyData.success) {
            // Update localStorage plan
            const stored = localStorage.getItem('phphire_user')
            if (stored) {
              const user = JSON.parse(stored)
              user.plan = 'pro'
              localStorage.setItem('phphire_user', JSON.stringify(user))
            }
            setStep('success')
            setLoading(false)
          } else {
            setError(
              verifyData.error ||
              'Payment verification failed. If money was deducted please contact support.'
            )
            setStep('details')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setStep('details')
          },
          escape:    true,
          animation: true,
        },
      }

      if (typeof window === 'undefined' || !(window as unknown as Record<string, unknown>)['Razorpay']) {
        setError('Razorpay failed to load. Please refresh the page and try again.')
        setLoading(false)
        return
      }

      const rzp = new (window as unknown as { Razorpay: new (options: RazorpayOptions) => RazorpayInstance }).Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error('Payment error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
      setStep('details')
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && step !== 'processing') {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>

        {/* Close button */}
        {step !== 'processing' && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}

        {/* ===== STEP: Details ===== */}
        {step === 'details' && (
          <>
            {/* Plan header */}
            <div
              className={styles.planHeader}
              style={{ background: plan.color }}
            >
              <div className={styles.planIcon}>{plan.icon}</div>
              <div className={styles.planName} style={{ color: plan.textColor }}>
                {plan.name}
              </div>
              <div className={styles.planTagline} style={{ color: plan.textColor }}>
                {plan.tagline}
              </div>
              <div className={styles.planPrice}>
                {plan.price}
                <span className={styles.planPeriod}>{plan.period}</span>
              </div>
            </div>

            {/* Features list */}
            <div className={styles.features}>
              <div className={styles.featuresTitle}>What you get</div>
              {plan.features.map((feature, i) => (
                <div key={i} className={styles.featureItem}>
                  <span className={styles.featureCheck}>✓</span>
                  <span className={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}>
                {error}
              </div>
            )}

            {/* Security note */}
            <div className={styles.secureNote}>
              <span className={styles.secureIcon}>🔒</span>
              <span>Secured by Razorpay · UPI, Cards, Net Banking accepted</span>
            </div>

            {/* Pay button */}
            <button
              className={styles.payBtn}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.btnLoader}>
                  <span className="spinner" />
                  Opening payment...
                </span>
              ) : (
                `Pay ${plan.price} & Activate →`
              )}
            </button>

            <p className={styles.cancelNote}>
              One-time monthly charge · Cancel anytime · Instant activation
            </p>
          </>
        )}

        {/* ===== STEP: Processing ===== */}
        {step === 'processing' && (
          <div className={styles.processingWrap}>
            <div className={styles.processingSpinner}>
              <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            </div>
            <h3 className={styles.processingTitle}>Verifying payment...</h3>
            <p className={styles.processingNote}>
              Please wait while we confirm your payment. Do not close this window.
            </p>
          </div>
        )}

        {/* ===== STEP: Success ===== */}
        {step === 'success' && (
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>🎉</div>
            <h3 className={styles.successTitle}>Payment Successful!</h3>
            <p className={styles.successSub}>
              <strong>{plan.name}</strong> has been activated on your account.
            </p>

            <div className={styles.successDetails}>
              <div className={styles.successRow}>
                <span>Plan</span>
                <span>{plan.name}</span>
              </div>
              <div className={styles.successRow}>
                <span>Amount paid</span>
                <span style={{ color: 'var(--purple-light)', fontWeight: 700 }}>
                  {plan.price}
                </span>
              </div>
              <div className={styles.successRow}>
                <span>Status</span>
                <span className="badge badge-green">Active</span>
              </div>
            </div>

            <p className={styles.successEmailNote}>
              📧 A confirmation email has been sent to your registered email address.
            </p>

            <button
              className={styles.payBtn}
              onClick={() => {
                onSuccess()
              }}
            >
              Continue →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}