import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, properties(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ payments })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    const body = await request.json()

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ payment })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

