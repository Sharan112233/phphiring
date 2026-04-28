import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with PHPhire — support, partnerships, billing, or general enquiries for the PHP talent marketplace.',
  openGraph: {
    title: 'Contact PHPhire',
    description: 'Reach out to the PHPhire team for support, partnerships, or any questions.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact PHPhire',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'}/contact`,
    description: 'Contact the PHPhire team for support, partnerships, or general enquiries.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
