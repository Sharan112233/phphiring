import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'PHPhire Disclaimer — important notices about the use of our PHP talent marketplace.',
  robots: { index: true, follow: false },
}

export default function DisclaimerPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', fontFamily: 'Inter, sans-serif', lineHeight: 1.8, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Disclaimer</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Last updated: Apr 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>General Information</h2>
        <p>The information provided on PHPhire is for general informational purposes only. While we strive to keep information accurate and up to date, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the content.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>No Employment Guarantee</h2>
        <p>PHPhire is a marketplace that connects PHP developers with recruiters. We do not guarantee employment, job placement, or hiring outcomes for any user. All hiring decisions are made solely by the recruiters using the platform.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Third-Party Content</h2>
        <p>Job listings, developer profiles, and agency information are submitted by users. PHPhire does not verify every claim made in user-generated content and is not responsible for inaccuracies in listings or profiles.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>External Links</h2>
        <p>Our platform may contain links to external websites. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Payment Disclaimer</h2>
        <p>All payments are processed by Razorpay. PHPhire does not store card or banking details. Any payment disputes should be raised with Razorpay support in addition to contacting us.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, PHPhire shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Contact</h2>
        <p>If you have any questions about this disclaimer, please open an issue on our GitHub repository.</p>
      </section>
    </main>
  )
}
