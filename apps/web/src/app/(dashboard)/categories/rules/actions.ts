'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateRuleInput, UpdateRuleInput } from '@/lib/validations/rule'

export async function createRule(data: CreateRuleInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Check if pattern already exists for user
  const { data: existing } = await supabase
    .from('categorization_rules')
    .select('id')
    .eq('user_id', user.id)
    .eq('pattern', data.pattern.toLowerCase())
    .single()

  if (existing) {
    return { error: 'Já existe uma regra com este padrão' }
  }

  const { error } = await supabase.from('categorization_rules').insert({
    user_id: user.id,
    category_id: data.categoryId,
    pattern: data.pattern.toLowerCase(),
    priority: data.priority,
    is_active: data.isActive,
  })

  if (error) {
    console.error('Error creating rule:', error)
    return { error: 'Erro ao criar regra. Tente novamente.' }
  }

  revalidatePath('/categories/rules')
  return { success: true }
}

export async function updateRule(ruleId: string, data: UpdateRuleInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: rule } = await supabase
    .from('categorization_rules')
    .select('user_id')
    .eq('id', ruleId)
    .single()

  if (!rule || rule.user_id !== user.id) {
    return { error: 'Regra não encontrada ou não pode ser editada' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId
  if (data.pattern !== undefined) updateData.pattern = data.pattern.toLowerCase()
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.isActive !== undefined) updateData.is_active = data.isActive

  const { error } = await supabase
    .from('categorization_rules')
    .update(updateData)
    .eq('id', ruleId)

  if (error) {
    console.error('Error updating rule:', error)
    return { error: 'Erro ao atualizar regra. Tente novamente.' }
  }

  revalidatePath('/categories/rules')
  return { success: true }
}

export async function deleteRule(ruleId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: rule } = await supabase
    .from('categorization_rules')
    .select('user_id')
    .eq('id', ruleId)
    .single()

  if (!rule || rule.user_id !== user.id) {
    return { error: 'Regra não encontrada ou não pode ser excluída' }
  }

  const { error } = await supabase.from('categorization_rules').delete().eq('id', ruleId)

  if (error) {
    console.error('Error deleting rule:', error)
    return { error: 'Erro ao excluir regra. Tente novamente.' }
  }

  revalidatePath('/categories/rules')
  return { success: true }
}

export async function toggleRule(ruleId: string, isActive: boolean) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: rule } = await supabase
    .from('categorization_rules')
    .select('user_id')
    .eq('id', ruleId)
    .single()

  if (!rule || rule.user_id !== user.id) {
    return { error: 'Regra não encontrada' }
  }

  const { error } = await supabase
    .from('categorization_rules')
    .update({ is_active: isActive })
    .eq('id', ruleId)

  if (error) {
    console.error('Error toggling rule:', error)
    return { error: 'Erro ao atualizar regra. Tente novamente.' }
  }

  revalidatePath('/categories/rules')
  return { success: true }
}

