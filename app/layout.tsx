import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { site } from '@/config/site'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { ThemeProvider, themeInitScript } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsAppFab } from '@/components/layout/whatsapp-fab'
import { JsonLd } from '@/components/seo/json-ld'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'The Akristal Group | Homes in Kigali and across Africa',
    template: '%s | The Akristal Group',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'Kigali real estate',
    'houses for sale in Kigali',
    'apartments for rent Kigali',
    'Rwanda property developer',
    'Abuja property',
    'Pay Small Small',
    'interior design Kigali',
    'furniture Kigali',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: site.name,
    title: 'The Akristal Group | Homes in Kigali and across Africa',
    description: site.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Akristal Group | Homes in Kigali and across Africa',
    description: site.description,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#14100e' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-svh flex-col overflow-x-clip bg-page text-ink">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <MotionProvider>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <WhatsAppFab />
            <Toaster
              position="top-center"
              toastOptions={{
                className: '!rounded-sm !bg-surface !text-ink !border !border-line !shadow-pop',
              }}
            />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
