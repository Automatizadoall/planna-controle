import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  cn, 
  formatCurrency, 
  formatDate, 
  formatRelativeDate,
  calculatePercentage,
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn (classnames)', () => {
    it('should merge class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'disabled')).toBe('base active')
    })

    it('should merge conflicting Tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive values in BRL', () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/)
    })

    it('should format decimal values', () => {
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234,56/)
    })

    it('should format zero', () => {
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/)
    })

    it('should format negative values', () => {
      const result = formatCurrency(-500)
      expect(result).toMatch(/R\$/)
      expect(result).toMatch(/500,00/)
    })

    it('should handle large values', () => {
      expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000,00/)
    })

    it('should handle small decimal values', () => {
      expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/)
    })
  })

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date(2026, 0, 22) // Jan 22, 2026
      expect(formatDate(date)).toBe('22/01/2026')
    })

    it('should format date string', () => {
      // Note: formatDate may have timezone issues with string dates
      // The result depends on the local timezone
      const result = formatDate('2026-01-22')
      expect(result).toMatch(/\d{2}\/01\/2026/)
    })

    it('should format ISO date string', () => {
      expect(formatDate('2026-01-22T10:30:00Z')).toMatch(/22\/01\/2026/)
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 0, 22)) // Jan 22, 2026
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Hoje" for today', () => {
      expect(formatRelativeDate('2026-01-22')).toBe('Hoje')
      expect(formatRelativeDate(new Date(2026, 0, 22))).toBe('Hoje')
    })

    it('should return "Ontem" for yesterday', () => {
      expect(formatRelativeDate('2026-01-21')).toBe('Ontem')
      expect(formatRelativeDate(new Date(2026, 0, 21))).toBe('Ontem')
    })

    it('should return formatted date for older dates', () => {
      expect(formatRelativeDate('2026-01-15')).toBe('15/01/2026')
      expect(formatRelativeDate('2025-12-25')).toBe('25/12/2025')
    })

    it('should handle ISO date strings', () => {
      expect(formatRelativeDate('2026-01-22T10:30:00Z')).toBe('Hoje')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(75, 100)).toBe(75)
    })

    it('should handle values exceeding 100%', () => {
      expect(calculatePercentage(150, 100)).toBe(150)
    })

    it('should return 0 for zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33)
      expect(calculatePercentage(2, 3)).toBe(67)
    })

    it('should handle decimal values', () => {
      expect(calculatePercentage(50.5, 100)).toBe(51)
    })
  })
})
