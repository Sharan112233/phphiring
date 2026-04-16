'use client'

import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

// Static resources - these are external links and don't need API
const RESOURCES = [
  {
    category: 'Documentation',
    items: [
      {
        title: 'PHP Docs',
        description: 'Official PHP documentation',
        url: 'https://www.php.net/docs.php',
      },
      {
        title: 'Laravel Docs',
        description: 'Laravel framework docs',
        url: 'https://laravel.com/docs',
      },
      {
        title: 'Symfony Docs',
        description: 'Symfony framework documentation',
        url: 'https://symfony.com/doc/current/',
      },
      {
        title: 'WordPress Codex',
        description: 'WordPress plugin & theme development',
        url: 'https://developer.wordpress.org/',
      },
    ],
  },
  {
    category: 'Tools & Services',
    items: [
      {
        title: 'Composer',
        description: 'PHP package manager',
        url: 'https://getcomposer.org/',
      },
      {
        title: 'Laravel Forge',
        description: 'Server management for Laravel apps',
        url: 'https://forge.laravel.com/',
      },
      {
        title: 'PHPUnit',
        description: 'PHP testing framework',
        url: 'https://phpunit.de/',
      },
      {
        title: 'Xdebug',
        description: 'PHP debugging and profiling',
        url: 'https://xdebug.org/',
      },
    ],
  },
  {
    category: 'Learning Resources',
    items: [
      {
        title: 'Laracasts',
        description: 'Laravel and PHP video tutorials',
        url: 'https://laracasts.com/',
      },
      {
        title: 'PHP: The Right Way',
        description: 'PHP best practices guide',
        url: 'https://phptherightway.com/',
      },
      {
        title: 'StackOverflow',
        description: 'PHP community Q&A',
        url: 'https://stackoverflow.com/questions/tagged/php',
      },
      {
        title: 'Dev.to',
        description: 'PHP development articles',
        url: 'https://dev.to/search?q=php',
      },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <>
      <Navbar />

      <main style={{
        background: '#FAFAF9',
        minHeight: '80vh',
        paddingTop: 40,
        paddingBottom: 60,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 12,
            }}>
              PHP Resources
            </h1>
            <p style={{
              fontSize: 16,
              color: '#666',
              maxWidth: 600,
            }}>
              Curated collection of tools, documentation, and learning resources
              for PHP developers. Whether you're learning Laravel, Symfony,
              WordPress, or core PHP, find everything you need here.
            </p>
          </div>

          {/* Resources Grid */}
          {RESOURCES.map((section) => (
            <div key={section.category} style={{ marginBottom: 48 }}>
              <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 24,
                color: '#111',
              }}>
                {section.category}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}>
                {section.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: 24,
                      background: '#fff',
                      border: '1px solid #E8E4F0',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}>
                      {item.title} →
                    </h3>
                    <p style={{
                      fontSize: 14,
                      color: '#666',
                      lineHeight: 1.6,
                    }}>
                      {item.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* CTA Section */}
          <div style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            color: '#fff',
            marginTop: 48,
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Ready to showcase your PHP skills?
            </h2>
            <p style={{
              fontSize: 16,
              marginBottom: 24,
              opacity: 0.9,
            }}>
              Join thousands of PHP developers on PHPhire
            </p>
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
            }}>
              <Link
                href="/auth/login"
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#7C3AED',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Get Started
              </Link>
              <Link
                href="/browse"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Browse Talent
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}