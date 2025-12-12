'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizePhoneNumber } from '@/lib/validations/profile'

interface UpdateProfileInput {
  fullName: string
  avatar_url?: string
  phone_number?: string | null
}

export async function updateProfile(data: UpdateProfileInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const updateData: { full_name: string; avatar_url?: string; phone_number?: string | null } = {
    full_name: data.fullName,
  }

  // Só inclui avatar_url se foi passado (pode ser string vazia para remover)
  if (data.avatar_url !== undefined) {
    updateData.avatar_url = data.avatar_url
  }

  // Normaliza e inclui phone_number se foi passado
  if (data.phone_number !== undefined) {
    updateData.phone_number = normalizePhoneNumber(data.phone_number)
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    
    // Check for unique constraint violation on phone number
    if (error.code === '23505' && error.message.includes('phone_number')) {
      return { error: 'Este número de telefone já está em uso por outra conta.' }
    }
    
    return { error: `Erro ao atualizar perfil: ${error.message}` }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}

