'use client'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>About PHP Jobs</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Our Mission</h2>
            <p style={{ fontSize: 16, color: '#3D3558', lineHeight: 1.8 }}>
              To connect talented PHP developers with businesses looking for skilled professionals. We believe in creating opportunities and building meaningful connections in the tech community.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>What We Do</h2>
            <p style={{ fontSize: 16, color: '#3D3558', lineHeight: 1.8 }}>
              PHP Jobs is a platform that brings together developers and businesses. Developers can showcase their skills and find work they love. Businesses can find talented PHP developers to build their projects.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Why Choose Us</h2>
            <p style={{ fontSize: 16, color: '#3D3558', lineHeight: 1.8 }}>
              We focus on quality over quantity. Every developer on our platform is verified and professional. We make it easy for businesses to find the right talent and for developers to find meaningful work.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}