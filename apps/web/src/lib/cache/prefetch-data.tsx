'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys } from './keys'
import type { Account, Category, Profile, Goal } from '@mentoria/database'

interface PrefetchDataProps {
  userId: string
}

/**
 * Componente invisível que faz prefetch de dados essenciais
 * Renderizado no layout do dashboard para carregar dados em background
 */
export function PrefetchData({ userId }: PrefetchDataProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Prefetch de dados que raramente mudam (categorias, contas, perfil)
    const prefetchEssentials = async () => {
      // Prefetch paralelo de dados estáticos
      await Promise.all([
        // Categorias (cache longo)
        queryClient.prefetchQuery({
          queryKey: cacheKeys.categories(userId),
          queryFn: async () => {
            const { data } = await supabase
              .from('categories')
              .select('*')
              .or(`user_id.eq.${userId},is_system.eq.true`)
              .order('type')
              .order('name')
            return data as Category[]
          },
          staleTime: 30 * 60 * 1000,
        }),

        // Contas
        queryClient.prefetchQuery({
          queryKey: cacheKeys.accounts(userId),
          queryFn: async () => {
            const { data } = await supabase
              .from('accounts')
              .select('*')
              .eq('user_id', userId)
              .eq('is_archived', false)
              .order('name')
            return data as Account[]
          },
          staleTime: 10 * 60 * 1000,
        }),

        // Perfil
        queryClient.prefetchQuery({
          queryKey: cacheKeys.profile(userId),
          queryFn: async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()
            return data as Profile
          },
          staleTime: 15 * 60 * 1000,
        }),

        // Metas
        queryClient.prefetchQuery({
          queryKey: cacheKeys.goals(userId),
          queryFn: async () => {
            const { data } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', userId)
              .order('target_date', { ascending: true })
            return data as Goal[]
          },
          staleTime: 5 * 60 * 1000,
        }),
      ])
    }

    prefetchEssentials()
  }, [userId, queryClient, supabase])

  // Componente invisível
  return null
}
