export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/post-job/',
          '/notifications/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
