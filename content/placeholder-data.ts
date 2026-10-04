// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT: every record here is a stand-in until the client
// supplies the real thing (see PLAN.md §12). The site prefers database rows and
// only falls back to these. Each record carries `placeholder: true`, and pages
// show a visible "sample" note wherever one is displayed.
// ─────────────────────────────────────────────────────────────────────────────

import type { InstallmentPlan } from '@/lib/data/plans'

/** Pay Small Small: terms to be confirmed by Akristal (deposit, tenures, any premium). */
export const placeholderPlan: InstallmentPlan = {
  id: 'placeholder-standard',
  name: 'Pay Small Small',
  description: 'Pay a deposit, then spread the balance in equal monthly instalments, paid directly to Akristal.',
  minDepositPct: 30,
  tenures: [6, 12, 18, 24],
  premiumByTenure: { '6': 0, '12': 0, '18': 0, '24': 0 },
  eligibility: [
    'Valid national ID or passport',
    'Proof of income or a guarantor',
    'Signed sale agreement for an eligible home',
  ],
  termsUrl: null,
  placeholder: true,
}

/** Become an agent: commission model. SAMPLE FIGURES until Akristal confirms its agent agreement. */
export const agentProgramme = {
  placeholder: true,
  /** Typical commission charged on a sale, % of price */
  commissionPct: 3,
  tiers: [
    { name: 'Associate agent', share: 50, requirement: 'Your first year with Akristal' },
    { name: 'Senior agent', share: 60, requirement: 'Ten or more completed sales' },
    { name: 'Partner agent', share: 70, requirement: 'By invitation, for top performers' },
  ],
  faqs: [
    {
      q: 'Do I need a licence to apply?',
      a: 'Tell us what registration you hold in your country. Where a licence is required by law, you must hold it before you list homes with us.',
    },
    {
      q: 'Can I work part-time?',
      a: 'Yes. You are paid on completed sales, so you can start part-time and grow from there.',
    },
    {
      q: 'Which areas do you need agents in?',
      a: 'Kigali first, then Abuja and Lagos. We also take applications for Dubai, Kampala and South Africa.',
    },
    {
      q: 'Will I sell Akristal’s own developments?',
      a: 'Yes. Agents sell our developments alongside homes listed by private owners.',
    },
    {
      q: 'How long does the application take?',
      a: 'The form takes about five minutes. Our team reviews each application and contacts shortlisted applicants for an interview.',
    },
  ],
}
