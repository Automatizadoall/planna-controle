import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '@/lib/validations/auth'

describe('Auth Validations', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration', () => {
      const validData = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
        confirmPassword: 'Senha@123',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject short name', () => {
      const data = {
        fullName: 'J',
        email: 'joao@example.com',
        password: 'Senha@123',
        confirmPassword: 'Senha@123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('should reject invalid email', () => {
      const data = {
        fullName: 'João Silva',
        email: 'invalid-email',
        password: 'Senha@123',
        confirmPassword: 'Senha@123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email inválido')
      }
    })

    it('should reject password without lowercase', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'SENHA@123',
        confirmPassword: 'SENHA@123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('letra minúscula'))).toBe(true)
      }
    })

    it('should reject password without uppercase', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'senha@123',
        confirmPassword: 'senha@123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('letra maiúscula'))).toBe(true)
      }
    })

    it('should reject password without number', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@abc',
        confirmPassword: 'Senha@abc',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('número'))).toBe(true)
      }
    })

    it('should reject password without special character', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha1234',
        confirmPassword: 'Senha1234',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('caractere especial'))).toBe(true)
      }
    })

    it('should reject mismatched passwords', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
        confirmPassword: 'Senha@456',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('não coincidem'))).toBe(true)
      }
    })

    it('should reject short password', () => {
      const data = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        password: 'Se@1',
        confirmPassword: 'Se@1',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('pelo menos 8 caracteres'))).toBe(true)
      }
    })
  })

  describe('loginSchema', () => {
    it('should validate a valid login', () => {
      const validData = {
        email: 'joao@example.com',
        password: 'qualquersenha',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid',
        password: 'senha123',
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const data = {
        email: 'joao@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
