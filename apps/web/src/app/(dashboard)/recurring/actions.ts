'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateRecurringInput, UpdateRecurringInput } from '@/lib/validations/recurring'
import { calculateNextOccurrence, type RecurringFrequency } from '@/lib/validations/recurring'

export async function createRecurring(data: CreateRecurringInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Calculate first next_occurrence
  const startDate = new Date(data.startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // If start date is in the past or today, it's due now
  const nextOccurrence = startDate <= today ? data.startDate : data.startDate

  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: user.id,
    account_id: data.accountId,
    category_id: data.categoryId || null,
    type: data.type,
    amount: data.amount,
    description: data.description,
    frequency: data.frequency,
    start_date: data.startDate,
    end_date: data.endDate || null,
    next_occurrence: nextOccurrence,
    is_active: true,
  })

  if (error) {
    console.error('Error creating recurring:', error)
    return { error: 'Erro ao criar transação recorrente. Tente novamente.' }
  }

  revalidatePath('/recurring')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateRecurring(recurringId: string, data: UpdateRecurringInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('user_id')
    .eq('id', recurringId)
    .single()

  if (!recurring || recurring.user_id !== user.id) {
    return { error: 'Transação recorrente não encontrada' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.accountId !== undefined) updateData.account_id = data.accountId
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId
  if (data.type !== undefined) updateData.type = data.type
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.description !== undefined) updateData.description = data.description
  if (data.frequency !== undefined) updateData.frequency = data.frequency
  if (data.startDate !== undefined) updateData.start_date = data.startDate
  if (data.endDate !== undefined) updateData.end_date = data.endDate || null

  const { error } = await supabase
    .from('recurring_transactions')
    .update(updateData)
    .eq('id', recurringId)

  if (error) {
    console.error('Error updating recurring:', error)
    return { error: 'Erro ao atualizar transação recorrente. Tente novamente.' }
  }

  revalidatePath('/recurring')
  return { success: true }
}

export async function deleteRecurring(recurringId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('user_id')
    .eq('id', recurringId)
    .single()

  if (!recurring || recurring.user_id !== user.id) {
    return { error: 'Transação recorrente não encontrada' }
  }

  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', recurringId)

  if (error) {
    console.error('Error deleting recurring:', error)
    return { error: 'Erro ao excluir transação recorrente. Tente novamente.' }
  }

  revalidatePath('/recurring')
  return { success: true }
}

export async function toggleRecurring(recurringId: string, isActive: boolean) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const { error } = await supabase
    .from('recurring_transactions')
    .update({ is_active: isActive })
    .eq('id', recurringId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling recurring:', error)
    return { error: 'Erro ao atualizar. Tente novamente.' }
  }

  revalidatePath('/recurring')
  return { success: true }
}

// Process a recurring transaction (create actual transaction and update next_occurrence)
export async function processRecurring(recurringId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Get recurring transaction
  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('id', recurringId)
    .eq('user_id', user.id)
    .single()

  if (!recurring) {
    return { error: 'Transação recorrente não encontrada' }
  }

  // Create actual transaction
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id: recurring.account_id,
    category_id: recurring.category_id,
    type: recurring.type,
    amount: recurring.amount,
    description: recurring.description,
    date: recurring.next_occurrence,
    recurring_id: recurring.id,
    tags: ['recorrente'],
  })

  if (txError) {
    console.error('Error creating transaction:', txError)
    return { error: 'Erro ao criar transação. Tente novamente.' }
  }

  // Calculate next occurrence
  const currentDate = new Date(recurring.next_occurrence)
  const nextDate = calculateNextOccurrence(currentDate, recurring.frequency as RecurringFrequency)
  const nextOccurrence = nextDate.toISOString().split('T')[0]

  // Check if end_date reached
  let shouldDeactivate = false
  if (recurring.end_date) {
    const endDate = new Date(recurring.end_date)
    if (nextDate > endDate) {
      shouldDeactivate = true
    }
  }

  // Update recurring with next occurrence
  const { error: updateError } = await supabase
    .from('recurring_transactions')
    .update({
      next_occurrence: nextOccurrence,
      is_active: shouldDeactivate ? false : recurring.is_active,
    })
    .eq('id', recurringId)

  if (updateError) {
    console.error('Error updating recurring:', updateError)
  }

  revalidatePath('/recurring')
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')

  return { 
    success: true, 
    message: shouldDeactivate 
      ? 'Transação lançada. Recorrência encerrada (data fim atingida).'
      : 'Transação lançada com sucesso!'
  }
}

// Process all due recurring transactions
export async function processAllDueRecurring() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const today = new Date().toISOString().split('T')[0]

  // Get all due recurring
  const { data: dueRecurring } = await supabase
    .from('recurring_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .lte('next_occurrence', today)

  if (!dueRecurring || dueRecurring.length === 0) {
    return { success: true, processed: 0 }
  }

  let processed = 0
  for (const r of dueRecurring) {
    const result = await processRecurring(r.id)
    if (result.success) processed++
  }

  return { success: true, processed }
}

