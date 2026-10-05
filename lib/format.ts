// Currency-aware formatting. Each listing keeps its own currency; never assume RWF.

const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string, compact: boolean, whole: boolean) {
  const key = `${currency}|${compact}|${whole}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : whole ? 0 : minorUnits(currency),
      minimumFractionDigits: 0,
    })
    formatters.set(key, f)
  }
  return f
}

/** Number of decimal places a currency uses (RWF/UGX: 0, NGN/USD/ZAR: 2). */
export function minorUnits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

/** "RWF 120,000,000" or, compact, "RWF 120M". Intl puts a non-breaking space after the code. */
export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = 'RWF',
  opts: { compact?: boolean } = {}
): string {
  if (amount == null || Number.isNaN(amount)) return 'Price on request'
  const code = (currency || 'RWF').toUpperCase()
  try {
    // Cents are noise on property prices; keep them only for small amounts.
    return getFormatter(code, !!opts.compact, Math.abs(amount) >= 1000).format(amount)
  } catch {
    return `${code} ${Math.round(amount).toLocaleString('en')}`
  }
}

export function formatArea(sqm: number | null | undefined): string | null {
  if (sqm == null) return null
  return `${Math.round(sqm).toLocaleString('en')} m²`
}

/** 6 → "6 months", 12 → "1 year", 18 → "18 months", 60 → "5 years" */
export function formatTenure(months: number) {
  if (months >= 12 && months % 12 === 0) return plural(months / 12, 'year')
  return plural(months, 'month')
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

export function formatDate(date: string | Date, style: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  }).format(new Date(date))
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])

/**
 * Titles typed in ALL CAPS read as shouting; show them in title case.
 * Mixed-case titles are left exactly as the agent wrote them. Short codes (BQ, DLD, CBD) stay upper case.
 */
export function tidyTitle(raw: string) {
  const title = raw.replace(/\s+/g, ' ').trim()
  const letters = title.replace(/[^A-Za-z]/g, '')
  if (letters.length < 8 || letters.replace(/[^A-Z]/g, '').length / letters.length < 0.7) return title
  return title
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (/^(bq|dld|cbd|vi|mbr|jvc|ii|iii)$/.test(word)) return word.toUpperCase()
      if (i > 0 && SMALL_WORDS.has(word)) return word
      return word.replace(/^([("']?)(\p{L})/u, (_, p, c) => p + c.toUpperCase())
    })
    .join(' ')
}
