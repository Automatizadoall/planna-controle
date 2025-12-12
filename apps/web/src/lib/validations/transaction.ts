import { z } from 'zod'

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer'])

// Schema base sem refinement (para permitir .partial())
export const transactionBaseSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  date: z.string().refine((date) => {
    const d = new Date(date)
    const maxFuture = new Date()
    maxFuture.setDate(maxFuture.getDate() + 30)
    return d <= maxFuture
  }, 'Data não pode ser mais de 30 dias no futuro'),
  accountId: z.string().uuid('Conta inválida'),
  categoryId: z.string().uuid('Categoria inválida').nullable().optional(),
  toAccountId: z.string().uuid('Conta destino inválida').nullable().optional(),
  tags: z.array(z.string()).optional(),
})

// Schema com refinement para criar transações
export const createTransactionSchema = transactionBaseSchema.refine(
  (data) => {
    if (data.type === 'transfer') {
      return !!data.toAccountId && data.toAccountId !== data.accountId
    }
    return true
  },
  {
    message: 'Transferência requer conta destino diferente da origem',
    path: ['toAccountId'],
  }
)

// Schema parcial para atualizações
export const updateTransactionSchema = transactionBaseSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionType = z.infer<typeof transactionTypeEnum>

// Labels para tipos de transação
export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

// Cores para tipos de transação
export const transactionTypeColors: Record<TransactionType, string> = {
  income: 'text-income',
  expense: 'text-expense',
  transfer: 'text-transfer',
}

// Ícones para tipos de transação
export const transactionTypeIcons: Record<TransactionType, string> = {
  income: '↑',
  expense: '↓',
  transfer: '↔',
}

