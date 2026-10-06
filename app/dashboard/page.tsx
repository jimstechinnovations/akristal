import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { dashboardHref } from '@/lib/account-links'

export default async function DashboardRouterPage() {
  const user = await requireAuth()
  const role = user.profile?.role

  redirect(dashboardHref(role ?? 'buyer'))
}


