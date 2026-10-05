import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { adminCounts } from '@/lib/admin/load'
import { resources } from '@/lib/admin/resources'
import { AdminNav, type NavSection } from '@/components/admin/admin-nav'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const counts = await adminCounts()
  const badge: Record<string, number> = { leads: counts.newLeads, reviews: counts.pendingReviews, applications: counts.newApplications }
  const byGroup = (g: string) => resources.filter((r) => r.group === g).map((r) => ({ href: `/admin/content/${r.key}`, label: r.title, badge: badge[r.key] }))

  const sections: NavSection[] = [
    { title: 'Start here', items: [{ href: '/admin', label: 'Overview' }, { href: '/admin/guide', label: 'How the website works' }] },
    { title: 'Inbox', items: byGroup('Inbox') },
    {
      title: 'Website content',
      items: [{ href: '/admin/properties', label: 'Properties', badge: counts.pendingListings }, ...byGroup('Website content')],
    },
    { title: 'Website text', items: byGroup('Website text') },
    {
      title: 'Brokers & Agents',
      items: [{ href: '/admin/performance', label: 'Performance' }, ...byGroup('Brokers & Agents')],
    },
    { title: 'Settings', items: [...byGroup('Settings'), { href: '/admin/property-types', label: 'Property types' }, { href: '/admin/categories', label: 'Categories' }] },
    { title: 'Accounts', items: [{ href: '/admin/users', label: 'Users' }, { href: '/admin/members', label: 'Team (classic editor)' }, { href: '/admin/payments', label: 'Payments' }] },
  ]

  return (
    <div className="page-x-wide grid gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <AdminNav sections={sections} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
