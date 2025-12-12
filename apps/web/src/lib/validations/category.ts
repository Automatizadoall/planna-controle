import { z } from 'zod'

export const categoryTypeEnum = z.enum(['income', 'expense'])

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  icon: z.string().min(1, 'Selecione um ícone').max(10),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  type: categoryTypeEnum,
  parentId: z.string().uuid().nullable().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryType = z.infer<typeof categoryTypeEnum>

// Common expense icons
export const expenseIcons = [
  '🍔', '🚗', '🏠', '🎬', '💊', '📚', '🛒', '📱', '📦',
  '✈️', '👕', '💇', '🐕', '🎮', '🎁', '💪', '⚽', '🍺',
]

// Common income icons
export const incomeIcons = [
  '💼', '💻', '📈', '🎁', '💰', '📦', '🏦', '💳', '🤝',
]

// Predefined colors
export const categoryColors = [
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#10B981', // emerald
  '#14B8A6', // teal
  '#F472B6', // pink
  '#FBBF24', // yellow
  '#6B7280', // gray
]

