import { z } from 'zod'

export const budgetPeriodEnum = z.enum(['monthly', 'weekly', 'yearly'])

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('Selecione uma categoria'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  period: budgetPeriodEnum.default('monthly'),
  alertThreshold: z.number().min(50).max(100).default(80), // Alert when reaching X%
  startDate: z.string().optional(), // For custom periods
  endDate: z.string().optional(),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type BudgetPeriod = z.infer<typeof budgetPeriodEnum>

// Labels for budget periods
export const budgetPeriodLabels: Record<BudgetPeriod, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
}

// Calculate period date range
export function getPeriodDateRange(period: BudgetPeriod, referenceDate?: Date): { start: Date; end: Date } {
  const now = referenceDate || new Date()
  
  switch (period) {
    case 'weekly': {
      const dayOfWeek = now.getDay()
      const start = new Date(now)
      start.setDate(now.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { start, end }
    }
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { start, end }
    }
  }
}

// Calculate progress percentage
export function calculateProgress(spent: number, budgeted: number): number {
  if (budgeted <= 0) return 0
  return Math.round((spent / budgeted) * 100)
}

// Get progress color based on percentage
export function getProgressColor(percentage: number, alertThreshold: number): string {
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= alertThreshold) return 'bg-amber-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

// Get progress text color
export function getProgressTextColor(percentage: number, alertThreshold: number): string {
  if (percentage >= 100) return 'text-red-600'
  if (percentage >= alertThreshold) return 'text-amber-600'
  return 'text-gray-600'
}

