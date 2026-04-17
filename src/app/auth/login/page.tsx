'use client'
import { Suspense, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../auth.module.css'

type Step =
  | 'login'
  | 'register'
  | 'verify-otp'
  | 'forgot-password'
  | 'forgot-otp'
  | 'reset-password'

// ── EyeBtn ────────────────────────────────────────────────────────────────────
function EyeBtn({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        color: '#7B7494',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {show ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

// ── PasswordInput ─────────────────────────────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  required = true,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
  required?: boolean
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingRight: 44 }}
        required={required}
        autoComplete={show ? 'off' : 'current-password'}
      />
      <EyeBtn show={show} onToggle={onToggle} />
    </div>
  )
}

// ── PasswordStrength ──────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score  = checks.filter(Boolean).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#DC2626', '#D97706', '#2563EB', '#059669']
  const label  = labels[score - 1] || 'Too short'
  const color  = colors[score - 1] || '#DC2626'

  const missing: string[] = []
  if (!checks[0]) missing.push('8+ chars')
  if (!checks[1]) missing.push('uppercase')
  if (!checks[2]) missing.push('number')
  if (!checks[3]) missing.push('symbol')

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= score ? color : '#E8E4F0',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color, fontWeight: 600 }}>
        {label}
        {missing.length > 0 && (
          <span style={{ color: '#7B7494', fontWeight: 400, marginLeft: 4 }}>
            — add {missing.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Inner component that uses useSearchParams ────────────────────────────────
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step,    setStep]    = useState<Step>('login')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const [pendingEmail, setPendingEmail] = useState('')

  // Eye toggles
  const [showLoginPass,   setShowLoginPass]   = useState(false)
  const [showRegPass,     setShowRegPass]      = useState(false)
  const [showRegConfirm,  setShowRegConfirm]   = useState(false)
  const [showNewPass,     setShowNewPass]      = useState(false)
  const [showConfirmPass, setShowConfirmPass]  = useState(false)

  // Login form
  const [loginData, setLoginData] = useState({
    email:    '',
    password: '',
  })

  // Register form
  const [regData, setRegData] = useState({
    full_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
    user_type:        'talent' as 'talent' | 'recruiter',
  })

  // Forgot password
  const [forgotEmail,     setForgotEmail]     = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // OTP
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const otpRefs               = useRef<(HTMLInputElement | null)[]>([])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function clearState() {
    setError('')
    setSuccess('')
  }

  function goTo(s: Step) {
    clearState()
    setStep(s)
  }

  function getRedirectTarget() {
    const redirect = searchParams.get('redirect')
    if (redirect && redirect.startsWith('/')) return redirect
    return '/dashboard'
  }

  // ── OTP handlers ─────────────────────────────────────────────────────────────
  function handleOTPInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (!value && index > 0) otpRefs.current[index - 1]?.focus()
  }

  function handleOTPKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOTPPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    clearState()
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(loginData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('phphire_user', JSON.stringify(data.user))
      setTimeout(() => router.push(getRedirectTarget()), 300)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // ── Register ─────────────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    clearState()
    if (regData.password !== regData.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (regData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          full_name: regData.full_name,
          email:     regData.email,
          password:  regData.password,
          user_type: regData.user_type,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }
      setPendingEmail(regData.email)
      setOtp(['', '', '', '', '', ''])
      setStep('verify-otp')
      setSuccess('OTP sent to your email. Please verify to activate your account.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── Verify OTP (registration) ─────────────────────────────────────────────
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true)
    clearState()
    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: pendingEmail, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid OTP')
        setLoading(false)
        return
      }
      localStorage.setItem('phphire_user', JSON.stringify(data.user))
      setSuccess('Email verified! Redirecting...')
      setTimeout(() => router.push(getRedirectTarget()), 500)
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  async function resendOTP() {
    setLoading(true)
    clearState()
    await fetch('/api/auth/resend-otp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: pendingEmail }),
    })
    setSuccess('New OTP sent to your email.')
    setLoading(false)
  }

  // ── Forgot password — send OTP ─────────────────────────────────────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    clearState()
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'send-otp', email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send reset code')
        setLoading(false)
        return
      }
      setPendingEmail(forgotEmail)
      setOtp(['', '', '', '', '', ''])
      setStep('forgot-otp')
      setSuccess('Reset code sent to your email. Valid for 10 minutes.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── Forgot password — verify OTP ──────────────────────────────────────────
  async function handleForgotOTP(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true)
    clearState()
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action: 'verify-otp',
          email:  pendingEmail,
          otp:    code,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code')
        setLoading(false)
        return
      }
      setNewPassword('')
      setConfirmPassword('')
      setStep('reset-password')
    } catch {
      setError('Something went wrong.')
    }
    setLoading(false)
  }

  async function resendForgotOTP() {
    setLoading(true)
    clearState()
    try {
      await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'send-otp', email: pendingEmail }),
      })
      setOtp(['', '', '', '', '', ''])
      setSuccess('New reset code sent to your email.')
    } catch {
      setError('Failed to resend. Try again.')
    }
    setLoading(false)
  }

  // ── Reset password — set new password ─────────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    clearState()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action:       'update-password',
          email:        pendingEmail,
          new_password: newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        setLoading(false)
        return
      }
      setSuccess('Password reset successfully! Redirecting to sign in...')
      setTimeout(() => {
        setStep('login')
        setSuccess('')
        setNewPassword('')
        setConfirmPassword('')
        setLoginData({ email: pendingEmail, password: '' })
      }, 2000)
    } catch {
      setError('Something went wrong.')
    }
    setLoading(false)
  }

  // ── OTP input block (reused in multiple steps) ────────────────────────────
  function OTPBlock({ onSubmit, submitLabel }: {
    onSubmit: (e: React.FormEvent) => void
    submitLabel: string
  }) {
    return (
      <form onSubmit={onSubmit}>
        <div
          className="otp-group"
          onPaste={handleOTPPaste}
          style={{ marginBottom: 24 }}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOTPInput(i, e.target.value)}
              onKeyDown={e => handleOTPKeyDown(i, e)}
              className="otp-input"
            />
          ))}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : submitLabel}
        </button>
      </form>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page} suppressHydrationWarning>

      {/* Left panel */}
      <div className={styles.left}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>PHP<span>hire</span></div>
        </Link>
        <div className={styles.leftContent}>
          <h2>The PHP talent marketplace</h2>
          <p>
            Join 1,200+ verified PHP developers and 3,400+
            businesses already on PHPhire.
          </p>
          <div className={styles.featureList}>
            {[
              { icon: '🎯', text: 'PHP-only verified talent' },
              { icon: '🔍', text: 'Deep framework and CRM filters' },
              { icon: '✅', text: 'PHP-specific reviews' },
              { icon: '⚡', text: 'Get matched in 24 hours' },
            ].map(f => (
              <div key={f.text} className={styles.feature}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.formCard}>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {success}
            </div>
          )}

          {/* ── VERIFY OTP (registration) ── */}
          {step === 'verify-otp' && (
            <>
              <div className={styles.formIcon}>📧</div>
              <h1 className={styles.formTitle}>Verify your email</h1>
              <p className={styles.formSub}>
                We sent a 6-digit code to{' '}
                <strong>{pendingEmail}</strong>
              </p>
              <OTPBlock
                onSubmit={handleVerifyOTP}
                submitLabel="Verify and Activate Account"
              />
              <p className={styles.switchRow} style={{ marginTop: 16 }}>
                Did not receive it?{' '}
                <button
                  className={styles.switchLink}
                  onClick={resendOTP}
                  disabled={loading}
                  type="button"
                >
                  Resend OTP
                </button>
              </p>
            </>
          )}

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <>
              <div className={styles.formIcon}>👋</div>
              <h1 className={styles.formTitle}>Welcome back</h1>
              <p className={styles.formSub}>
                Sign in to your PHPhire account
              </p>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={loginData.email}
                    onChange={e =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Password
                    </label>
                    <button
                      type="button"
                      className={styles.switchLink}
                      style={{ fontSize: 12 }}
                      onClick={() => {
                        clearState()
                        setForgotEmail(loginData.email)
                        setStep('forgot-password')
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    value={loginData.password}
                    onChange={v => setLoginData({ ...loginData, password: v })}
                    placeholder="Enter your password"
                    show={showLoginPass}
                    onToggle={() => setShowLoginPass(p => !p)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : 'Sign In →'}
                </button>
              </form>
              <p className={styles.switchRow}>
                No account?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => goTo('register')}
                >
                  Create one free
                </button>
              </p>
            </>
          )}

          {/* ── REGISTER ── */}
          {step === 'register' && (
            <>
              <div className={styles.formIcon}>🚀</div>
              <h1 className={styles.formTitle}>Create your account</h1>
              <p className={styles.formSub}>Join PHPhire — free forever</p>

              {/* User type selector */}
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${regData.user_type === 'talent' ? styles.typeBtnActive : ''}`}
                  onClick={() => setRegData({ ...regData, user_type: 'talent' })}
                >
                  <span className={styles.typeBtnIcon}>👨‍💻</span>
                  <span className={styles.typeBtnLabel}>I am a Developer</span>
                  <span className={styles.typeBtnSub}>Looking for PHP work</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${regData.user_type === 'recruiter' ? styles.typeBtnActive : ''}`}
                  onClick={() => setRegData({ ...regData, user_type: 'recruiter' })}
                >
                  <span className={styles.typeBtnIcon}>🏢</span>
                  <span className={styles.typeBtnLabel}>I am Hiring</span>
                  <span className={styles.typeBtnSub}>Looking for PHP talent</span>
                </button>
              </div>

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={regData.full_name}
                    onChange={e =>
                      setRegData({ ...regData, full_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={regData.email}
                    onChange={e =>
                      setRegData({ ...regData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Password <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <PasswordInput
                      value={regData.password}
                      onChange={v => setRegData({ ...regData, password: v })}
                      placeholder="Min 8 characters"
                      show={showRegPass}
                      onToggle={() => setShowRegPass(p => !p)}
                    />
                    <PasswordStrength password={regData.password} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Confirm Password
                    </label>
                    <PasswordInput
                      value={regData.confirm_password}
                      onChange={v =>
                        setRegData({ ...regData, confirm_password: v })
                      }
                      placeholder="Repeat password"
                      show={showRegConfirm}
                      onToggle={() => setShowRegConfirm(p => !p)}
                    />
                    {regData.confirm_password && (
                      <div style={{
                        fontSize: 11,
                        marginTop: 4,
                        fontWeight: 600,
                        color: regData.password === regData.confirm_password
                          ? '#059669'
                          : '#DC2626',
                      }}>
                        {regData.password === regData.confirm_password
                          ? '✓ Passwords match'
                          : '✕ Passwords do not match'}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading
                    ? <span className="spinner" />
                    : 'Create Account — Free →'}
                </button>
                <p style={{
                  fontSize: 11,
                  color: '#7B7494',
                  textAlign: 'center',
                  marginTop: 10,
                }}>
                  By registering you agree to our Terms of Service
                  and Privacy Policy.
                </p>
              </form>

              <p className={styles.switchRow}>
                Already have an account?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => goTo('login')}
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD — enter email ── */}
          {step === 'forgot-password' && (
            <>
              <div className={styles.formIcon}>🔑</div>
              <h1 className={styles.formTitle}>Reset your password</h1>
              <p className={styles.formSub}>
                Enter your email and we will send you a reset code
              </p>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading
                    ? <span className="spinner" />
                    : 'Send Reset Code →'}
                </button>
              </form>
              <p className={styles.switchRow}>
                Remembered it?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => goTo('login')}
                >
                  Back to sign in
                </button>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD — enter OTP ── */}
          {step === 'forgot-otp' && (
            <>
              <div className={styles.formIcon}>📧</div>
              <h1 className={styles.formTitle}>Enter reset code</h1>
              <p className={styles.formSub}>
                We sent a 6-digit code to{' '}
                <strong>{pendingEmail}</strong>
              </p>
              <OTPBlock
                onSubmit={handleForgotOTP}
                submitLabel="Verify Code →"
              />
              <p className={styles.switchRow}>
                Did not receive it?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={resendForgotOTP}
                  disabled={loading}
                >
                  Resend code
                </button>
                {' · '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => goTo('forgot-password')}
                >
                  Change email
                </button>
              </p>
            </>
          )}

          {/* ── RESET PASSWORD — set new password ── */}
          {step === 'reset-password' && (
            <>
              <div className={styles.formIcon}>🔒</div>
              <h1 className={styles.formTitle}>Set new password</h1>
              <p className={styles.formSub}>
                Create a strong new password for your account
              </p>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Min 8 characters"
                    show={showNewPass}
                    onToggle={() => setShowNewPass(p => !p)}
                  />
                  <PasswordStrength password={newPassword} />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat new password"
                    show={showConfirmPass}
                    onToggle={() => setShowConfirmPass(p => !p)}
                  />
                  {confirmPassword && (
                    <div style={{
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: 600,
                      color: newPassword === confirmPassword
                        ? '#059669'
                        : '#DC2626',
                    }}>
                      {newPassword === confirmPassword
                        ? '✓ Passwords match'
                        : '✕ Passwords do not match'}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading
                    ? <span className="spinner" />
                    : 'Reset Password →'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
