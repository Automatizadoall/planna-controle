'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateAccountInput, UpdateAccountInput } from '@/lib/validations/account'

export async function createAccount(data: CreateAccountInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    balance: data.balance,
    currency: data.currency || 'BRL',
  })

  if (error) {
    console.error('Error creating account:', error)
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAccount(accountId: string, data: UpdateAccountInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { error: 'Conta não encontrada' }
  }

  const { error } = await supabase
    .from('accounts')
    .update({
      name: data.name,
      type: data.type,
    })
    .eq('id', accountId)

  if (error) {
    console.error('Error updating account:', error)
    return { error: 'Erro ao atualizar conta. Tente novamente.' }
  }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function archiveAccount(accountId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { error: 'Conta não encontrada' }
  }

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: true })
    .eq('id', accountId)

  if (error) {
    console.error('Error archiving account:', error)
    return { error: 'Erro ao arquivar conta. Tente novamente.' }
  }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function unarchiveAccount(accountId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { error: 'Conta não encontrada' }
  }

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: false })
    .eq('id', accountId)

  if (error) {
    console.error('Error unarchiving account:', error)
    return { error: 'Erro ao restaurar conta. Tente novamente.' }
  }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function setDefaultAccount(accountId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verify ownership and that account is not archived
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id, is_archived')
    .eq('id', accountId)
    .single()

  if (!account || account.user_id !== user.id) {
    return { error: 'Conta não encontrada' }
  }

  if (account.is_archived) {
    return { error: 'Não é possível definir uma conta arquivada como padrão' }
  }

  // The trigger will automatically unset other defaults
  const { error } = await supabase
    .from('accounts')
    .update({ is_default: true })
    .eq('id', accountId)

  if (error) {
    console.error('Error setting default account:', error)
    return { error: 'Erro ao definir conta padrão. Tente novamente.' }
  }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return { success: true }
}

