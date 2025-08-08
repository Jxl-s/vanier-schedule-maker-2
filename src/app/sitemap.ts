import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://vanier-schedule-maker-2.vercel.app',
      lastModified: new Date(),
    },
  ]
}
