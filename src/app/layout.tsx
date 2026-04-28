
import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'

export const metadata: Metadata = {
  title: {
    default: 'PHPhire — Find Verified PHP Experts',
    template: '%s | PHPhire',
  },
  description:
    'The world\'s only PHP-first talent marketplace. Find Laravel, Symfony, WordPress, CRM developers filtered by framework, stack, location and more. 1,200+ verified PHP experts.',
  keywords: [
    'PHP developers',
    'Laravel developers',
    'hire PHP developer',
    'PHP jobs',
    'PHP talent',
    'Symfony developer',
    'WordPress developer',
    'SugarCRM developer',
    'Vtiger developer',
    'PHP freelancer',
    'PHP agency',
  ],
  authors: [{ name: 'PHPhire' }],
  creator: 'PHPhire',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'PHPhire',
    title: 'PHPhire — Find Verified PHP Experts',
    description:
      'PHP-first talent marketplace. 1,200+ verified developers filtered by framework, CRM, location and more.',
    locale: 'en_US',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PHPhire — Find Verified PHP Experts',
    description: 'PHP-first talent marketplace. Find Laravel, Symfony, WordPress, CRM developers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  // Replace the content value below with your actual Google Search Console verification code
  // verification: {
  //   google: 'your-google-site-verification-code',
  // },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PHPhire',
  url: baseUrl,
  description: 'The world\'s only PHP-first talent marketplace.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/jobs?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PHPhire',
  url: baseUrl,
  description: 'PHP talent marketplace connecting businesses with verified PHP experts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Razorpay checkout script — loaded once globally */}
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
