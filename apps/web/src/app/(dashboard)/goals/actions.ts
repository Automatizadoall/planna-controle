'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateGoalInput, UpdateGoalInput, ContributionInput } from '@/lib/validations/goal'

export async function createGoal(data: CreateGoalInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const { error } = await supabase.from('goals').insert({
    user_id: user.id,
    name: data.name,
    target_amount: data.targetAmount,
    current_amount: data.currentAmount || 0,
    target_date: data.targetDate || null,
    icon: data.icon || '🎯',
    color: data.color || '#10B981',
  })

  if (error) {
    console.error('Error creating goal:', error)
    return { error: 'Erro ao criar meta. Tente novamente.' }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGoal(goalId: string, data: UpdateGoalInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: goal } = await supabase
    .from('goals')
    .select('user_id')
    .eq('id', goalId)
    .single()

  if (!goal || goal.user_id !== user.id) {
    return { error: 'Meta não encontrada' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.targetAmount !== undefined) updateData.target_amount = data.targetAmount
  if (data.currentAmount !== undefined) updateData.current_amount = data.currentAmount
  if (data.targetDate !== undefined) updateData.target_date = data.targetDate || null
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color

  const { error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', goalId)

  if (error) {
    console.error('Error updating goal:', error)
    return { error: 'Erro ao atualizar meta. Tente novamente.' }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGoal(goalId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: goal } = await supabase
    .from('goals')
    .select('user_id')
    .eq('id', goalId)
    .single()

  if (!goal || goal.user_id !== user.id) {
    return { error: 'Meta não encontrada' }
  }

  const { error } = await supabase.from('goals').delete().eq('id', goalId)

  if (error) {
    console.error('Error deleting goal:', error)
    return { error: 'Erro ao excluir meta. Tente novamente.' }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addContribution(data: ContributionInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership and get current amount
  const { data: goal } = await supabase
    .from('goals')
    .select('user_id, current_amount, target_amount, name')
    .eq('id', data.goalId)
    .single()

  if (!goal || goal.user_id !== user.id) {
    return { error: 'Meta não encontrada' }
  }

  const newAmount = Number(goal.current_amount) + data.amount
  const isCompleted = newAmount >= Number(goal.target_amount)

  // Update goal with new amount
  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', data.goalId)

  if (error) {
    console.error('Error adding contribution:', error)
    return { error: 'Erro ao adicionar contribuição. Tente novamente.' }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  
  return { 
    success: true, 
    newAmount,
    isCompleted,
    message: isCompleted 
      ? `🎉 Parabéns! Você atingiu a meta "${goal.name}"!`
      : undefined
  }
}

export async function withdrawFromGoal(goalId: string, amount: number) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership and get current amount
  const { data: goal } = await supabase
    .from('goals')
    .select('user_id, current_amount')
    .eq('id', goalId)
    .single()

  if (!goal || goal.user_id !== user.id) {
    return { error: 'Meta não encontrada' }
  }

  const newAmount = Math.max(0, Number(goal.current_amount) - amount)

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', goalId)

  if (error) {
    console.error('Error withdrawing from goal:', error)
    return { error: 'Erro ao retirar valor. Tente novamente.' }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { success: true, newAmount }
}

