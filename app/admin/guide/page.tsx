import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { Prose } from '@/components/ui/prose'

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'basics',
    title: 'The basics',
    body: (
      <>
        <p>
          The public website reads everything from the database. When you save something in the admin, the page it appears on updates within
          seconds. Nothing needs a developer: photos, prices, agents, developments, furniture and text are all edited here.
        </p>
        <ul>
          <li>
            <strong>Published / Visible / Active</strong> switches decide whether something shows on the website. Switch it off to hide it without
            deleting it.
          </li>
          <li>
            <strong>Order</strong> fields control the sequence: lower numbers appear first.
          </li>
          <li>
            Every form has <strong>View on website</strong> so you can check the result.
          </li>
          <li>Photos you upload are stored in your own Supabase storage. Use landscape photos at least 1600 pixels wide, under 5 MB.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'home',
    title: 'What appears where on the home page',
    body: (
      <>
        <p>
          All wording and section photos can be changed in <Link href="/admin/content/text-home">Website text → Home page text</Link>. Clear a field
          and save to bring back the original wording. Other pages have their own entry under Website text.
        </p>
        <ol>
          <li>
            <strong>Hero and moving ticker</strong>: headline, tagline, photo and ticker phrases in <Link href="/admin/content/home-settings">Settings → Home page</Link>.
          </li>
          <li>
            <strong>Akristal Developments</strong>: developments with <em>Show on the home page</em> on, in <em>Order</em>. The figures under them are set in
            Home page settings: each one is counted automatically, or shows the number you type.
          </li>
          <li>
            <strong>Homes listed with Akristal Brokers &amp; Agents</strong>: approved, available listings, <em>Featured</em> first (
            <Link href="/admin/content/listings">Listing settings</Link>). The moving strip below shows the other homes with photos.
          </li>
          <li>
            <strong>Akristal Brokers &amp; Agents</strong>: agent profiles and published <Link href="/admin/content/brokers">broker companies</Link>.
          </li>
          <li>
            <strong>Trusted by leading brands and partners</strong>: <Link href="/admin/content/partners">Partners and brands</Link>. Five or more scroll.
          </li>
          <li>
            <strong>Loved by Akristal clients</strong>: published <Link href="/admin/content/testimonials">Testimonials</Link>. Reviews written on the website
            arrive there unpublished. Add a Google rating and link in Home page settings to show it in the summary.
          </li>
          <li>
            <strong>Latest insights</strong>: the three newest <Link href="/admin/content/insights">Insights</Link> articles.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'developments',
    title: 'Developments (your own projects)',
    body: (
      <>
        <p>
          Each development has a <strong>Stage</strong> (Off-plan, Under construction, Completed) and a <strong>Visibility</strong> that also sets the
          sales track: Sold out shows &ldquo;Sold out&rdquo;, every other visible option shows &ldquo;Selling&rdquo;. Draft and Archived are hidden from the public. Set a starting price so cards show &ldquo;From …&rdquo; instead of &ldquo;Prices on request&rdquo;.
          Tick <strong>Pay Small Small available</strong> to show the instalment option.
        </p>
        <p>
          Progress updates, offers and events are added on the development page itself while you are signed in as admin (the dashed box at the
          bottom).
        </p>
      </>
    ),
  },
  {
    id: 'listings',
    title: 'Listings, brokers and agents',
    body: (
      <>
        <p>
          Sellers and agents submit listings from their dashboards; they go live only after you approve them in{' '}
          <Link href="/admin/properties">Properties</Link>. In <Link href="/admin/content/listings">Listing settings</Link> you can also:
        </p>
        <ul>
          <li>
            <strong>Assign the agent.</strong> The agent appears on the listing, and the listing appears on the agent&apos;s page under For sale, For rent or
            Sold. Homes an agent posts from their own dashboard appear on their page automatically.
          </li>
          <li>
            <strong>Pin it on the map</strong> with latitude and longitude. Without them the map shows an approximate pin for the neighbourhood.
          </li>
          <li>
            <strong>Feature it</strong> to show it first on the home page.
          </li>
          <li>
            <strong>Set the build stage</strong> (Off-plan, Under construction, Completed). It shows on the card beside Selling or Sold out.
          </li>
        </ul>
        <p>
          Broker companies register on Register a broker company and arrive in <Link href="/admin/content/applications">Applications</Link>. Once accepted,
          add them in <Link href="/admin/content/brokers">Broker companies</Link> and tick Published.
        </p>
        <p>
          <Link href="/admin/performance">Performance</Link> counts every WhatsApp, Call and Email tap on a broker or agent, the enquiries sent to them,
          and the sales you record in <Link href="/admin/content/sales">Sales</Link>.
        </p>
        <p>
          To add an agent: create the account in <Link href="/admin/users/new">Users</Link> with the role Agent, then complete their public profile in{' '}
          <Link href="/admin/content/agents">Agent profiles</Link> (photo, bio, areas, languages, WhatsApp).
        </p>
      </>
    ),
  },
  {
    id: 'inbox',
    title: 'Your inbox: leads, reviews and applications',
    body: (
      <>
        <p>
          Every form on the website (book a viewing, valuation, consultation, Pay Small Small, mortgage, furniture, contact, message an agent)
          arrives in <Link href="/admin/content/leads">Leads</Link> and is also emailed to the business address. Move each lead through New → Contacted →
          Qualified → Closed, assign it to an agent, and keep notes.
        </p>
        <p>
          <Link href="/admin/content/reviews">Agent reviews</Link> are hidden until you set them to Approved. Reject anything abusive or not genuine.
        </p>
        <p>
          <Link href="/admin/content/applications">Applications</Link> come from Become an Akristal agent and Register a broker company. Documents are
          not collected online; applicants send them on WhatsApp.
        </p>
      </>
    ),
  },
  {
    id: 'finance',
    title: 'Pay Small Small and mortgages',
    body: (
      <>
        <p>
          The first active <Link href="/admin/content/plans">Pay Small Small plan</Link> drives every instalment calculator: minimum and maximum deposit,
          tenures (in months; whole years show as years) and any premium per tenure (0 = no extra cost). Switch the plan off to hide the Pay Small Small option everywhere.
        </p>
        <p>
          Publish only lenders you have an agreement with in <Link href="/admin/content/lenders">Lenders</Link>. Mortgage calculator starting rates are
          set in code (<code>config/site.ts</code>); ask your developer to change them.
        </p>
        <p>All figures on the website are labelled as estimates.</p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Furniture, interiors, management team and testimonials',
    body: (
      <ul>
        <li>
          <strong>Furniture</strong>: first photo is the cover; leave the price empty and keep <em>Price on request</em> on to hide it. Orders arrive on
          WhatsApp with the item, colour and quantity filled in.
        </li>
        <li>
          <strong>Interior portfolio</strong>: add <em>Before and after</em> pairs to show the comparison slider.
        </li>
        <li>
          <strong>Management team</strong>: shown on the Management team page; long bios open with Read more.
        </li>
        <li>
          <strong>Testimonials</strong>: tick <em>The client agreed to be quoted</em> first; the website refuses to publish without it.
        </li>
      </ul>
    ),
  },
  {
    id: 'developer',
    title: 'Things that still need a developer',
    body: (
      <ul>
        <li>Social media links (in <code>config/site.ts</code>). Phone numbers, offices and email are in Settings → Phone numbers and offices.</li>
        <li>Menu items, button labels inside forms, and page layouts.</li>
        <li>Adding new markets/cities for the area filter (in <code>lib/data/markets.ts</code>).</li>
      </ul>
    ),
  },
]

export default async function AdminGuidePage() {
  await requireAdmin()
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <h1 className="font-display text-display-m font-medium">How the website works</h1>
        <p className="mt-2 text-[0.9375rem] text-muted">A short guide for the team that runs akristal.com.</p>
        <div className="mt-8 grid gap-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`g-${s.id}`} className="scroll-mt-24">
              <h2 id={`g-${s.id}`} className="font-display text-display-s font-medium">
                {s.title}
              </h2>
              <Prose className="mt-2">{s.body}</Prose>
            </section>
          ))}
        </div>
      </div>
      <nav aria-label="On this page" className="hidden text-sm xl:block">
        <div className="sticky top-24">
          <p className="text-xs text-muted">On this page</p>
          <ul className="mt-2 grid gap-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
