export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'
  const now = new Date()

  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/jobs', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/browse', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/agencies', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/resources', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/join', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/disclaimer', priority: 0.4, changeFrequency: 'yearly' as const },
  ]

  const blogPosts = [
    'how-to-hire-php-developer',
    'laravel-vs-symfony-2025',
    'php-developer-salary-india-2025',
    'php-developer-portfolio-tips',
    'wordpress-vs-headless-cms',
    'sugarcrm-vtiger-php-developer',
  ]

  return [
    ...staticPages.map(({ url, priority, changeFrequency }) => ({
      url: `${baseUrl}${url}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...blogPosts.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
