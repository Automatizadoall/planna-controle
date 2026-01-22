import { describe, it, expect } from 'vitest'
import { 
  createTransactionSchema, 
  updateTransactionSchema,
  transactionTypeEnum,
  transactionTypeLabels,
} from '@/lib/validations/transaction'

describe('Transaction Validations', () => {
  const validAccountId = '123e4567-e89b-12d3-a456-426614174000'
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001'
  const validToAccountId = '123e4567-e89b-12d3-a456-426614174002'
  const today = new Date().toISOString().split('T')[0]

  describe('transactionTypeEnum', () => {
    it('should accept valid transaction types', () => {
      expect(transactionTypeEnum.safeParse('income').success).toBe(true)
      expect(transactionTypeEnum.safeParse('expense').success).toBe(true)
      expect(transactionTypeEnum.safeParse('transfer').success).toBe(true)
    })

    it('should reject invalid transaction types', () => {
      expect(transactionTypeEnum.safeParse('invalid').success).toBe(false)
      expect(transactionTypeEnum.safeParse('').success).toBe(false)
    })
  })

  describe('createTransactionSchema', () => {
    it('should validate a valid income transaction', () => {
      const data = {
        type: 'income' as const,
        amount: 1000,
        date: today,
        accountId: validAccountId,
        categoryId: validCategoryId,
        description: 'Salário',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate a valid expense transaction', () => {
      const data = {
        type: 'expense' as const,
        amount: 50.5,
        date: today,
        accountId: validAccountId,
        categoryId: validCategoryId,
        description: 'Almoço',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate a valid transfer transaction', () => {
      const data = {
        type: 'transfer' as const,
        amount: 500,
        date: today,
        accountId: validAccountId,
        toAccountId: validToAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject transfer without destination account', () => {
      const data = {
        type: 'transfer' as const,
        amount: 500,
        date: today,
        accountId: validAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject transfer to same account', () => {
      const data = {
        type: 'transfer' as const,
        amount: 500,
        date: today,
        accountId: validAccountId,
        toAccountId: validAccountId, // Same as origin
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject zero amount', () => {
      const data = {
        type: 'expense' as const,
        amount: 0,
        date: today,
        accountId: validAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const data = {
        type: 'expense' as const,
        amount: -100,
        date: today,
        accountId: validAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject date more than 30 days in future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 31)
      
      const data = {
        type: 'expense' as const,
        amount: 100,
        date: futureDate.toISOString().split('T')[0],
        accountId: validAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept date up to 30 days in future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 29)
      
      const data = {
        type: 'expense' as const,
        amount: 100,
        date: futureDate.toISOString().split('T')[0],
        accountId: validAccountId,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid account UUID', () => {
      const data = {
        type: 'expense' as const,
        amount: 100,
        date: today,
        accountId: 'invalid-uuid',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept long description up to 500 chars', () => {
      const data = {
        type: 'expense' as const,
        amount: 100,
        date: today,
        accountId: validAccountId,
        description: 'a'.repeat(500),
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject description over 500 chars', () => {
      const data = {
        type: 'expense' as const,
        amount: 100,
        date: today,
        accountId: validAccountId,
        description: 'a'.repeat(501),
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('updateTransactionSchema', () => {
    it('should allow partial updates', () => {
      const data = {
        amount: 200,
      }

      const result = updateTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow empty update', () => {
      const result = updateTransactionSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('transactionTypeLabels', () => {
    it('should have labels for all types', () => {
      expect(transactionTypeLabels.income).toBe('Receita')
      expect(transactionTypeLabels.expense).toBe('Despesa')
      expect(transactionTypeLabels.transfer).toBe('Transferência')
    })
  })
})
