import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRouterPage() {
  const user = await requireAuth()
  const role = user.profile?.role

  if (role === 'admin') redirect('/admin')
  if (role === 'seller') redirect('/seller/dashboard')
  if (role === 'agent') redirect('/agent/dashboard')
  // default buyer
  redirect('/buyer/dashboard')
}


