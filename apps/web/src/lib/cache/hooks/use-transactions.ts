'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys, cacheGroups } from '../keys'
import type { Transaction } from '@mentoria/database'

interface TransactionWithCategory extends Transaction {
  category?: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  account?: {
    id: string
    name: string
    type: string
  } | null
}

interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense' | 'transfer'
  categoryId?: string
  accountId?: string
  status?: 'pending' | 'confirmed'
  limit?: number
}

/**
 * Hook para buscar transações com filtros e cache
 */
export function useTransactions(userId: string | undefined, filters?: TransactionFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: cacheKeys.transactions(userId || '', filters),
    queryFn: async () => {
      if (!userId) return []
      
      let query = supabase
        .from('transactions')
        .select('*, category:categories(id, name, icon, color), account:accounts(id, name, type)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as TransactionWithCategory[]
    },
    enabled: !!userId,
    // Transações mudam mais frequentemente
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para transações do mês atual
 */
export function useMonthlyTransactions(userId: string | undefined, year?: number, month?: number) {
  const now = new Date()
  const targetYear = year ?? now.getFullYear()
  const targetMonth = month ?? now.getMonth()
  
  const startDate = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0]
  const endDate = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0]

  return useTransactions(userId, { startDate, endDate })
}

/**
 * Hook para transações recentes (últimas 10)
 */
export function useRecentTransactions(userId: string | undefined) {
  return useTransactions(userId, { limit: 10 })
}

/**
 * Hook para criar transação com invalidação automática
 */
export function useCreateTransaction(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({ ...data, user_id: userId })
        .select('*, category:categories(id, name, icon, color)')
        .single()

      if (error) throw error
      return transaction
    },
    onSuccess: () => {
      // Invalida todos os caches relacionados a transações
      cacheGroups.transactions(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransaction(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select('*, category:categories(id, name, icon, color)')
        .single()

      if (error) throw error
      return transaction
    },
    onSuccess: () => {
      cacheGroups.transactions(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransaction(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      cacheGroups.transactions(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}

/**
 * Hook para confirmar transação pendente
 */
export function useConfirmTransaction(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({ status: 'confirmed' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return transaction
    },
    onSuccess: () => {
      cacheGroups.financial(userId).forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}
