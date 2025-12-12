'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction'

export async function createTransaction(data: CreateTransactionInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify account ownership
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', data.accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { error: 'Conta não encontrada' }
  }

  // Verify destination account if transfer
  if (data.type === 'transfer' && data.toAccountId) {
    const { data: toAccount } = await supabase
      .from('accounts')
      .select('user_id')
      .eq('id', data.toAccountId)
      .single()

    if (!toAccount || toAccount.user_id !== user.id) {
      return { error: 'Conta destino não encontrada' }
    }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id: data.accountId,
    category_id: data.categoryId || null,
    type: data.type,
    amount: data.amount,
    description: data.description || null,
    date: data.date,
    to_account_id: data.type === 'transfer' ? data.toAccountId : null,
    tags: data.tags || null,
  })

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: 'Erro ao criar transação. Tente novamente.' }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')
  return { success: true }
}

export async function updateTransaction(transactionId: string, data: UpdateTransactionInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify transaction ownership
  const { data: transaction } = await supabase
    .from('transactions')
    .select('user_id')
    .eq('id', transactionId)
    .single()

  if (!transaction || transaction.user_id !== user.id) {
    return { error: 'Transação não encontrada' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.type !== undefined) updateData.type = data.type
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.description !== undefined) updateData.description = data.description
  if (data.date !== undefined) updateData.date = data.date
  if (data.accountId !== undefined) updateData.account_id = data.accountId
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId
  if (data.toAccountId !== undefined) updateData.to_account_id = data.toAccountId
  if (data.tags !== undefined) updateData.tags = data.tags

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId)

  if (error) {
    console.error('Error updating transaction:', error)
    return { error: 'Erro ao atualizar transação. Tente novamente.' }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')
  return { success: true }
}

export async function deleteTransaction(transactionId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify transaction ownership
  const { data: transaction } = await supabase
    .from('transactions')
    .select('user_id')
    .eq('id', transactionId)
    .single()

  if (!transaction || transaction.user_id !== user.id) {
    return { error: 'Transação não encontrada' }
  }

  const { error } = await supabase.from('transactions').delete().eq('id', transactionId)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { error: 'Erro ao excluir transação. Tente novamente.' }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')
  return { success: true }
}

// Confirm a pending transaction (changes status to 'confirmed' and affects balance)
export async function confirmTransaction(transactionId: string, updates?: {
  amount?: number
  date?: string
  description?: string
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify transaction ownership and that it's pending
  const { data: transaction } = await supabase
    .from('transactions')
    .select('user_id, status')
    .eq('id', transactionId)
    .single()

  if (!transaction || transaction.user_id !== user.id) {
    return { error: 'Transação não encontrada' }
  }

  if (transaction.status === 'confirmed') {
    return { error: 'Transação já está confirmada' }
  }

  const updateData: Record<string, unknown> = {
    status: 'confirmed',
    notes: null, // Clear auto-generated note
  }

  // Apply any updates before confirming
  if (updates?.amount !== undefined) updateData.amount = updates.amount
  if (updates?.date !== undefined) updateData.date = updates.date
  if (updates?.description !== undefined) updateData.description = updates.description

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId)

  if (error) {
    console.error('Error confirming transaction:', error)
    return { error: 'Erro ao confirmar transação. Tente novamente.' }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')
  return { success: true }
}

// Confirm multiple pending transactions at once
export async function confirmAllPendingTransactions(transactionIds: string[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  if (transactionIds.length === 0) {
    return { error: 'Nenhuma transação selecionada' }
  }

  // Update all selected transactions to confirmed
  const { error, count } = await supabase
    .from('transactions')
    .update({ 
      status: 'confirmed',
      notes: null,
    })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .in('id', transactionIds)

  if (error) {
    console.error('Error confirming transactions:', error)
    return { error: 'Erro ao confirmar transações. Tente novamente.' }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/reports')
  return { success: true, count }
}

// Get pending transactions count for badge
export async function getPendingTransactionsCount() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { count: 0 }
  }

  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  return { count: count || 0 }
}

