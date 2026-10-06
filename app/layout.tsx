import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { site } from '@/config/site'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { getSettings } from '@/lib/data/settings'
import { getRates } from '@/lib/data/rates'
import { getCopy } from '@/lib/data/copy'
import { CurrencyProvider } from '@/components/currency/currency-provider'
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
    default: 'The Akristal Group (TAG) | Homes across Africa and beyond',
    template: '%s | The Akristal Group (TAG)',
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
    title: 'The Akristal Group (TAG) | Homes across Africa and beyond',
    description: site.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Akristal Group (TAG) | Homes across Africa and beyond',
    description: site.description,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#14100e',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ contact }, rates, copy] = await Promise.all([getSettings(), getRates(), getCopy('site')])
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${display.variable} ${sans.variable} antialiased`}>
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
            <CurrencyProvider rates={rates?.rates ?? null}>
            <SiteHeader phones={contact.headerPhones} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter contact={contact} blurb={copy.t('footer.blurb')} />
            <WhatsAppFab number={contact.whatsapp} message={copy.t('whatsapp.message')} label={copy.t('whatsapp.label')} />
            <Toaster
              position="top-center"
              toastOptions={{
                className: '!rounded-sm !bg-surface !text-ink !border !border-line !shadow-pop',
              }}
            />
            </CurrencyProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
