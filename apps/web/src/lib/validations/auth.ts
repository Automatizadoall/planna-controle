import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .refine((val) => /[a-z]/.test(val), 'Senha deve conter letra minúscula')
      .refine((val) => /[A-Z]/.test(val), 'Senha deve conter letra maiúscula')
      .refine((val) => /\d/.test(val), 'Senha deve conter número')
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), 'Senha deve conter caractere especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

