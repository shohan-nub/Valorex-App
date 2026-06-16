import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://valorexbd.com',
      lastModified: new Date(),
    },
  ]
}