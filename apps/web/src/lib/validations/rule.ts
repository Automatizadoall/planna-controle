import { z } from 'zod'

export const createRuleSchema = z.object({
  categoryId: z.string().uuid('Selecione uma categoria'),
  pattern: z
    .string()
    .min(2, 'Padrão deve ter no mínimo 2 caracteres')
    .max(200, 'Padrão muito longo'),
  priority: z.number().min(0).max(100).default(90),
  isActive: z.boolean().default(true),
})

export const updateRuleSchema = createRuleSchema.partial()

export type CreateRuleInput = z.infer<typeof createRuleSchema>
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>

