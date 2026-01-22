'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheKeys } from '../keys'

interface DashboardSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  accountsCount: number
  transactionsCount: number
}

interface ExpenseByCategory {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  total: number
  count: number
  percentage: number
}

/**
 * Hook para buscar resumo do dashboard com cache
 */
export function useDashboardSummary(userId: string | undefined) {
  const supabase = createClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return useQuery({
    queryKey: cacheKeys.dashboardSummary(userId || '', year, month),
    queryFn: async () => {
      if (!userId) return null

      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const [
        { data: accounts },
        { data: transactions },
      ] = await Promise.all([
        supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', userId)
          .eq('is_archived', false),
        supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', userId)
          .eq('status', 'confirmed')
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
      ])

      const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
      const monthlyIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0
      const monthlyExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0
      
      const savingsRate = monthlyIncome > 0 
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
        : 0

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        accountsCount: accounts?.length || 0,
        transactionsCount: transactions?.length || 0,
      } as DashboardSummary
    },
    enabled: !!userId,
    // Dashboard precisa ser mais fresco
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para despesas por categoria do mês
 */
export function useExpensesByCategory(userId: string | undefined) {
  const supabase = createClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return useQuery({
    queryKey: [...cacheKeys.dashboardSummary(userId || '', year, month), 'expenses-by-category'],
    queryFn: async () => {
      if (!userId) return []

      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, category:categories(id, name, icon, color)')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('status', 'confirmed')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      if (!transactions) return []

      // Agrupa por categoria
      const byCategory = transactions.reduce((acc, t) => {
        // Supabase retorna category como array ou objeto dependendo da relação
        const categoryData = t.category
        const cat = Array.isArray(categoryData) 
          ? categoryData[0] as { id: string; name: string; icon: string; color: string } | undefined
          : categoryData as { id: string; name: string; icon: string; color: string } | null
        
        if (!cat) return acc
        
        if (!acc[cat.id]) {
          acc[cat.id] = {
            categoryId: cat.id,
            categoryName: cat.name,
            categoryIcon: cat.icon,
            categoryColor: cat.color,
            total: 0,
            count: 0,
          }
        }
        acc[cat.id].total += Number(t.amount)
        acc[cat.id].count++
        return acc
      }, {} as Record<string, Omit<ExpenseByCategory, 'percentage'>>)

      const total = Object.values(byCategory).reduce((sum, c) => sum + c.total, 0)
      
      return Object.values(byCategory)
        .map(c => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }))
        .sort((a, b) => b.total - a.total) as ExpenseByCategory[]
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}
