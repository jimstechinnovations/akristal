'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Upload, Building2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'
import type { Database, PaymentMethod, PaymentStatus } from '@/types/database'

type PaymentInsert = Database['public']['Tables']['payments']['Insert']

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">Loading…</div>}>
      <NewPaymentPageInner />
    </Suspense>
  )
}

function NewPaymentPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const supabase = createClient()

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
  })
  const [bankStatement, setBankStatement] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBankStatement(e.target.files[0])
    }
  }

  const uploadBankStatement = async (file: File, paymentId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${paymentId}-${Date.now()}.${fileExt}`
      const filePath = `payments/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading bank statement:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in to make a payment')
        router.push('/login')
        return
      }

      // Create payment record first
      const paymentInsert: PaymentInsert = {
        user_id: user.id,
        property_id: propertyId || null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        payment_method: 'bank_transfer' as PaymentMethod,
        payment_status: 'pending' as PaymentStatus,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_holder_name: formData.accountHolderName,
        description: formData.description,
      }

      const { data: payment, error: paymentError } = await (supabase as any)
        .from('payments')
        .insert(paymentInsert)
        .select()
        .single()

      if (paymentError) throw paymentError

      // Upload bank statement if provided
      let bankStatementUrl = null
      if (bankStatement && payment) {
        setUploading(true)
        bankStatementUrl = await uploadBankStatement(bankStatement, payment.id)

        if (bankStatementUrl) {
          const { error: updateError } = await (supabase as any)
            .from('payments')
            .update({ bank_statement_url: bankStatementUrl })
            .eq('id', payment.id)

          if (updateError) throw updateError
        }
      }

      toast.success('Payment submitted successfully! We will review and process it soon.')
      router.push('/payments')
    } catch (error: unknown) {
      console.error('Payment error:', error)
      toast.error(getErrorMessage(error) || 'Failed to submit payment')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Payment</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Submit a bank transfer payment with proof of transaction
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Payment</CardTitle>
          <CardDescription>
            Fill in your payment details and attach your bank statement as proof
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Amount *
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Currency *
                </label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="RWF">RWF - Rwandan Franc</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                placeholder="Payment for property purchase, deposit, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Bank Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Bank Name *
                  </label>
                  <Input
                    id="bankName"
                    type="text"
                    placeholder="Bank of Kigali, Equity Bank, etc."
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Account Number *
                  </label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Your bank account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="accountHolderName" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Account Holder Name *
                  </label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    placeholder="Name on the bank account"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountHolderName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bankStatement" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Bank Statement / Proof of Payment *
              </label>
              <div className="mt-2 flex items-center space-x-4">
                <label className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <Upload className="h-4 w-4" />
                  <span>Choose File</span>
                  <input
                    id="bankStatement"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
                {bankStatement && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bankStatement.name}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Upload a PDF or image of your bank statement showing the transaction
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold">TheAkristalGroup Bank Details</p>
                  <p className="mt-1">Account Name: TheAkristalGroup</p>
                  <p>Account Number: [To be configured]</p>
                  <p>Bank: [To be configured]</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || uploading}>
                {uploading
                  ? 'Uploading...'
                  : loading
                    ? 'Submitting...'
                    : 'Submit Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

