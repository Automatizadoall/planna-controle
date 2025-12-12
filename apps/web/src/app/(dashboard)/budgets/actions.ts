'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/lib/validations/budget'

export async function createBudget(data: CreateBudgetInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Check if budget already exists for this category
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', data.categoryId)
    .eq('is_active', true)
    .single()

  if (existing) {
    return { error: 'Já existe um orçamento para esta categoria' }
  }

  const { error } = await supabase.from('budgets').insert({
    user_id: user.id,
    category_id: data.categoryId,
    amount: data.amount,
    period: data.period,
    alert_threshold: data.alertThreshold,
    is_active: true,
  })

  if (error) {
    console.error('Error creating budget:', error)
    return { error: 'Erro ao criar orçamento. Tente novamente.' }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateBudget(budgetId: string, data: UpdateBudgetInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: budget } = await supabase
    .from('budgets')
    .select('user_id')
    .eq('id', budgetId)
    .single()

  if (!budget || budget.user_id !== user.id) {
    return { error: 'Orçamento não encontrado' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.period !== undefined) updateData.period = data.period
  if (data.alertThreshold !== undefined) updateData.alert_threshold = data.alertThreshold

  const { error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', budgetId)

  if (error) {
    console.error('Error updating budget:', error)
    return { error: 'Erro ao atualizar orçamento. Tente novamente.' }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteBudget(budgetId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: budget } = await supabase
    .from('budgets')
    .select('user_id')
    .eq('id', budgetId)
    .single()

  if (!budget || budget.user_id !== user.id) {
    return { error: 'Orçamento não encontrado' }
  }

  // Soft delete - just deactivate
  const { error } = await supabase
    .from('budgets')
    .update({ is_active: false })
    .eq('id', budgetId)

  if (error) {
    console.error('Error deleting budget:', error)
    return { error: 'Erro ao excluir orçamento. Tente novamente.' }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { success: true }
}

