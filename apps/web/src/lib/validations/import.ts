import { z } from 'zod'

// Supported date formats for parsing
export const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (ex: 25/12/2024)', regex: /^\d{2}\/\d{2}\/\d{4}$/ },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA (ex: 12/25/2024)', regex: /^\d{2}\/\d{2}\/\d{4}$/ },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD (ex: 2024-12-25)', regex: /^\d{4}-\d{2}-\d{2}$/ },
  { value: 'DD-MM-YYYY', label: 'DD-MM-AAAA (ex: 25-12-2024)', regex: /^\d{2}-\d{2}-\d{4}$/ },
]

// Column mapping schema
export const columnMappingSchema = z.object({
  date: z.string().min(1, 'Selecione a coluna de data'),
  description: z.string().min(1, 'Selecione a coluna de descrição'),
  amount: z.string().min(1, 'Selecione a coluna de valor'),
  type: z.string().optional(), // Optional: column that indicates income/expense
})

export type ColumnMapping = z.infer<typeof columnMappingSchema>

// Import configuration schema
export const importConfigSchema = z.object({
  accountId: z.string().uuid('Selecione uma conta'),
  dateFormat: z.string().min(1, 'Selecione o formato de data'),
  delimiter: z.string().min(1, 'Selecione o delimitador'),
  hasHeader: z.boolean().default(true),
  columnMapping: columnMappingSchema,
  invertAmounts: z.boolean().default(false), // Some banks use negative for income
})

export type ImportConfig = z.infer<typeof importConfigSchema>

// Parsed transaction from CSV
export interface ParsedTransaction {
  rowNumber: number
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  suggestedCategoryId: string | null
  suggestedCategoryName: string | null
  isDuplicate: boolean
  duplicateOf: string | null // Transaction ID if duplicate
  isValid: boolean
  errors: string[]
}

// Import session for tracking progress
export interface ImportSession {
  id: string
  fileName: string
  totalRows: number
  parsedRows: number
  validRows: number
  duplicateRows: number
  importedRows: number
  status: 'parsing' | 'mapping' | 'preview' | 'importing' | 'completed' | 'error'
  error?: string
}

// Delimiter options
export const delimiters = [
  { value: ',', label: 'Vírgula (,)' },
  { value: ';', label: 'Ponto e vírgula (;)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
]

// Parse date based on format
export function parseDate(dateStr: string, format: string): Date | null {
  try {
    const parts = dateStr.split(/[-\/]/)
    if (parts.length !== 3) return null

    let year: number, month: number, day: number

    switch (format) {
      case 'DD/MM/YYYY':
      case 'DD-MM-YYYY':
        day = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10) - 1
        year = parseInt(parts[2], 10)
        break
      case 'MM/DD/YYYY':
        month = parseInt(parts[0], 10) - 1
        day = parseInt(parts[1], 10)
        year = parseInt(parts[2], 10)
        break
      case 'YYYY-MM-DD':
        year = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10) - 1
        day = parseInt(parts[2], 10)
        break
      default:
        return null
    }

    const date = new Date(year, month, day)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

// Parse amount from string (handles Brazilian format)
export function parseAmount(amountStr: string): number | null {
  try {
    // Remove currency symbols and spaces
    let cleaned = amountStr.replace(/[R$\s]/g, '').trim()

    // Handle Brazilian format (1.234,56 -> 1234.56)
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // 1.234,56 format
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.')
      }
    } else if (cleaned.includes(',')) {
      // 1234,56 format
      cleaned = cleaned.replace(',', '.')
    }

    const amount = parseFloat(cleaned)
    if (isNaN(amount)) return null
    return amount
  } catch {
    return null
  }
}

// Parse CSV content
export function parseCSV(content: string, delimiter: string, hasHeader: boolean): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  const rows: string[][] = []

  for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
    const line = lines[i]
    // Simple CSV parsing (doesn't handle quoted fields with delimiters)
    const cells = line.split(delimiter).map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
    if (cells.length > 1) {
      rows.push(cells)
    }
  }

  return rows
}

// Get headers from CSV
export function getCSVHeaders(content: string, delimiter: string): string[] {
  const firstLine = content.split(/\r?\n/)[0]
  if (!firstLine) return []
  return firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''))
}

// Detect delimiter automatically
export function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/)[0] || ''
  const counts = delimiters.map((d) => ({
    delimiter: d.value,
    count: (firstLine.match(new RegExp(d.value === '|' ? '\\|' : d.value, 'g')) || []).length,
  }))
  const best = counts.reduce((a, b) => (b.count > a.count ? b : a))
  return best.count > 0 ? best.delimiter : ','
}

// Detect date format from sample
export function detectDateFormat(samples: string[]): string | null {
  for (const format of dateFormats) {
    const matches = samples.filter((s) => format.regex.test(s))
    if (matches.length >= samples.length * 0.8) {
      return format.value
    }
  }
  return null
}

