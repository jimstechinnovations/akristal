import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/adminProperties',
          '/agent/',
          '/buyer/',
          '/seller/',
          '/dashboard',
          '/messages',
          '/payments',
          '/profile',
          '/settings',
          '/complete-profile',
          '/verify-otp',
          '/reset-password',
          '/forgot-password',
          '/unauthorized',
          '/api/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
