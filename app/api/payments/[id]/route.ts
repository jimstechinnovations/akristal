import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import type { Database } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, properties(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ payment })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()
    const body = await request.json()

    // Check if user owns this payment or is admin
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('user_id')
      .eq('id', id)
      .single()

    const paymentOwner =
      (existingPayment as unknown as Pick<Database['public']['Tables']['payments']['Row'], 'user_id'> | null) ?? null

    if (!paymentOwner) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileRole =
      (profile as unknown as Pick<Database['public']['Tables']['profiles']['Row'], 'role'> | null) ?? null

    if (paymentOwner.user_id !== user.id && profileRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const update = body as unknown as Database['public']['Tables']['payments']['Update']

    type PaymentsUpdateClient = {
      from: (table: 'payments') => {
        update: (values: Database['public']['Tables']['payments']['Update']) => {
          eq: (column: 'id', value: string) => {
            select: () => {
              single: () => Promise<{
                data: Database['public']['Tables']['payments']['Row'] | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }

    const { data: payment, error } = await (supabase as unknown as PaymentsUpdateClient)
      .from('payments')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ payment })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

