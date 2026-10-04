import type { Metadata } from 'next'
import { site } from '@/config/site'

export const absoluteUrl = (path = '/') => new URL(path, site.url).toString()

/** Per-page metadata with canonical URL and matching Open Graph / Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: {
  title: string
  description: string
  path: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', siteName: site.name, images },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
    robots: noIndex ? { index: false, follow: true } : undefined,
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': absoluteUrl('/#organization'),
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: absoluteUrl('/brand/akristal-badge-512.webp'),
    image: absoluteUrl('/brand/akristal-badge-512.webp'),
    email: site.email,
    telephone: site.phone.href.replace('tel:', ''),
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'KK 15 Rd',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    areaServed: ['Rwanda', 'Nigeria', 'United Arab Emirates', 'Uganda', 'South Africa'],
    sameAs: site.socials.map((s) => s.href),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    publisher: { '@id': absoluteUrl('/#organization') },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/properties')}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
