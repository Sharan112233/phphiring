import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Blog — PHP Developer Insights & Hiring Tips',
  description: 'Expert articles on PHP development, Laravel, Symfony, WordPress, hiring PHP talent, and growing your PHP career.',
  openGraph: {
    title: 'PHPhire Blog — PHP Developer Insights & Hiring Tips',
    description: 'Expert articles on PHP development, hiring PHP talent, and growing your PHP career.',
  },
}

const posts = [
  {
    slug: 'how-to-hire-php-developer',
    category: 'Hiring Guide',
    categoryColor: '#7C3AED',
    title: 'How to Hire a PHP Developer in 2025: The Complete Guide',
    excerpt: 'From writing the job description to evaluating technical skills — everything recruiters need to know to hire the right PHP developer for their team.',
    author: 'PHPhire Team',
    date: 'June 10, 2025',
    readTime: '8 min read',
    emoji: '🎯',
  },
  {
    slug: 'laravel-vs-symfony-2025',
    category: 'PHP Frameworks',
    categoryColor: '#059669',
    title: 'Laravel vs Symfony in 2025: Which Framework Should You Choose?',
    excerpt: 'A practical comparison of Laravel and Symfony for modern PHP projects — performance, ecosystem, learning curve, and when to use each.',
    author: 'PHPhire Team',
    date: 'June 5, 2025',
    readTime: '6 min read',
    emoji: '⚡',
  },
  {
    slug: 'php-developer-salary-india-2025',
    category: 'Salary & Career',
    categoryColor: '#D97706',
    title: 'PHP Developer Salary in India 2025: Framework-wise Breakdown',
    excerpt: 'Detailed salary data for Laravel, Symfony, WordPress, and CRM developers across experience levels and cities in India.',
    author: 'PHPhire Team',
    date: 'May 28, 2025',
    readTime: '5 min read',
    emoji: '💰',
  },
  {
    slug: 'php-developer-portfolio-tips',
    category: 'Career Tips',
    categoryColor: '#2563EB',
    title: '7 Things Every PHP Developer Portfolio Must Have in 2025',
    excerpt: 'Stand out to recruiters with a portfolio that showcases real PHP projects, clean code, and the frameworks that matter most to hiring teams.',
    author: 'PHPhire Team',
    date: 'May 20, 2025',
    readTime: '4 min read',
    emoji: '📁',
  },
  {
    slug: 'wordpress-vs-headless-cms',
    category: 'PHP Frameworks',
    categoryColor: '#059669',
    title: 'WordPress vs Headless CMS: What PHP Developers Need to Know',
    excerpt: 'As headless architecture grows, PHP developers must understand when to stick with WordPress and when to go headless with a REST or GraphQL API.',
    author: 'PHPhire Team',
    date: 'May 12, 2025',
    readTime: '7 min read',
    emoji: '🌐',
  },
  {
    slug: 'sugarcrm-vtiger-php-developer',
    category: 'CRM Development',
    categoryColor: '#DC2626',
    title: 'SugarCRM vs Vtiger: A PHP Developer\'s Comparison',
    excerpt: 'Both CRMs are PHP-based and highly customisable. Here\'s what PHP developers need to know about working with each platform.',
    author: 'PHPhire Team',
    date: 'May 5, 2025',
    readTime: '6 min read',
    emoji: '🔧',
  },
]

const featured = posts[0]
const rest = posts.slice(1)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'PHPhire Blog',
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'}/blog`,
  description: 'Expert articles on PHP development, hiring PHP talent, and growing your PHP career.',
  blogPost: posts.map(p => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    author: { '@type': 'Organization', name: p.author },
    datePublished: p.date,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://phphiring-lac.vercel.app/'}/blog/${p.slug}`,
  })),
}

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1a0f3f 0%, #2d1b4e 100%)', padding: '64px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(124,58,237,0.2)', border: '1px solid #7C3AED', borderRadius: 24, color: '#D8B4FE', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
              PHP Insights
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              PHPhire Blog
            </h1>
            <p style={{ fontSize: 16, color: '#D1D5DB', margin: 0, lineHeight: 1.6 }}>
              Hiring guides, framework comparisons, salary data, and career tips for the PHP community.
            </p>
          </div>
        </section>

        <section style={{ background: '#f9fafb', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Featured post */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Featured Article</p>
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '36px 40px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center', transition: 'box-shadow 0.15s' }}>
                  <div>
                    <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(124,58,237,0.1)', color: featured.categoryColor, borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                      {featured.category}
                    </span>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F0A1E', margin: '0 0 12px 0', lineHeight: 1.3 }}>{featured.title}</h2>
                    <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, margin: '0 0 20px 0' }}>{featured.excerpt}</p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9ca3af' }}>
                      <span>{featured.author}</span>
                      <span>·</span>
                      <span>{featured.date}</span>
                      <span>·</span>
                      <span>{featured.readTime}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 80, lineHeight: 1, flexShrink: 0 }}>{featured.emoji}</div>
                </div>
              </Link>
            </div>

            {/* Rest of posts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {rest.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <article style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '28px 24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 40, lineHeight: 1 }}>{post.emoji}</div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: post.categoryColor, background: `${post.categoryColor}15`, width: 'fit-content' }}>
                      {post.category}
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F0A1E', margin: 0, lineHeight: 1.4 }}>{post.title}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0, flex: 1 }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #1a0f3f 0%, #2d1b4e 100%)', padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 12px 0' }}>Ready to hire PHP talent?</h2>
            <p style={{ fontSize: 15, color: '#D1D5DB', margin: '0 0 28px 0' }}>Join 1,200+ verified PHP developers and hundreds of recruiters on PHPhire.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/join" style={{ padding: '13px 28px', background: '#7C3AED', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Get Started Free →</Link>
              <Link href="/jobs" style={{ padding: '13px 28px', background: 'transparent', color: '#fff', border: '1px solid #7C3AED', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Browse PHP Jobs</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
