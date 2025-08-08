import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      }
    ],
    sitemap: 'https://vanier-schedule-maker-2.vercel.app/sitemap.xml',
  }
}
