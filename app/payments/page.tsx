import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/types/database'

type PaymentRow = Database['public']['Tables']['payments']['Row']
type PropertyLite = Pick<Database['public']['Tables']['properties']['Row'], 'title'>
type PaymentWithProperty = PaymentRow & { properties: PropertyLite | null }

export default async function PaymentsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, properties(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusIcon = (status: PaymentRow['payment_status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    }
  }

  const getStatusColor = (status: PaymentRow['payment_status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const typedPayments = (payments as PaymentWithProperty[]) || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Payments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage your payment transactions
          </p>
        </div>
        <Link href="/payments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">
              Error loading payments: {error.message}
            </p>
          </CardContent>
        </Card>
      ) : typedPayments.length > 0 ? (
        <div className="space-y-4">
          {typedPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.payment_status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {payment.description || 'Payment'}
                        </h3>
                        {payment.properties && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Property: {payment.properties.title}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Amount: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount, payment.currency || undefined)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Method: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {payment.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                      {payment.bank_name && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Bank: </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {payment.bank_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(payment.payment_status)}`}
                    >
                      {payment.payment_status}
                    </span>
                    {payment.bank_statement_url && (
                      <a
                        href={payment.bank_statement_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        View Statement
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              You haven't made any payments yet.
            </p>
            <Link href="/payments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Payment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

