'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ParsedTransaction } from '@/lib/validations/import'

// Check for duplicate transactions
export async function checkDuplicates(
  accountId: string,
  transactions: { date: string; amount: number; description: string }[]
): Promise<{ duplicates: boolean[]; duplicateIds: (string | null)[] }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { duplicates: [], duplicateIds: [] }
  }

  // Get existing transactions for the account within date range
  const dates = transactions.map((t) => t.date).filter(Boolean)
  if (dates.length === 0) {
    return {
      duplicates: transactions.map(() => false),
      duplicateIds: transactions.map(() => null),
    }
  }

  const minDate = dates.reduce((a, b) => (a < b ? a : b))
  const maxDate = dates.reduce((a, b) => (a > b ? a : b))

  const { data: existing } = await supabase
    .from('transactions')
    .select('id, date, amount, description')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .gte('date', minDate)
    .lte('date', maxDate)

  const duplicates: boolean[] = []
  const duplicateIds: (string | null)[] = []

  for (const t of transactions) {
    // Check for exact match (same date, amount, and similar description)
    const match = existing?.find(
      (e) =>
        e.date === t.date &&
        Math.abs(Number(e.amount) - t.amount) < 0.01 &&
        e.description?.toLowerCase().includes(t.description.toLowerCase().substring(0, 20))
    )

    duplicates.push(!!match)
    duplicateIds.push(match?.id || null)
  }

  return { duplicates, duplicateIds }
}

// Import transactions
export async function importTransactions(
  accountId: string,
  transactions: ParsedTransaction[]
): Promise<{ imported: number; errors: number }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { imported: 0, errors: transactions.length }
  }

  // Verify account ownership
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { imported: 0, errors: transactions.length }
  }

  let imported = 0
  let errors = 0

  // Import in batches of 50
  const batchSize = 50
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)

    const toInsert = batch.map((t) => ({
      user_id: user.id,
      account_id: accountId,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      category_id: t.suggestedCategoryId,
      tags: ['importado'],
    }))

    const { data, error } = await supabase.from('transactions').insert(toInsert).select('id')

    if (error) {
      console.error('Import batch error:', error)
      errors += batch.length
    } else {
      imported += data?.length || 0
    }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')

  return { imported, errors }
}

