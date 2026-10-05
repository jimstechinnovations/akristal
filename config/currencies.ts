// Every currency a price can be listed in or shown in. US dollar, naira and Rwandan franc
// come first, then the world currencies buyers ask for most, then every African currency.

export type CurrencyInfo = { code: string; name: string; group: 'Main' | 'World' | 'Africa' }

const main: CurrencyInfo[] = [
  { code: 'USD', name: 'US dollar', group: 'Main' },
  { code: 'NGN', name: 'Nigerian naira', group: 'Main' },
  { code: 'RWF', name: 'Rwandan franc', group: 'Main' },
]

const world: CurrencyInfo[] = [
  { code: 'EUR', name: 'Euro', group: 'World' },
  { code: 'GBP', name: 'British pound', group: 'World' },
  { code: 'AED', name: 'UAE dirham', group: 'World' },
  { code: 'SAR', name: 'Saudi riyal', group: 'World' },
  { code: 'QAR', name: 'Qatari riyal', group: 'World' },
  { code: 'CNY', name: 'Chinese yuan', group: 'World' },
  { code: 'JPY', name: 'Japanese yen', group: 'World' },
  { code: 'INR', name: 'Indian rupee', group: 'World' },
  { code: 'CAD', name: 'Canadian dollar', group: 'World' },
  { code: 'AUD', name: 'Australian dollar', group: 'World' },
  { code: 'CHF', name: 'Swiss franc', group: 'World' },
  { code: 'TRY', name: 'Turkish lira', group: 'World' },
  { code: 'BRL', name: 'Brazilian real', group: 'World' },
]

const africa: CurrencyInfo[] = [
  { code: 'DZD', name: 'Algerian dinar' },
  { code: 'AOA', name: 'Angolan kwanza' },
  { code: 'XOF', name: 'West African CFA franc' },
  { code: 'BWP', name: 'Botswana pula' },
  { code: 'BIF', name: 'Burundian franc' },
  { code: 'CVE', name: 'Cape Verdean escudo' },
  { code: 'XAF', name: 'Central African CFA franc' },
  { code: 'KMF', name: 'Comorian franc' },
  { code: 'CDF', name: 'Congolese franc' },
  { code: 'DJF', name: 'Djiboutian franc' },
  { code: 'EGP', name: 'Egyptian pound' },
  { code: 'ERN', name: 'Eritrean nakfa' },
  { code: 'SZL', name: 'Eswatini lilangeni' },
  { code: 'ETB', name: 'Ethiopian birr' },
  { code: 'GMD', name: 'Gambian dalasi' },
  { code: 'GHS', name: 'Ghanaian cedi' },
  { code: 'GNF', name: 'Guinean franc' },
  { code: 'KES', name: 'Kenyan shilling' },
  { code: 'LSL', name: 'Lesotho loti' },
  { code: 'LRD', name: 'Liberian dollar' },
  { code: 'LYD', name: 'Libyan dinar' },
  { code: 'MGA', name: 'Malagasy ariary' },
  { code: 'MWK', name: 'Malawian kwacha' },
  { code: 'MRU', name: 'Mauritanian ouguiya' },
  { code: 'MUR', name: 'Mauritian rupee' },
  { code: 'MAD', name: 'Moroccan dirham' },
  { code: 'MZN', name: 'Mozambican metical' },
  { code: 'NAD', name: 'Namibian dollar' },
  { code: 'STN', name: 'São Tomé and Príncipe dobra' },
  { code: 'SCR', name: 'Seychellois rupee' },
  { code: 'SLE', name: 'Sierra Leonean leone' },
  { code: 'SOS', name: 'Somali shilling' },
  { code: 'ZAR', name: 'South African rand' },
  { code: 'SSP', name: 'South Sudanese pound' },
  { code: 'SDG', name: 'Sudanese pound' },
  { code: 'TZS', name: 'Tanzanian shilling' },
  { code: 'TND', name: 'Tunisian dinar' },
  { code: 'UGX', name: 'Ugandan shilling' },
  { code: 'ZMW', name: 'Zambian kwacha' },
  { code: 'ZWG', name: 'Zimbabwe gold' },
].map((c) => ({ ...c, group: 'Africa' as const }))

export const CURRENCY_LIST: CurrencyInfo[] = [...main, ...world, ...africa]
export const CURRENCY_CODES = CURRENCY_LIST.map((c) => c.code)
export const currencyName = (code: string) => CURRENCY_LIST.find((c) => c.code === code)?.name ?? code

/** Shown under a price as quick conversions on listing pages. */
export const QUICK_CURRENCIES = ['USD', 'NGN', 'RWF'] as const
