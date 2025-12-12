import { z } from 'zod'

// E.164 international phone format: +[country code][number]
// Examples: +5511999998888, +14155552671
const phoneRegex = /^\+[1-9]\d{6,14}$/

export const phoneNumberSchema = z
  .string()
  .regex(phoneRegex, 'Telefone deve estar no formato internacional (ex: +5511999998888)')
  .or(z.literal(''))
  .optional()
  .nullable()

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  avatar_url: z.string().url().optional().nullable().or(z.literal('')),
  phone_number: phoneNumberSchema,
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Helper to format phone number for display
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Format: +55 11 99999-8888
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    // Brazilian format
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  
  // Generic international format
  return phone
}

// Helper to normalize phone number for storage
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone || phone.trim() === '') return null
  
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '')
  
  // Ensure starts with +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized
  }
  
  return normalized
}


