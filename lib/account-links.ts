import type { Database } from '@/types/database'

export type Role = Database['public']['Tables']['profiles']['Row']['role']
export type AccountLink = { href: string; label: string }

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  agent: 'Agent',
  broker: 'Broker company',
  seller: 'Seller',
  buyer: 'Buyer',
}

export function roleLabel(role?: Role | null) {
  return role ? ROLE_LABEL[role] : 'Member'
}

export function dashboardHref(role?: Role | null) {
  if (role === 'admin') return '/admin'
  if (role === 'seller') return '/seller/dashboard'
  if (role === 'agent') return '/agent/dashboard'
  if (role === 'broker') return '/broker/dashboard'
  if (role === 'buyer') return '/buyer/dashboard'
  return '/dashboard'
}

/** Everything a signed-in user can reach, by role (carried over from the old navbar). */
export function accountLinks(role?: Role | null): AccountLink[] {
  const links: AccountLink[] = [{ href: dashboardHref(role), label: 'Dashboard' }]

  if (role === 'buyer') links.push({ href: '/buyer/favorites', label: 'Saved homes' })
  if (role === 'seller') {
    links.push({ href: '/seller/properties', label: 'My listings' }, { href: '/seller/properties/new', label: 'New listing' })
  }
  if (role === 'agent') {
    links.push({ href: '/agent/properties', label: 'My listings' }, { href: '/seller/properties/new', label: 'New listing' })
  }
  if (role === 'broker') {
    links.push(
      { href: '/broker/company', label: 'Company page' },
      { href: '/seller/properties', label: 'My listings' },
      { href: '/seller/properties/new', label: 'New listing' }
    )
  }
  if (role === 'admin') {
    links.push(
      { href: '/admin/properties', label: 'Properties' },
      { href: '/projects', label: 'Developments' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/members', label: 'Team members' },
      { href: '/admin/payments', label: 'Payments' }
    )
  }
  if (role !== 'agent') links.push({ href: '/messages', label: 'Messages' })
  links.push({ href: '/profile', label: 'Profile' }, { href: '/settings', label: 'Settings' })
  return links
}
