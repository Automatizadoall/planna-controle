'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys } from '../keys'
import type { Category } from '@mentoria/database'

/**
 * Hook para buscar categorias com cache longo
 * Categorias raramente mudam, então cache de 30 minutos
 */
export function useCategories(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.categories(userId || ''),
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_system.eq.true`)
        .order('type')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
    enabled: !!userId,
    // Cache mais longo para categorias
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  })
}

/**
 * Hook para buscar categorias de despesa
 */
export function useExpenseCategories(userId: string | undefined) {
  const { data: categories, ...rest } = useCategories(userId)
  
  return {
    ...rest,
    data: categories?.filter(c => c.type === 'expense') || [],
  }
}

/**
 * Hook para buscar categorias de receita
 */
export function useIncomeCategories(userId: string | undefined) {
  const { data: categories, ...rest } = useCategories(userId)
  
  return {
    ...rest,
    data: categories?.filter(c => c.type === 'income') || [],
  }
}
