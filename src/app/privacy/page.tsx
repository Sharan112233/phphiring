'use client'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
          Privacy Policy
        </h2>

        <div style={{ display: 'grid', gap: 24 }}>
          <p style={{ fontSize: 16, color: '#3D3558', lineHeight: 1.8 }}>
            We value your privacy and are committed to protecting your personal information.
          </p>

          <div>
            <h2 style={{ fontWeight: 700 }}>Information We Collect</h2>
            <p style={{ color: '#3D3558' }}>
              We may collect basic information like name, email, and usage data.
            </p>
          </div>

          <div>
            <h2 style={{ fontWeight: 700 }}>How We Use Information</h2>
            <p style={{ color: '#3D3558' }}>
              To improve our services, enhance user experience, and communicate updates.
            </p>
          </div>

          <div>
            <h2 style={{ fontWeight: 700 }}>Cookies</h2>
            <p style={{ color: '#3D3558' }}>
              We use cookies to improve performance and analyze traffic.
            </p>
          </div>

          <div>
            <h2 style={{ fontWeight: 700 }}>Third-Party Services</h2>
            <p style={{ color: '#3D3558' }}>
              We may use services like Google AdSense which use cookies to show ads.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}