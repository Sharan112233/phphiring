import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Career Bridge',
  description:
    'Learn about Career Bridge — a platform providing job updates, interview preparation, and career guidance for freshers and job seekers.',
  robots: { index: true, follow: true },
}

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 24px',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.8,
        color: '#1a1a1a',
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        About Career Bridge
      </h1>
      <p style={{ color: '#666', marginBottom: 40 }}>
        Helping freshers and job seekers build successful careers
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          1. Our Mission
        </h2>
        <p>
          Career Bridge is built with a mission to simplify the job search process
          for students, freshers, and professionals. We aim to provide reliable
          job opportunities, practical career guidance, and easy-to-understand
          resources to help users achieve their career goals.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          2. What We Offer
        </h2>
        <p>
          Our platform provides curated job listings, interview preparation
          content, resume-building tips, and skill-based learning resources. We
          focus on delivering content that is useful, practical, and relevant to
          today’s job market.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          3. Who This Platform Is For
        </h2>
        <p>
          Career Bridge is designed for fresh graduates, students, and job
          seekers who are looking for their first job or planning to grow in
          their careers. Whether you are preparing for interviews or searching
          for job opportunities, this platform is built to support you.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          4. Our Vision
        </h2>
        <p>
          We aim to become a trusted career platform that not only provides job
          listings but also empowers users with the knowledge and confidence
          needed to succeed in interviews and professional environments.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          5. Continuous Improvement
        </h2>
        <p>
          We are constantly improving our platform by adding new features,
          better job opportunities, and high-quality content to enhance user
          experience and provide more value.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          6. Contact
        </h2>
        <p>
          If you have any questions, suggestions, or feedback, please visit our
          Contact page.
        </p>
      </section>
    </main>
  )
}