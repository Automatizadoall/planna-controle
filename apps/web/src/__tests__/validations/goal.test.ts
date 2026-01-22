import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  createGoalSchema, 
  contributionSchema,
  calculateGoalProgress,
  calculateDaysRemaining,
  calculateMonthlySavingsNeeded,
  getGoalProgressColor,
  formatRemainingTime,
} from '@/lib/validations/goal'

describe('Goal Validations', () => {
  const validGoalId = '123e4567-e89b-12d3-a456-426614174000'

  describe('createGoalSchema', () => {
    it('should validate a valid goal', () => {
      const data = {
        name: 'Viagem para Europa',
        targetAmount: 15000,
        currentAmount: 5000,
        targetDate: '2027-12-31',
        icon: '✈️',
        color: '#10B981',
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should use default values', () => {
      const data = {
        name: 'Nova Meta',
        targetAmount: 1000,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currentAmount).toBe(0)
        expect(result.data.icon).toBe('🎯')
        expect(result.data.color).toBe('#10B981')
      }
    })

    it('should reject empty name', () => {
      const data = {
        name: '',
        targetAmount: 1000,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject name over 100 chars', () => {
      const data = {
        name: 'a'.repeat(101),
        targetAmount: 1000,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject zero target amount', () => {
      const data = {
        name: 'Meta',
        targetAmount: 0,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative target amount', () => {
      const data = {
        name: 'Meta',
        targetAmount: -1000,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative current amount', () => {
      const data = {
        name: 'Meta',
        targetAmount: 1000,
        currentAmount: -100,
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid color format', () => {
      const data = {
        name: 'Meta',
        targetAmount: 1000,
        color: 'red', // Invalid - should be hex
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept valid hex colors', () => {
      const data = {
        name: 'Meta',
        targetAmount: 1000,
        color: '#FF5733',
      }

      const result = createGoalSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('contributionSchema', () => {
    it('should validate a valid contribution', () => {
      const data = {
        goalId: validGoalId,
        amount: 500,
        description: 'Contribuição mensal',
      }

      const result = contributionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject zero amount', () => {
      const data = {
        goalId: validGoalId,
        amount: 0,
      }

      const result = contributionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid goal UUID', () => {
      const data = {
        goalId: 'invalid',
        amount: 500,
      }

      const result = contributionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('calculateGoalProgress', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateGoalProgress(5000, 10000)).toBe(50)
      expect(calculateGoalProgress(7500, 10000)).toBe(75)
    })

    it('should cap at 100%', () => {
      expect(calculateGoalProgress(15000, 10000)).toBe(100)
    })

    it('should return 0 for zero target', () => {
      expect(calculateGoalProgress(5000, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateGoalProgress(333, 1000)).toBe(33)
      expect(calculateGoalProgress(336, 1000)).toBe(34)
    })
  })

  describe('calculateDaysRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 0, 22)) // Jan 22, 2026
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return null for null date', () => {
      expect(calculateDaysRemaining(null)).toBe(null)
    })

    it('should calculate days correctly', () => {
      expect(calculateDaysRemaining('2026-01-23')).toBe(1)
      expect(calculateDaysRemaining('2026-01-29')).toBe(7)
    })

    it('should return 0 for past dates', () => {
      expect(calculateDaysRemaining('2026-01-01')).toBe(0)
    })

    it('should return 0 for today', () => {
      expect(calculateDaysRemaining('2026-01-22')).toBe(0)
    })
  })

  describe('calculateMonthlySavingsNeeded', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 0, 22)) // Jan 22, 2026
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return null for null date', () => {
      expect(calculateMonthlySavingsNeeded(5000, null)).toBe(null)
    })

    it('should return null for zero remaining', () => {
      expect(calculateMonthlySavingsNeeded(0, '2026-12-31')).toBe(null)
    })

    it('should return null for negative remaining', () => {
      expect(calculateMonthlySavingsNeeded(-100, '2026-12-31')).toBe(null)
    })

    it('should calculate monthly savings correctly', () => {
      // ~11 months until Dec 31, 2026
      const result = calculateMonthlySavingsNeeded(11000, '2026-12-31')
      expect(result).toBeGreaterThan(900)
      expect(result).toBeLessThan(1100)
    })
  })

  describe('getGoalProgressColor', () => {
    it('should return emerald-500 for 100%', () => {
      expect(getGoalProgressColor(100)).toBe('bg-emerald-500')
    })

    it('should return emerald-400 for 75-99%', () => {
      expect(getGoalProgressColor(75)).toBe('bg-emerald-400')
      expect(getGoalProgressColor(99)).toBe('bg-emerald-400')
    })

    it('should return blue-500 for 50-74%', () => {
      expect(getGoalProgressColor(50)).toBe('bg-blue-500')
      expect(getGoalProgressColor(74)).toBe('bg-blue-500')
    })

    it('should return blue-400 for 25-49%', () => {
      expect(getGoalProgressColor(25)).toBe('bg-blue-400')
      expect(getGoalProgressColor(49)).toBe('bg-blue-400')
    })

    it('should return indigo-500 for below 25%', () => {
      expect(getGoalProgressColor(24)).toBe('bg-indigo-500')
      expect(getGoalProgressColor(0)).toBe('bg-indigo-500')
    })
  })

  describe('formatRemainingTime', () => {
    it('should return "Sem prazo" for null', () => {
      expect(formatRemainingTime(null)).toBe('Sem prazo')
    })

    it('should return "Hoje!" for 0 days', () => {
      expect(formatRemainingTime(0)).toBe('Hoje!')
    })

    it('should return "1 dia" for 1 day', () => {
      expect(formatRemainingTime(1)).toBe('1 dia')
    })

    it('should return days for less than 30 days', () => {
      expect(formatRemainingTime(15)).toBe('15 dias')
      expect(formatRemainingTime(29)).toBe('29 dias')
    })

    it('should return months for 30-364 days', () => {
      expect(formatRemainingTime(30)).toBe('1 mês')
      expect(formatRemainingTime(60)).toBe('2 meses')
      expect(formatRemainingTime(180)).toBe('6 meses')
    })

    it('should return years for 365+ days', () => {
      expect(formatRemainingTime(365)).toBe('1 ano')
      expect(formatRemainingTime(730)).toBe('2 anos')
    })
  })
})
