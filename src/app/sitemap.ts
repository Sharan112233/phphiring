export default function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/agencies`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/talent`,
      lastModified: new Date(),
    },
  ]
}