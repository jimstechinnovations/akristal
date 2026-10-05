import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/config/site'
import { pageMetadata } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { buttonClasses } from '@/components/ui/button'
import { Faq } from '@/components/ui/faq'

export const metadata: Metadata = pageMetadata({
  title: 'Help',
  description: 'Answers to common questions about listing, buying, saving homes, payments and accounts on the Akristal website.',
  path: '/support',
})

// Carried over from the previous help page and updated for the new site.
const groups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Buying and renting',
    items: [
      { q: 'How do I contact a seller or agent?', a: 'Open any home and use WhatsApp, Call or Book a viewing. Signed-in buyers can also message the seller from their account.' },
      { q: 'How do I save homes?', a: 'Tap the heart on any home. Saved homes are kept on this device; see them any time on the Saved homes page.' },
      { q: 'Are the monthly figures exact?', a: 'No. Mortgage and Pay Small Small figures are estimates to help you plan. Your lender or Pay Small Small agreement sets the final amounts.' },
    ],
  },
  {
    title: 'Selling and listing',
    items: [
      { q: 'How do I list a property?', a: 'Create an account as a seller or agent, open your dashboard and choose New listing. Add the details and photos, then submit it for approval. Or ask for a valuation and an Akristal broker or agent will list it for you.' },
      { q: 'How long does approval take?', a: 'Listings are reviewed by the Akristal team before they go live, typically within 24 to 48 hours. You get an email when a listing is approved or needs changes.' },
      { q: 'Can I edit a listing after it is live?', a: 'Yes, from your seller or agent dashboard. Significant changes may need approval again.' },
    ],
  },
  {
    title: 'Payments and accounts',
    items: [
      { q: 'What payment methods are accepted?', a: 'Bank transfer, with your bank statement attached as proof of payment. Other methods are planned.' },
      { q: 'How is my account verified?', a: 'The Akristal team verifies accounts. Complete your profile with accurate details to speed this up.' },
    ],
  },
]

export default function SupportPage() {
  return (
    <>
      <header className="page-x pb-6 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">Help</h1>
        <p className="mt-3 max-w-xl text-base text-muted">Quick answers to the questions we hear most. Can&apos;t find yours? Message us.</p>
      </header>
      <div className="page-x grid gap-14 pb-20 pt-6">
        {groups.map((g) => (
          <section key={g.title} aria-labelledby={`h-${g.title}`}>
            <h2 id={`h-${g.title}`} className="mb-4 font-display text-display-s font-medium">
              {g.title}
            </h2>
            <Faq items={g.items} />
          </section>
        ))}
        <section className="rounded-md bg-page-alt p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="mt-1 text-[0.9375rem] text-muted">
            Email {site.email} or theakristalgroup@gmail.com, or call {site.phone.label}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={whatsappLink('Hello Akristal, I need help with the website.')} className={buttonClasses()}>
              WhatsApp us
            </a>
            <Link href="/contact" className={buttonClasses({ variant: 'outline' })}>
              All contact details
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
