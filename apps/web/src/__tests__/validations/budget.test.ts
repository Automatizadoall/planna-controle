import { describe, it, expect } from 'vitest'
import { 
  createBudgetSchema, 
  budgetPeriodEnum,
  budgetPeriodLabels,
  getPeriodDateRange,
  calculateProgress,
  getProgressColor,
  getProgressTextColor,
} from '@/lib/validations/budget'

describe('Budget Validations', () => {
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174000'

  describe('budgetPeriodEnum', () => {
    it('should accept valid periods', () => {
      expect(budgetPeriodEnum.safeParse('monthly').success).toBe(true)
      expect(budgetPeriodEnum.safeParse('weekly').success).toBe(true)
      expect(budgetPeriodEnum.safeParse('yearly').success).toBe(true)
    })

    it('should reject invalid periods', () => {
      expect(budgetPeriodEnum.safeParse('daily').success).toBe(false)
      expect(budgetPeriodEnum.safeParse('').success).toBe(false)
    })
  })

  describe('createBudgetSchema', () => {
    it('should validate a valid monthly budget', () => {
      const data = {
        categoryId: validCategoryId,
        amount: 500,
        period: 'monthly' as const,
        alertThreshold: 80,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should use default values', () => {
      const data = {
        categoryId: validCategoryId,
        amount: 500,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.period).toBe('monthly')
        expect(result.data.alertThreshold).toBe(80)
      }
    })

    it('should reject zero amount', () => {
      const data = {
        categoryId: validCategoryId,
        amount: 0,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const data = {
        categoryId: validCategoryId,
        amount: -100,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject alertThreshold below 50', () => {
      const data = {
        categoryId: validCategoryId,
        amount: 500,
        alertThreshold: 49,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject alertThreshold above 100', () => {
      const data = {
        categoryId: validCategoryId,
        amount: 500,
        alertThreshold: 101,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept alertThreshold at boundaries', () => {
      const data50 = {
        categoryId: validCategoryId,
        amount: 500,
        alertThreshold: 50,
      }

      const data100 = {
        categoryId: validCategoryId,
        amount: 500,
        alertThreshold: 100,
      }

      expect(createBudgetSchema.safeParse(data50).success).toBe(true)
      expect(createBudgetSchema.safeParse(data100).success).toBe(true)
    })

    it('should reject invalid category UUID', () => {
      const data = {
        categoryId: 'invalid-uuid',
        amount: 500,
      }

      const result = createBudgetSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('budgetPeriodLabels', () => {
    it('should have labels for all periods', () => {
      expect(budgetPeriodLabels.monthly).toBe('Mensal')
      expect(budgetPeriodLabels.weekly).toBe('Semanal')
      expect(budgetPeriodLabels.yearly).toBe('Anual')
    })
  })

  describe('getPeriodDateRange', () => {
    it('should calculate monthly range correctly', () => {
      const refDate = new Date(2026, 0, 15) // Jan 15, 2026
      const { start, end } = getPeriodDateRange('monthly', refDate)

      expect(start.getDate()).toBe(1)
      expect(start.getMonth()).toBe(0) // January
      expect(end.getDate()).toBe(31)
      expect(end.getMonth()).toBe(0) // January
    })

    it('should calculate weekly range correctly', () => {
      // Wednesday, Jan 15, 2026
      const refDate = new Date(2026, 0, 15)
      const { start, end } = getPeriodDateRange('weekly', refDate)

      expect(start.getDay()).toBe(0) // Sunday (start of week)
      expect(end.getDay()).toBe(6) // Saturday (end of week)
    })

    it('should calculate yearly range correctly', () => {
      const refDate = new Date(2026, 5, 15) // June 15, 2026
      const { start, end } = getPeriodDateRange('yearly', refDate)

      expect(start.getMonth()).toBe(0) // January
      expect(start.getDate()).toBe(1)
      expect(end.getMonth()).toBe(11) // December
      expect(end.getDate()).toBe(31)
    })
  })

  describe('calculateProgress', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50)
      expect(calculateProgress(75, 100)).toBe(75)
      expect(calculateProgress(100, 100)).toBe(100)
    })

    it('should handle exceeding budget', () => {
      expect(calculateProgress(150, 100)).toBe(150)
    })

    it('should return 0 for zero budget', () => {
      expect(calculateProgress(50, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateProgress(33, 100)).toBe(33)
      expect(calculateProgress(33.6, 100)).toBe(34)
    })
  })

  describe('getProgressColor', () => {
    it('should return red for 100% or more', () => {
      expect(getProgressColor(100, 80)).toBe('bg-red-500')
      expect(getProgressColor(120, 80)).toBe('bg-red-500')
    })

    it('should return amber when at or above alert threshold', () => {
      expect(getProgressColor(80, 80)).toBe('bg-amber-500')
      expect(getProgressColor(90, 80)).toBe('bg-amber-500')
    })

    it('should return yellow when between 50-79%', () => {
      expect(getProgressColor(50, 80)).toBe('bg-yellow-500')
      expect(getProgressColor(79, 80)).toBe('bg-yellow-500')
    })

    it('should return emerald when below 50%', () => {
      expect(getProgressColor(49, 80)).toBe('bg-emerald-500')
      expect(getProgressColor(0, 80)).toBe('bg-emerald-500')
    })
  })

  describe('getProgressTextColor', () => {
    it('should return red text for 100% or more', () => {
      expect(getProgressTextColor(100, 80)).toBe('text-red-600')
      expect(getProgressTextColor(150, 80)).toBe('text-red-600')
    })

    it('should return amber text when at or above threshold', () => {
      expect(getProgressTextColor(80, 80)).toBe('text-amber-600')
      expect(getProgressTextColor(95, 80)).toBe('text-amber-600')
    })

    it('should return gray text when below threshold', () => {
      expect(getProgressTextColor(50, 80)).toBe('text-gray-600')
      expect(getProgressTextColor(0, 80)).toBe('text-gray-600')
    })
  })
})
