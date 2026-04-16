'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string }
  theme: { color: string }
  handler: (response: RazorpayResponse) => void
  modal: { ondismiss: () => void }
}
interface RazorpayInstance { open(): void }
interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id:   string
  razorpay_signature:  string
}

interface PaymentRecord {
  id:         string
  date:       string
  plan:       string
  amount:     string
  status:     'Success' | 'Failed' | 'Pending'
  invoice_id: string
}

type PlanKey = 'job_seeker_pro' | 'recruiter_pro' | 'featured_listing'

const PLAN_INFO: Record<PlanKey, {
  name:     string
  price:    string
  amount:   number
  period:   string
  icon:     string
  color:    string
  tc:       string
  tagline:  string
  features: string[]
}> = {
  job_seeker_pro: {
    name:    'Job Seeker Pro',
    price:   'Rs.99',
    amount:  9900,
    period:  '/month',
    icon:    '🚀',
    color:   '#EDE9FE',
    tc:      '#5B21B6',
    tagline: 'Unlimited job applications every month',
    features: [
      'Unlimited job applications per month',
      'Priority profile visibility in search results',
      'Full application tracking dashboard',
      'Email alerts for new matching jobs',
      'PHP verified badge on your profile',
    ],
  },
  recruiter_pro: {
    name:    'Recruiter Pro',
    price:   'Rs.99',
    amount:  9900,
    period:  '/month',
    icon:    '🏢',
    color:   '#D1FAE5',
    tc:      '#065F46',
    tagline: 'Unlimited job postings every month',
    features: [
      'Unlimited job postings per month',
      'Access to all talent profiles',
      'Applicant management dashboard',
      'Email alerts for new applications',
      'Featured job badge on all listings',
    ],
  },
  featured_listing: {
    name:    'Featured Profile',
    price:   'Rs.199',
    amount:  19900,
    period:  '/30 days',
    icon:    '⭐',
    color:   '#FEF3C7',
    tc:      '#92400E',
    tagline: 'Get 3x more profile visibility for 30 days',
    features: [
      'Featured badge on your profile',
      'Top placement in all search results',
      '3x more profile views guaranteed',
      'Priority in job match notifications',
      'Highlighted in the talent listings page',
    ],
  },
}

