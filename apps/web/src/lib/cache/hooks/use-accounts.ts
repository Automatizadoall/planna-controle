'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys, cacheGroups } from '../keys'
import type { Account } from '@mentoria/database'

/**
 * Hook para buscar contas do usuário com cache
 */
export function useAccounts(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.accounts(userId || ''),
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('name')

      if (error) throw error
      return data as Account[]
    },
    enabled: !!userId,
    // Contas mudam pouco, cache mais longo
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para buscar uma conta específica
 */
export function useAccount(accountId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.account(accountId || ''),
    queryFn: async () => {
      if (!accountId) return null
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      if (error) throw error
      return data as Account
    },
    enabled: !!accountId,
  })
}

/**
 * Hook para criar conta com invalidação automática
 */
export function useCreateAccount(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: Partial<Account>) => {
      const { data: account, error } = await supabase
        .from('accounts')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return account
    },
    onSuccess: () => {
      // Invalida cache de contas e dashboard
      cacheGroups.accounts(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}

/**
 * Hook para atualizar conta
 */
export function useUpdateAccount(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Account> & { id: string }) => {
      const { data: account, error } = await supabase
        .from('accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return account
    },
    onSuccess: (_, variables) => {
      // Invalida cache específico e geral
      queryClient.invalidateQueries({ queryKey: cacheKeys.account(variables.id) })
      cacheGroups.accounts(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}
