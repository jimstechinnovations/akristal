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