export default function PaymentsPage() {
  const router = useRouter()

  const [user, setUser] = useState<{
    id: string
    full_name: string
    email: string
    user_type: string
    plan: string
  } | null>(null)

  const [payments,     setPayments]     = useState<PaymentRecord[]>([])
  const [loading,      setLoading]      = useState(false)
  const [payingPlan,   setPayingPlan]   = useState<PlanKey | null>(null)
  const [toast,        setToast]        = useState('')
  const [toastType,    setToastType]    = useState<'success' | 'error'>('success')
  const [showSuccess,  setShowSuccess]  = useState(false)
  const [lastPaidPlan, setLastPaidPlan] = useState('')
  const [isPro,        setIsPro]        = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('phphire_user')
    if (!stored) { router.push('/auth/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    setIsPro(u.plan === 'pro')

    // Load payment history
    const saved = localStorage.getItem('phphire_payments')
    if (saved) setPayments(JSON.parse(saved))

    // Load Razorpay script if not already loaded
    if (!document.getElementById('razorpay-script')) {
      const script    = document.createElement('script')
      script.id       = 'razorpay-script'
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async    = true
      document.body.appendChild(script)
    }
  }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 5000)
  }

  async function handleUpgrade(planKey: PlanKey) {
    if (!user) return

    // Check Razorpay is loaded
    if (typeof window === 'undefined' || !window.Razorpay) {
      showToast('Payment system is loading. Please wait a moment and try again.', 'error')
      return
    }

    setPayingPlan(planKey)
    setLoading(true)

    try {
      // Step 1 — Create order on server
      const orderRes  = await fetch('/api/payments/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ purpose: planKey }),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        showToast(orderData.error || 'Failed to create payment order.', 'error')
        setLoading(false)
        setPayingPlan(null)
        return
      }

      const plan = PLAN_INFO[planKey]

      // Step 2 — Open Razorpay checkout
      const options: RazorpayOptions = {
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'PHPhire',
        description: plan.name,
        order_id:    orderData.order_id,
        prefill: {
          name:  user.full_name,
          email: user.email,
        },
        theme: { color: '#7C3AED' },

        // Step 3 — Handle success
        // handler: async (response: RazorpayResponse) => {
        //   try {
        //     const verifyRes  = await fetch('/api/payments/verify', {
        //       method:  'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body:    JSON.stringify(response),
        //     })
        //     const verifyData = await verifyRes.json()

        //     if (verifyRes.ok && verifyData.success) {
        //       // Update localStorage — give pro immediately
        //       const stored = localStorage.getItem('phphire_user')
        //       if (stored) {
        //         const u   = JSON.parse(stored)
        //         u.plan    = 'pro'
        //         localStorage.setItem('phphire_user', JSON.stringify(u))
        //         setUser(u)
        //         setIsPro(true)
        //       }

        //       // Save payment record
        //       const newPayment: PaymentRecord = {
        //         id:         response.razorpay_payment_id,
        //         date:       new Date().toLocaleDateString('en-IN', {
        //           day:   '2-digit',
        //           month: 'short',
        //           year:  'numeric',
        //         }),
        //         plan:       plan.name,
        //         amount:     plan.price,
        //         status:     'Success',
        //         invoice_id: `INV-${Date.now()}`,
        //       }
        //       const updated = [newPayment, ...payments]
        //       setPayments(updated)
        //       localStorage.setItem('phphire_payments', JSON.stringify(updated))

        //       // Show success
        //       setLastPaidPlan(plan.name)
        //       setShowSuccess(true)
        //       showToast(
        //         `${plan.name} activated! You now have Pro access.`,
        //         'success'
        //       )
        //     } else {
        //       // Save failed record
        //       const failedPayment: PaymentRecord = {
        //         id:         response.razorpay_payment_id || `fail-${Date.now()}`,
        //         date:       new Date().toLocaleDateString('en-IN'),
        //         plan:       plan.name,
        //         amount:     plan.price,
        //         status:     'Failed',
        //         invoice_id: `INV-FAIL-${Date.now()}`,
        //       }
        //       const updated = [failedPayment, ...payments]
        //       setPayments(updated)
        //       localStorage.setItem('phphire_payments', JSON.stringify(updated))

        //       showToast(
        //         verifyData.error || 'Payment verification failed. Contact support.',
        //         'error'
        //       )
        //     }
        //   } catch {
        //     showToast('Payment verification error. Please contact support.', 'error')
        //   }
        //   setLoading(false)
        //   setPayingPlan(null)
        // },

handler: async (response: RazorpayResponse) => {
  console.log('Razorpay response:', response)
  try {
    const verifyRes = await fetch('/api/payments/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      }),
    })

    console.log('Verify response status:', verifyRes.status)
    const verifyData = await verifyRes.json()
    console.log('Verify response data:', verifyData)

    if (verifyRes.ok && verifyData.success) {
      // Update localStorage
      const stored = localStorage.getItem('phphire_user')
      if (stored) {
        const u = JSON.parse(stored)
        u.plan  = 'pro'
        localStorage.setItem('phphire_user', JSON.stringify(u))
        setUser(u)
        setIsPro(true)
      }

      // Save payment record locally
      const newPayment: PaymentRecord = {
        id:         response.razorpay_payment_id,
        date:       new Date().toLocaleDateString('en-IN', {
          day:   '2-digit',
          month: 'short',
          year:  'numeric',
        }),
        plan:       plan.name,
        amount:     plan.price,
        status:     'Success',
        invoice_id: `INV-${Date.now()}`,
      }
      const updated = [newPayment, ...payments]
      setPayments(updated)
      localStorage.setItem('phphire_payments', JSON.stringify(updated))

      setLastPaidPlan(plan.name)
      setShowSuccess(true)
      showToast(`${plan.name} activated! You now have Pro access.`, 'success')
    } else {
      const failedPayment: PaymentRecord = {
        id:         response.razorpay_payment_id || `fail-${Date.now()}`,
        date:       new Date().toLocaleDateString('en-IN'),
        plan:       plan.name,
        amount:     plan.price,
        status:     'Failed',
        invoice_id: `INV-FAIL-${Date.now()}`,
      }
      const updated = [failedPayment, ...payments]
      setPayments(updated)
      localStorage.setItem('phphire_payments', JSON.stringify(updated))
      showToast(
        verifyData.error || 'Payment verification failed.',
        'error'
      )
    }
  } catch (err) {
    console.error('Verify fetch error:', err)
    showToast('Payment verification error. Please contact support.', 'error')
  }
  setLoading(false)
  setPayingPlan(null)
},


        // Step 4 — Handle modal dismiss (user closed)
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled.', 'error')
            setLoading(false)
            setPayingPlan(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error('Payment error:', err)
      showToast('Something went wrong. Please try again.', 'error')
      setLoading(false)
      setPayingPlan(null)
    }
  }

  if (!user) return null

  const isTalent      = user.user_type === 'talent'
  const availablePlans: PlanKey[] = isTalent
    ? ['job_seeker_pro', 'featured_listing']
    : ['recruiter_pro',  'featured_listing']

  return (
    <>
      <Navbar />

      <div style={{ background: '#FAFAF9', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{
          background:   '#fff',
          borderBottom: '1px solid #E8E4F0',
          padding:      '28px 0',
        }}>
          <div style={{
            maxWidth:        900,
            margin:          '0 auto',
            padding:         '0 24px',
            display:         'flex',
            justifyContent:  'space-between',
            alignItems:      'center',
            flexWrap:        'wrap',
            gap:             12,
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                Billing and Plans
              </h1>
              <p style={{ fontSize: 14, color: '#7B7494' }}>
                Manage your subscription and view payment history
              </p>
            </div>
            <Link
              href="/dashboard"
              style={{
                padding:        '9px 18px',
                border:         '1.5px solid #E8E4F0',
                background:     '#fff',
                color:          '#3D3558',
                borderRadius:   10,
                fontSize:       14,
                fontWeight:     500,
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>

          {/* Success banner */}
          {showSuccess && (
            <div style={{
              background:   '#D1FAE5',
              border:       '1px solid #A7F3D0',
              borderRadius: 12,
              padding:      '16px 20px',
              marginBottom: 20,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'space-between',
              gap:          12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#065F46' }}>
                    {lastPaidPlan} activated successfully!
                  </div>
                  <div style={{ fontSize: 13, color: '#059669' }}>
                    Your Pro features are now active. Enjoy unlimited access!
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  background: 'none',
                  border:     'none',
                  color:      '#059669',
                  fontSize:   20,
                  cursor:     'pointer',
                  flexShrink: 0,
                }}
              >
                x
              </button>
            </div>
          )}

          {/* Current plan card */}
          <div style={{
            background:   '#fff',
            border:       '1px solid #E8E4F0',
            borderRadius: 16,
            padding:      24,
            marginBottom: 24,
          }}>
            <div style={{
              fontSize:        12,
              fontWeight:      700,
              color:           '#7B7494',
              textTransform:   'uppercase',
              letterSpacing:   '0.07em',
              marginBottom:    14,
            }}>
              Current Plan
            </div>

            <div style={{
              display:     'flex',
              alignItems:  'center',
              gap:         16,
              flexWrap:    'wrap',
            }}>
              <div style={{
                width:           56,
                height:          56,
                borderRadius:    14,
                background:      isPro ? '#EDE9FE' : '#F4F3F7',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        26,
              }}>
                {isPro ? '⭐' : '🆓'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize:     20,
                  fontWeight:   800,
                  color:        '#0F0A1E',
                  marginBottom: 3,
                }}>
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </div>
                <div style={{ fontSize: 13, color: '#7B7494' }}>
                  {isPro
                    ? 'Unlimited access to all PHPhire features'
                    : isTalent
                    ? '10 job applications per month — Upgrade for unlimited'
                    : '3 job postings per month — Upgrade for unlimited'}
                </div>
              </div>

              <span style={{
                fontSize:     12,
                fontWeight:   700,
                padding:      '5px 14px',
                borderRadius: 20,
                background:   isPro ? '#EDE9FE' : '#F4F3F7',
                color:        isPro ? '#5B21B6' : '#7B7494',
                border:       isPro ? '1px solid #C4B5FD' : 'none',
              }}>
                {isPro ? 'Active Pro' : 'Free'}
              </span>
            </div>

            {/* Usage stats */}
            <div style={{
              display:              'grid',
              gridTemplateColumns:  'repeat(auto-fit, minmax(140px, 1fr))',
              gap:                  10,
              marginTop:            16,
              paddingTop:           16,
              borderTop:            '1px solid #E8E4F0',
            }}>
              {isTalent ? (
                <>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      isPro ? '#7C3AED' : '#0F0A1E',
                    }}>
                      {isPro ? 'Unlimited' : '10'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Applications/month
                    </div>
                  </div>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      '#0F0A1E',
                    }}>
                      {isPro ? 'Priority' : 'Standard'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Profile visibility
                    </div>
                  </div>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      isPro ? '#059669' : '#0F0A1E',
                    }}>
                      {isPro ? 'Verified' : 'Basic'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Profile badge
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      isPro ? '#7C3AED' : '#0F0A1E',
                    }}>
                      {isPro ? 'Unlimited' : '3'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Job postings/month
                    </div>
                  </div>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      '#0F0A1E',
                    }}>
                      {isPro ? 'All profiles' : 'Limited'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Talent access
                    </div>
                  </div>
                  <div style={{
                    background:   '#FAFAF9',
                    borderRadius: 10,
                    padding:      '12px 14px',
                  }}>
                    <div style={{
                      fontSize:   22,
                      fontWeight: 800,
                      color:      isPro ? '#059669' : '#0F0A1E',
                    }}>
                      {isPro ? 'Featured' : 'Standard'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7B7494' }}>
                      Job listing badge
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Already pro — dark banner */}
          {isPro && (
            <div style={{
              background:   'linear-gradient(135deg, #0F0A1E, #1E1035)',
              borderRadius: 16,
              padding:      '28px 28px',
              marginBottom: 24,
              textAlign:    'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div>
              <div style={{
                fontSize:     20,
                fontWeight:   800,
                color:        '#fff',
                marginBottom: 6,
              }}>
                You are on the Pro plan
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                Enjoy unlimited access to all PHPhire features.
                Thank you for supporting us!
              </div>
            </div>
          )}

          {/* Upgrade plans — only show if not pro */}
          {!isPro && (
            <>
              <div style={{
                fontSize:     16,
                fontWeight:   700,
                color:        '#0F0A1E',
                marginBottom: 14,
              }}>
                Upgrade your plan
              </div>

              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap:                 14,
                marginBottom:        28,
              }}>
                {availablePlans.map(planKey => {
                  const plan      = PLAN_INFO[planKey]
                  const isPaying  = payingPlan === planKey && loading

                  return (
                    <div
                      key={planKey}
                      style={{
                        background:     '#fff',
                        border:         '2px solid #E8E4F0',
                        borderRadius:   16,
                        padding:        22,
                        display:        'flex',
                        flexDirection:  'column',
                      }}
                    >
                      {/* Plan header */}
                      <div style={{
                        background:   plan.color,
                        borderRadius: 12,
                        padding:      '18px',
                        textAlign:    'center',
                        marginBottom: 16,
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 6 }}>
                          {plan.icon}
                        </div>
                        <div style={{
                          fontSize:     17,
                          fontWeight:   800,
                          color:        plan.tc,
                          marginBottom: 4,
                        }}>
                          {plan.name}
                        </div>
                        <div style={{
                          fontSize:     12,
                          color:        plan.tc,
                          opacity:      0.8,
                          marginBottom: 10,
                        }}>
                          {plan.tagline}
                        </div>
                        <div style={{
                          fontSize:   30,
                          fontWeight: 800,
                          color:      '#7C3AED',
                        }}>
                          {plan.price}
                          <span style={{
                            fontSize:   13,
                            fontWeight: 400,
                            color:      '#7B7494',
                          }}>
                            {plan.period}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div style={{
                        display:        'flex',
                        flexDirection:  'column',
                        gap:            8,
                        marginBottom:   18,
                        flex:           1,
                      }}>
                        {plan.features.map((f, i) => (
                          <div key={i} style={{
                            display:    'flex',
                            alignItems: 'flex-start',
                            gap:        8,
                            fontSize:   13,
                            color:      '#3D3558',
                          }}>
                            <span style={{
                              color:      '#059669',
                              fontWeight: 700,
                              flexShrink: 0,
                              marginTop:  1,
                            }}>
                              ✓
                            </span>
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* Secure note */}
                      <div style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          6,
                        fontSize:     11,
                        color:        '#7B7494',
                        background:   '#FAFAF9',
                        border:       '1px solid #E8E4F0',
                        borderRadius: 8,
                        padding:      '7px 10px',
                        marginBottom: 12,
                      }}>
                        <span>🔒</span>
                        <span>Secured by Razorpay — UPI, Cards, Net Banking</span>
                      </div>

                      {/* Pay button */}
                      <button
                        onClick={() => handleUpgrade(planKey)}
                        disabled={isPaying || loading}
                        style={{
                          width:           '100%',
                          padding:         '13px',
                          background:      isPaying ? '#C4B5FD' : '#7C3AED',
                          color:           '#fff',
                          border:          'none',
                          borderRadius:    10,
                          fontSize:        14,
                          fontWeight:      700,
                          cursor:          isPaying || loading ? 'not-allowed' : 'pointer',
                          display:         'flex',
                          alignItems:      'center',
                          justifyContent:  'center',
                          gap:             8,
                          marginBottom:    8,
                        }}
                      >
                        {isPaying ? (
                          <>
                            <span style={{
                              width:       16,
                              height:      16,
                              border:      '2px solid rgba(255,255,255,0.4)',
                              borderTopColor: '#fff',
                              borderRadius: '50%',
                              animation:   'spin 0.7s linear infinite',
                              display:     'inline-block',
                            }} />
                            Opening payment...
                          </>
                        ) : (
                          `Pay ${plan.price} and Activate`
                        )}
                      </button>

                      <p style={{
                        fontSize:   11,
                        textAlign:  'center',
                        color:      '#7B7494',
                        margin:     0,
                      }}>
                        One-time monthly charge — Instant activation
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

             
                
          {/* Security note */}
          <div style={{
            marginTop:    16,
            padding:      '12px 16px',
            background:   '#FAFAF9',
            borderRadius: 10,
            border:       '1px solid #E8E4F0',
            fontSize:     12,
            color:        '#7B7494',
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}>
            <span>🔒</span>
            <span>
              All payments processed securely via Razorpay.
              We accept UPI, Credit/Debit Cards and Net Banking.
              For payment issues contact support.
            </span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:     'fixed',
          bottom:       24,
          right:        24,
          background:   toastType === 'success' ? '#059669' : '#DC2626',
          color:        '#fff',
          padding:      '14px 20px',
          borderRadius: 12,
          fontSize:     14,
          zIndex:       1000,
          boxShadow:    '0 8px 32px rgba(0,0,0,0.25)',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
          maxWidth:     380,
          animation:    'slideIn 0.3s ease',
        }}>
          <span style={{ fontSize: 18 }}>
            {toastType === 'success' ? '✓' : '✕'}
          </span>
          <span>{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>

      <Footer />
    </>
  )
}