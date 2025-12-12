import { z } from 'zod'

export const recurringFrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly'])
export const transactionTypeEnum = z.enum(['income', 'expense'])

export const createRecurringSchema = z.object({
  accountId: z.string().uuid('Selecione uma conta'),
  categoryId: z.string().uuid('Selecione uma categoria').nullable().optional(),
  type: transactionTypeEnum,
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  frequency: recurringFrequencyEnum,
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
})

export const updateRecurringSchema = createRecurringSchema.partial()

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>
export type RecurringFrequency = z.infer<typeof recurringFrequencyEnum>

// Labels for frequency
export const frequencyLabels: Record<RecurringFrequency, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

// Frequency icons
export const frequencyIcons: Record<RecurringFrequency, string> = {
  daily: '📅',
  weekly: '📆',
  monthly: '🗓️',
  yearly: '🎂',
}

// Calculate next occurrence from a date
export function calculateNextOccurrence(
  fromDate: Date,
  frequency: RecurringFrequency
): Date {
  const next = new Date(fromDate)
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next
}

// Format frequency for display
export function formatFrequency(frequency: RecurringFrequency): string {
  return frequencyLabels[frequency]
}

// Check if recurring is due
export function isDue(nextOccurrence: string): boolean {
  const next = new Date(nextOccurrence)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  return next <= today
}

// Check if recurring is upcoming (within 7 days)
export function isUpcoming(nextOccurrence: string): boolean {
  const next = new Date(nextOccurrence)
  const today = new Date()
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  weekFromNow.setHours(23, 59, 59, 999)
  
  return next > today && next <= weekFromNow
}

// Format next occurrence relative to today
export function formatNextOccurrence(nextOccurrence: string): string {
  const next = new Date(nextOccurrence)
  const today = new Date()
  
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  
  const diffTime = next.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `${Math.abs(diffDays)} dias atrasado`
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays <= 7) return `Em ${diffDays} dias`
  if (diffDays <= 30) return `Em ${Math.ceil(diffDays / 7)} semanas`
  
  return next.toLocaleDateString('pt-BR')
}

