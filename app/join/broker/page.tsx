import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { ApplicationForm } from '@/components/join/application-form'
import { buttonClasses } from '@/components/ui/button'

export const metadata: Metadata = pageMetadata({
  title: 'Register a broker company',
  description:
    'Broker companies can register with The Akristal Group (TAG) to sell Akristal Developments, list their clients’ homes and appear on the Akristal Brokers page.',
  path: '/join/broker',
})

export const revalidate = 300

export default async function BrokerJoinPage() {
  const copy = await getCopy('join-broker')
  const benefits = copy.list('benefits')
  const steps = copy.list('steps.items')
  return (
    <>
      <header className="page-x pb-10 pt-10 sm:pt-14">
        <p className="text-sm text-muted">
          <Link href="/join" className="hover:text-ink hover:underline">
            Become an agent
          </Link>{' '}
          or register a company
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-display-l font-medium">{copy.t('hero.title')}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {copy.t('hero.intro')}
        </p>
      </header>

      <div className="page-x -mt-4 pb-12">
        <div className="flex flex-col gap-4 rounded-md border border-line bg-page-alt p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{copy.t('account.title')}</p>
            <p className="mt-1 max-w-xl text-[0.9375rem] text-muted">{copy.t('account.text')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register?role=broker" className={buttonClasses()}>
              {copy.t('account.cta')}
            </Link>
            <Link href="/login" className={buttonClasses({ variant: 'outline' })}>
              Log in
            </Link>
          </div>
        </div>
      </div>

      <section aria-labelledby="benefits-title" className="page-x pb-16">
        <h2 id="benefits-title" className="sr-only">
          What registered brokers get
        </h2>
        <dl className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="border-t border-line pt-5">
              <dt className="text-lg font-semibold">{b.title}</dt>
              <dd className="mt-1.5 max-w-md text-[0.9375rem] leading-relaxed text-muted">{b.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="steps-title" className="border-t border-line bg-page-alt section-y">
        <div className="page-x">
          <h2 id="steps-title" className="font-display text-display-m font-medium">
            {copy.t('steps.title')}
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-primary pt-5">
                <span className="tabular text-sm text-muted">Step {i + 1}</span>
                <p className="mt-1 text-lg font-semibold">{s.title}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-20 section-y">
        <div className="page-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="apply-title" className="font-display text-display-m font-medium">
              {copy.t('apply.title')}
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{copy.t('apply.intro')}</p>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <ApplicationForm kind="broker" />
          </div>
        </div>
      </section>
    </>
  )
}
