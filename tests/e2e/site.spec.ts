import { expect, test } from '@playwright/test'

// Read-only journeys: nothing here writes to the database.

const PAGES = [
  '/',
  '/properties',
  '/projects',
  '/agents',
  '/join',
  '/mortgage',
  '/pay-small-small',
  '/interior-design',
  '/furniture',
  '/sell',
  '/about',
  '/contact',
  '/support',
  '/privacy',
  '/terms',
]

test.describe('every public page', () => {
  for (const path of PAGES) {
    test(`${path} renders one h1, a title and no horizontal scroll`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      const res = await page.goto(path)
      expect(res?.status()).toBeLessThan(400)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page).toHaveTitle(/Akristal/)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
      expect(errors).toEqual([])
    })
  }
})

test('home search goes to listings with the chosen mode', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('radio', { name: 'Rent' }).click()
  await page.getByRole('search', { name: 'Search homes' }).getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/\/properties\?listing_type=rent/)
  await expect(page.locator('h1')).toHaveText(/Homes for rent/)
})

test('listings: filtering by area updates the URL and heading', async ({ page, isMobile }) => {
  await page.goto('/properties')
  if (isMobile) {
    await page.getByRole('button', { name: /Filters/ }).click()
    await page.getByRole('dialog', { name: 'Filters' }).getByLabel('Area', { exact: true }).selectOption('abuja')
  } else {
    await page.getByLabel('Area', { exact: true }).selectOption('abuja')
  }
  await expect(page).toHaveURL(/market=abuja/)
  await expect(page.locator('h1')).toHaveText(/in Abuja/)
})

test('listings: map view shows price pins', async ({ page }) => {
  await page.goto('/properties?view=map')
  await expect(page.locator('.ak-pin').first()).toBeVisible()
})

test('property page: viewing form explains what is missing', async ({ page }) => {
  await page.goto('/properties')
  const href = await page.locator('article h3 a').first().getAttribute('href')
  expect(href).toMatch(/^\/properties\/[0-9a-f-]{36}$/)
  await page.goto(href!)
  const form = page.locator('#book-viewing')
  await form.getByRole('button', { name: 'Request a viewing' }).click()
  await expect(form.getByRole('alert')).toContainText('Check the highlighted fields')
  await expect(form.getByText('Enter your name')).toBeVisible()
})

test('mortgage calculator responds to the deposit', async ({ page }) => {
  await page.goto('/mortgage')
  // The figure under the "Monthly payment" label (prices use a non-breaking space after the code).
  const result = page.locator('#calculator p:text-is("Monthly payment") + p span[aria-hidden]')
  const before = await result.textContent()
  await page.locator('#calculator').getByLabel('Deposit').fill('50')
  await expect(result).not.toHaveText(before ?? '')
})

test('Pay Small Small schedule has one row per month plus the deposit', async ({ page }) => {
  await page.goto('/pay-small-small')
  await page.getByRole('button', { name: '12 months' }).click()
  await expect(page.locator('#planner tbody tr')).toHaveCount(13)
})

test('furniture: product dialog pre-fills the WhatsApp order', async ({ page }) => {
  await page.goto('/furniture')
  await page.locator('ul button[aria-haspopup="dialog"]').first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const href = await dialog.getByRole('link', { name: /Order on WhatsApp/ }).getAttribute('href')
  expect(decodeURIComponent(href ?? '')).toContain("I'd like to order")
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('menu sheet opens, traps focus and closes on Escape', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('button', { name: /Menu|Open menu/ }).click()
  const sheet = page.getByRole('dialog', { name: 'Site menu' })
  await expect(sheet).toBeVisible()
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
})

test('saved homes persist across pages', async ({ page }) => {
  await page.goto('/properties')
  await page.getByRole('button', { name: /^Save / }).first().click()
  await page.goto('/saved')
  await expect(page.locator('article')).toHaveCount(1)
})

test('unknown pages return 404 with a way back', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.locator('#main').getByRole('link', { name: 'Homes for sale' })).toBeVisible()
})

test('SEO basics: sitemap, robots and structured data', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  expect(await sitemap.text()).toContain('/properties/')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Disallow: /admin')
  await page.goto('/')
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.join(' ')).toContain('RealEstateAgent')
})
