import { describe, it, expect } from 'vitest'
import { cacheKeys, cacheGroups } from '@/lib/cache/keys'

describe('Cache Keys', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000'
  const accountId = '123e4567-e89b-12d3-a456-426614174001'

  describe('cacheKeys', () => {
    it('should generate profile key', () => {
      const key = cacheKeys.profile(userId)
      expect(key).toEqual(['profile', userId])
    })

    it('should generate accounts key', () => {
      const key = cacheKeys.accounts(userId)
      expect(key).toEqual(['accounts', userId])
    })

    it('should generate account key', () => {
      const key = cacheKeys.account(accountId)
      expect(key).toEqual(['account', accountId])
    })

    it('should generate categories key', () => {
      const key = cacheKeys.categories(userId)
      expect(key).toEqual(['categories', userId])
    })

    it('should generate transactions key without filters', () => {
      const key = cacheKeys.transactions(userId)
      expect(key).toEqual(['transactions', userId, undefined])
    })

    it('should generate transactions key with filters', () => {
      const filters = { type: 'expense', month: 1 }
      const key = cacheKeys.transactions(userId, filters)
      expect(key).toEqual(['transactions', userId, filters])
    })

    it('should generate transactionsMonth key', () => {
      const key = cacheKeys.transactionsMonth(userId, 2026, 0)
      expect(key).toEqual(['transactions', userId, 'month', 2026, 0])
    })

    it('should generate budgets key', () => {
      const key = cacheKeys.budgets(userId)
      expect(key).toEqual(['budgets', userId])
    })

    it('should generate budgetStatus key', () => {
      const key = cacheKeys.budgetStatus(userId)
      expect(key).toEqual(['budget-status', userId])
    })

    it('should generate goals key', () => {
      const key = cacheKeys.goals(userId)
      expect(key).toEqual(['goals', userId])
    })

    it('should generate recurring key', () => {
      const key = cacheKeys.recurring(userId)
      expect(key).toEqual(['recurring', userId])
    })

    it('should generate dashboardSummary key', () => {
      const key = cacheKeys.dashboardSummary(userId, 2026, 0)
      expect(key).toEqual(['dashboard', userId, 2026, 0])
    })
  })

  describe('cacheGroups', () => {
    it('should generate transactions group', () => {
      const group = cacheGroups.transactions(userId)
      expect(group).toHaveLength(3)
      expect(group[0]).toEqual({ queryKey: ['transactions', userId] })
      expect(group[1]).toEqual({ queryKey: ['dashboard', userId] })
      expect(group[2]).toEqual({ queryKey: ['budget-status', userId] })
    })

    it('should generate accounts group', () => {
      const group = cacheGroups.accounts(userId)
      expect(group).toHaveLength(2)
      expect(group[0]).toEqual({ queryKey: ['accounts', userId] })
      expect(group[1]).toEqual({ queryKey: ['dashboard', userId] })
    })

    it('should generate financial group with all related keys', () => {
      const group = cacheGroups.financial(userId)
      expect(group).toHaveLength(5)
      expect(group.map(g => g.queryKey[0])).toContain('transactions')
      expect(group.map(g => g.queryKey[0])).toContain('accounts')
      expect(group.map(g => g.queryKey[0])).toContain('budget-status')
      expect(group.map(g => g.queryKey[0])).toContain('dashboard')
      expect(group.map(g => g.queryKey[0])).toContain('goals')
    })
  })
})
