import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            PHP<span>hire</span>
          </Link>
          <p className={styles.brandDesc}>
            The world&apos;s only PHP-first talent marketplace.
            Connecting businesses with verified PHP experts since 2025.
          </p>
          <div className={styles.social}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              X
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              in
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              gh
            </a>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>For Businesses</div>
          <Link href="/browse"             className={styles.link}>Find PHP Talent</Link>
          <Link href="/agencies"           className={styles.link}>Browse Agencies</Link>
          <Link href="/post-job"           className={styles.link}>Post a Job</Link>
          <Link href="/dashboard/payments" className={styles.link}>Pricing</Link>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>For Developers</div>
          <Link href="/auth/login"        className={styles.link}>Join as Talent</Link>
          <Link href="/jobs"              className={styles.link}>Browse Jobs</Link>
          <Link href="/dashboard"         className={styles.link}>Dashboard</Link>
          <Link href="/dashboard/profile" className={styles.link}>Edit Profile</Link>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Company</div>
          <Link href="/about"   className={styles.link}>About</Link>
          <Link href="/blog"    className={styles.link}>Blog</Link>
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
          <Link href="/terms"   className={styles.link}>Terms of Service</Link>
          <Link href="/contact" className={styles.link}>Contact Us</Link>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <p>
            {`© ${new Date().getFullYear()} PHPhire. Made with love for the PHP community.`}
          </p>
        </div>
        <div className={styles.bottomRight}>
          <span className={styles.bottomBadge}>Razorpay</span>
          <span className={styles.bottomBadge}>Nodemailer</span>
          <span className={styles.bottomBadge}>Supabase</span>
        </div>
      </div>

    </footer>
  )
}