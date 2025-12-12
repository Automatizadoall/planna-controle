'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/lib/validations/category'

export async function createCategory(data: CreateCategoryInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Check if category with same name already exists for user
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', data.name)
    .eq('type', data.type)
    .single()

  if (existing) {
    return { error: 'Já existe uma categoria com este nome' }
  }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    type: data.type,
    parent_id: data.parentId || null,
    is_system: false,
  })

  if (error) {
    console.error('Error creating category:', error)
    return { error: 'Erro ao criar categoria. Tente novamente.' }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return { success: true }
}

export async function updateCategory(categoryId: string, data: UpdateCategoryInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership and not system
  const { data: category } = await supabase
    .from('categories')
    .select('user_id, is_system')
    .eq('id', categoryId)
    .single()

  if (!category || category.user_id !== user.id || category.is_system) {
    return { error: 'Categoria não encontrada ou não pode ser editada' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.type !== undefined) updateData.type = data.type
  if (data.parentId !== undefined) updateData.parent_id = data.parentId

  const { error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', categoryId)

  if (error) {
    console.error('Error updating category:', error)
    return { error: 'Erro ao atualizar categoria. Tente novamente.' }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership and not system
  const { data: category } = await supabase
    .from('categories')
    .select('user_id, is_system')
    .eq('id', categoryId)
    .single()

  if (!category || category.user_id !== user.id || category.is_system) {
    return { error: 'Categoria não encontrada ou não pode ser excluída' }
  }

  // Check if category is in use
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (count && count > 0) {
    return { error: `Esta categoria está sendo usada em ${count} transações` }
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: 'Erro ao excluir categoria. Tente novamente.' }
  }

  revalidatePath('/categories')
  return { success: true }
}

// Auto-categorize a description
export async function autoCategorize(description: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !description) {
    return { categoryId: null, confidence: 0 }
  }

  const { data, error } = await supabase.rpc('auto_categorize', {
    p_user_id: user.id,
    p_description: description,
  })

  if (error || !data || data.length === 0) {
    return { categoryId: null, confidence: 0 }
  }

  return {
    categoryId: data[0].category_id,
    confidence: data[0].confidence,
  }
}

// Learn from user correction (create a new rule)
export async function learnFromCorrection(description: string, categoryId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !description || !categoryId) {
    return { error: 'Dados inválidos' }
  }

  // Extract a simple pattern from the description
  const pattern = description
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .slice(0, 3)
    .join('|')

  if (!pattern || pattern.length < 3) {
    return { error: 'Descrição muito curta para aprender' }
  }

  // Check if a similar rule already exists
  const { data: existing } = await supabase
    .from('categorization_rules')
    .select('id')
    .eq('user_id', user.id)
    .eq('pattern', pattern)
    .single()

  if (existing) {
    // Update existing rule
    await supabase
      .from('categorization_rules')
      .update({ category_id: categoryId, priority: 100 })
      .eq('id', existing.id)
  } else {
    // Create new rule
    await supabase.from('categorization_rules').insert({
      user_id: user.id,
      category_id: categoryId,
      pattern,
      priority: 100,
      is_active: true,
    })
  }

  revalidatePath('/categories')
  return { success: true, pattern }
}

