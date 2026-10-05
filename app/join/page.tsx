import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCopy } from '@/lib/data/copy'
import { getSettings } from '@/lib/data/settings'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { Faq } from '@/components/ui/faq'
import { EarningsEstimator } from '@/components/join/earnings-estimator'
import { ApplicationForm } from '@/components/join/application-form'

export const metadata: Metadata = pageMetadata({
  title: 'Become an Akristal agent',
  description:
    'Sell Akristal developments and homes across Kigali, Abuja and Lagos. See how commission works, what we provide, the requirements and how to apply.',
  path: '/join',
})

export const revalidate = 300

export default async function JoinPage() {
  const [{ agent_programme: agentProgramme }, copy] = await Promise.all([getSettings(), getCopy('join')])
  const reasons = copy.list('why.items')
  const requirements = copy.list('requirements.items').map((r) => r.text)
  const steps = copy.list('steps.items')
  return (
    <>
      <section className="grid lg:min-h-[78svh] lg:grid-cols-2">
        <div className="flex items-center px-4 py-14 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <h1 className="font-display text-display-l font-medium">{copy.t('hero.title')}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {copy.t('hero.intro')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className={buttonClasses({ size: 'lg' })}>
                Apply now
              </a>
              <a href="#earnings" className={buttonClasses({ size: 'lg', variant: 'outline' })}>
                See how you earn
              </a>
            </div>
            <p className="mt-6 text-[0.9375rem] text-muted">
              Run a broker company?{' '}
              <Link href="/join/broker" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Register it with Akristal
              </Link>
            </p>
          </div>
        </div>
        <div className="relative min-h-[300px]">
          <Image src={copy.t('hero.image')} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="why-title" className="page-x section-y">
        <h2 id="why-title" className="max-w-2xl font-display text-display-m font-medium">
          {copy.t('why.title')}
        </h2>
        <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {reasons.map((r) => (
            <div key={r.title} className="border-t border-line pt-6">
              <dt className="text-xl font-semibold">{r.title}</dt>
              <dd className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">{r.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="earnings" aria-labelledby="earn-title" className="scroll-mt-24 bg-page-alt section-y">
        <div className="page-x">
          <div className="max-w-2xl">
            <h2 id="earn-title" className="font-display text-display-m font-medium">
              {copy.t('earn.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {copy.t('earn.intro', { commission: agentProgramme.commissionPct })}
            </p>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-strong text-sm text-muted">
                  <th className="py-3 pr-6 font-normal">Level</th>
                  <th className="py-3 pr-6 font-normal">Your share of the commission</th>
                  <th className="py-3 pr-6 font-normal">Of the sale price</th>
                  <th className="py-3 font-normal">How you get there</th>
                </tr>
              </thead>
              <tbody>
                {agentProgramme.tiers.map((t) => (
                  <tr key={t.name} className="border-b border-line">
                    <td className="py-4 pr-6 font-medium">{t.name}</td>
                    <td className="tabular py-4 pr-6 text-2xl font-light">{t.share}%</td>
                    <td className="tabular py-4 pr-6 text-2xl font-light">{+((agentProgramme.commissionPct * t.share) / 100).toFixed(2)}%</td>
                    <td className="py-4 text-[0.9375rem] text-muted">{t.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agentProgramme.tiers.length > 0 && (
          <div className="mt-10">
            <EarningsEstimator commissionPct={agentProgramme.commissionPct} tiers={agentProgramme.tiers} />
          </div>
          )}
        </div>
      </section>

      <section aria-labelledby="req-title" className="page-x section-y grid gap-14 lg:grid-cols-2">
        <div>
          <h2 id="req-title" className="font-display text-display-m font-medium">
            {copy.t('requirements.title')}
          </h2>
          <ul className="mt-8 grid gap-4">
            {requirements.map((r) => (
              <li key={r} className="flex gap-3 border-b border-line pb-4 text-[0.9375rem]">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-display-m font-medium">{copy.t('steps.title')}</h2>
          {/* A genuine sequence, so numbered. */}
          <ol className="mt-8 grid gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className="tabular font-display text-4xl leading-none text-muted">{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold">{s.title}</p>
                  <p className="mt-1 text-[0.9375rem] text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {agentProgramme.faqs.length > 0 && (
        <section aria-labelledby="faq-title" className="page-x pb-20">
          <h2 id="faq-title" className="mb-8 font-display text-display-m font-medium">
            {copy.t('faq.title')}
          </h2>
          <Faq items={agentProgramme.faqs} />
        </section>
      )}

      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-20 border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="apply-title" className="font-display text-display-m font-medium">
              {copy.t('apply.title')}
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{copy.t('apply.intro')}</p>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <ApplicationForm />
          </div>
        </div>
      </section>
    </>
  )
}
