'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys } from '../keys'
import type { Goal } from '@mentoria/database'

/**
 * Hook para buscar metas do usuário
 */
export function useGoals(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.goals(userId || ''),
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true })

      if (error) throw error
      return data as Goal[]
    },
    enabled: !!userId,
  })
}

/**
 * Hook para atualizar meta (ex: adicionar valor)
 */
export function useUpdateGoal(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Goal> & { id: string }) => {
      const { data: goal, error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.goals(userId) })
    },
  })
}

/**
 * Hook para criar meta
 */
export function useCreateGoal(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: Partial<Goal>) => {
      const { data: goal, error } = await supabase
        .from('goals')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.goals(userId) })
    },
  })
}
