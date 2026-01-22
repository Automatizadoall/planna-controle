'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys } from '../keys'
import type { Profile } from '@mentoria/database'

/**
 * Hook para buscar perfil do usuário com cache
 */
export function useProfile(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.profile(userId || ''),
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    // Perfil muda pouco
    staleTime: 15 * 60 * 1000, // 15 minutos
  })
}

/**
 * Hook para atualizar perfil com invalidação
 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.profile(userId) })
    },
  })
}
