import { z } from 'zod'

export const accountTypeEnum = z.enum(['checking', 'savings', 'credit_card', 'investment', 'cash', 'other'])

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo'),
  type: accountTypeEnum,
  balance: z
    .number()
    .min(0, 'Saldo inicial não pode ser negativo')
    .default(0),
  currency: z.string().default('BRL'),
})

export const updateAccountSchema = createAccountSchema.partial()

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type AccountType = z.infer<typeof accountTypeEnum>

// Labels para tipos de conta
export const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  investment: 'Investimentos',
  cash: 'Dinheiro',
  other: 'Outros',
}

// Ícones para tipos de conta
export const accountTypeIcons: Record<AccountType, string> = {
  checking: '🏦',
  savings: '🐷',
  credit_card: '💳',
  investment: '📈',
  cash: '💵',
  other: '📋',
}

