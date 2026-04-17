'use client'

type PageLoaderProps = {
  label?: string
  minHeight?: string
}

export default function PageLoader({
  label = 'Loading...',
  minHeight = '60vh',
}: PageLoaderProps) {
  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAF9',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            border: '4px solid #E8E4F0',
            borderTopColor: '#7C3AED',
            animation: 'phphire-spin 0.7s linear infinite',
            margin: '0 auto 14px',
          }}
        />
        <div
          style={{
            width: 190,
            height: 10,
            borderRadius: 999,
            margin: '0 auto 10px',
            background: 'linear-gradient(90deg, #F3F4F6 25%, #E9D5FF 50%, #F3F4F6 75%)',
            backgroundSize: '200% 100%',
            animation: 'phphire-shimmer 1.3s infinite',
          }}
        />
        <p style={{ fontSize: 13, color: '#7B7494', margin: 0, fontWeight: 600 }}>{label}</p>
        <style>{`
          @keyframes phphire-spin { to { transform: rotate(360deg); } }
          @keyframes phphire-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </div>
  )
}
