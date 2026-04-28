import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'PHPhire Terms of Service — rules and guidelines for using the PHP talent marketplace.',
  robots: { index: true, follow: false },
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', fontFamily: 'Inter, sans-serif', lineHeight: 1.8, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Last updated: Apr 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h2>
        <p>By accessing or using PHPhire, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Eligibility</h2>
        <p>You must be at least 18 years old to use PHPhire. By registering, you confirm that all information you provide is accurate and truthful.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. User Accounts</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You may not share your account with others.</li>
          <li>PHPhire reserves the right to suspend accounts that violate these terms.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Developer Profiles</h2>
        <p>Developers must only list genuine PHP skills and experience. Misrepresentation of qualifications may result in immediate account termination.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Job Postings</h2>
        <p>Recruiters must post only legitimate PHP-related job opportunities. Spam, misleading, or fraudulent job posts are strictly prohibited.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Payments and Refunds</h2>
        <p>All payments are processed via Razorpay. Subscription fees are non-refundable once the billing period has started. Contact us within 24 hours of payment for billing disputes.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Prohibited Conduct</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Scraping or harvesting user data</li>
          <li>Attempting to bypass authentication or security measures</li>
          <li>Posting offensive, discriminatory, or illegal content</li>
          <li>Using the platform for any purpose other than PHP talent hiring</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Limitation of Liability</h2>
        <p>PHPhire is a marketplace platform and is not responsible for the outcome of any hiring decisions, employment contracts, or disputes between developers and recruiters.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>9. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>10. Contact</h2>
        <p>For questions about these terms, open an issue on our GitHub repository.</p>
      </section>
    </main>
  )
}
