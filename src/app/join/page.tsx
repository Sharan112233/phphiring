'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#FAFAF9',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #E8E4F0',
          borderTopColor: '#7C3AED',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: 14, color: '#7B7494' }}>Redirecting...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}