import { z } from 'zod'

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  targetAmount: z.number().positive('Valor deve ser maior que zero'),
  currentAmount: z.number().min(0, 'Valor inicial não pode ser negativo').default(0),
  targetDate: z.string().optional(),
  icon: z.string().max(10).default('🎯'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#10B981'),
})

export const updateGoalSchema = createGoalSchema.partial()

export const contributionSchema = z.object({
  goalId: z.string().uuid('Meta inválida'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().max(200).optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type ContributionInput = z.infer<typeof contributionSchema>

// Modern goal icons (Lucide format)
export const goalIcons = [
  'lucide:target',
  'lucide:home',
  'lucide:car',
  'lucide:plane',
  'lucide:laptop',
  'lucide:smartphone',
  'lucide:graduation-cap',
  'lucide:gem',
  'lucide:baby',
  'lucide:palmtree',
  'lucide:guitar',
  'lucide:book-open',
  'lucide:dumbbell',
  'lucide:heart-pulse',
  'lucide:gift',
  'lucide:piggy-bank',
  'lucide:briefcase',
  'lucide:camera',
  'lucide:music',
  'lucide:globe',
]

// Modern goal colors (refined palette)
export const goalColors = [
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#F43F5E', // rose
  '#F97316', // orange
]

// Calculate progress percentage
export function calculateGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

// Calculate days remaining
export function calculateDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null
  const target = new Date(targetDate)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Calculate monthly savings needed
export function calculateMonthlySavingsNeeded(
  remaining: number,
  targetDate: string | null
): number | null {
  if (!targetDate || remaining <= 0) return null
  const daysRemaining = calculateDaysRemaining(targetDate)
  if (!daysRemaining || daysRemaining <= 0) return null
  const monthsRemaining = daysRemaining / 30
  return Math.ceil(remaining / monthsRemaining)
}

// Get progress color
export function getGoalProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-500'
  if (percentage >= 75) return 'bg-emerald-400'
  if (percentage >= 50) return 'bg-blue-500'
  if (percentage >= 25) return 'bg-blue-400'
  return 'bg-indigo-500'
}

// Format remaining time
export function formatRemainingTime(days: number | null): string {
  if (days === null) return 'Sem prazo'
  if (days === 0) return 'Hoje!'
  if (days === 1) return '1 dia'
  if (days < 30) return `${days} dias`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 mês' : `${months} meses`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? '1 ano' : `${years} anos`
}

