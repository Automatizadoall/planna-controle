'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Account, Category } from '@mentoria/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, ArrowRight, FileText, AlertTriangle } from 'lucide-react'
import {
  getCSVHeaders,
  parseCSV,
  detectDelimiter,
  detectDateFormat,
  delimiters,
  dateFormats,
  parseDate,
  parseAmount,
  type ImportConfig,
  type ParsedTransaction,
} from '@/lib/validations/import'
import { autoCategorize } from '../../categories/actions'
import { accountTypeIcons } from '@/lib/validations/account'

interface MappingStepProps {
  fileContent: string
  fileName: string
  accounts: Account[]
  categories: Category[]
  onConfigured: (config: ImportConfig, transactions: ParsedTransaction[]) => void
  onBack: () => void
}

export function MappingStep({
  fileContent,
  fileName,
  accounts,
  categories,
  onConfigured,
  onBack,
}: MappingStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Auto-detect settings
  const detectedDelimiter = useMemo(() => detectDelimiter(fileContent), [fileContent])

  // Config state
  const [delimiter, setDelimiter] = useState(detectedDelimiter)
  const [hasHeader, setHasHeader] = useState(true)
  const [accountId, setAccountId] = useState<string>('')
  const [dateColumn, setDateColumn] = useState<string>('')
  const [descriptionColumn, setDescriptionColumn] = useState<string>('')
  const [amountColumn, setAmountColumn] = useState<string>('')
  const [dateFormat, setDateFormat] = useState<string>('')
  const [invertAmounts, setInvertAmounts] = useState(false)

  // Get headers based on current delimiter
  const headers = useMemo(
    () => getCSVHeaders(fileContent, delimiter),
    [fileContent, delimiter]
  )

  // Preview data
  const previewRows = useMemo(
    () => parseCSV(fileContent, delimiter, hasHeader).slice(0, 5),
    [fileContent, delimiter, hasHeader]
  )

  // Auto-detect date format from sample data
  useEffect(() => {
    if (dateColumn && previewRows.length > 0) {
      const colIndex = headers.indexOf(dateColumn)
      if (colIndex >= 0) {
        const samples = previewRows.map((row) => row[colIndex]).filter(Boolean)
        const detected = detectDateFormat(samples)
        if (detected) {
          setDateFormat(detected)
        }
      }
    }
  }, [dateColumn, headers, previewRows])

  // Auto-select columns based on common names
  useEffect(() => {
    if (headers.length > 0 && !dateColumn) {
      const dateNames = ['data', 'date', 'dt', 'Data', 'DATA', 'Data Transação', 'Data Lançamento']
      const found = headers.find((h) => dateNames.some((n) => h.toLowerCase().includes(n.toLowerCase())))
      if (found) setDateColumn(found)
    }
    if (headers.length > 0 && !descriptionColumn) {
      const descNames = ['descrição', 'descricao', 'description', 'desc', 'histórico', 'historico', 'Descrição', 'DESCRIÇÃO', 'Lançamento']
      const found = headers.find((h) => descNames.some((n) => h.toLowerCase().includes(n.toLowerCase())))
      if (found) setDescriptionColumn(found)
    }
    if (headers.length > 0 && !amountColumn) {
      const amountNames = ['valor', 'value', 'amount', 'Valor', 'VALOR', 'Quantia']
      const found = headers.find((h) => amountNames.some((n) => h.toLowerCase().includes(n.toLowerCase())))
      if (found) setAmountColumn(found)
    }
  }, [headers, dateColumn, descriptionColumn, amountColumn])

  const handleProcess = async () => {
    setErrors([])

    // Validation
    const validationErrors: string[] = []
    if (!accountId) validationErrors.push('Selecione uma conta')
    if (!dateColumn) validationErrors.push('Selecione a coluna de data')
    if (!descriptionColumn) validationErrors.push('Selecione a coluna de descrição')
    if (!amountColumn) validationErrors.push('Selecione a coluna de valor')
    if (!dateFormat) validationErrors.push('Selecione o formato de data')

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsProcessing(true)

    try {
      const allRows = parseCSV(fileContent, delimiter, hasHeader)
      const dateColIndex = headers.indexOf(dateColumn)
      const descColIndex = headers.indexOf(descriptionColumn)
      const amountColIndex = headers.indexOf(amountColumn)

      const parsedTransactions: ParsedTransaction[] = []

      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i]
        const rowErrors: string[] = []

        // Parse date
        const dateStr = row[dateColIndex]
        const parsedDate = parseDate(dateStr, dateFormat)
        if (!parsedDate) {
          rowErrors.push('Data inválida')
        }

        // Parse description
        const description = row[descColIndex]?.trim()
        if (!description) {
          rowErrors.push('Descrição vazia')
        }

        // Parse amount
        const amountStr = row[amountColIndex]
        let amount = parseAmount(amountStr)
        if (amount === null) {
          rowErrors.push('Valor inválido')
          amount = 0
        }

        // Determine type
        let type: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense'
        if (invertAmounts) {
          type = type === 'income' ? 'expense' : 'income'
        }
        amount = Math.abs(amount)

        // Auto-categorize
        let suggestedCategoryId: string | null = null
        let suggestedCategoryName: string | null = null
        if (description) {
          const result = await autoCategorize(description)
          if (result.categoryId) {
            const category = categories.find((c) => c.id === result.categoryId && c.type === type)
            if (category) {
              suggestedCategoryId = result.categoryId
              suggestedCategoryName = category.name
            }
          }
        }

        parsedTransactions.push({
          rowNumber: i + (hasHeader ? 2 : 1),
          date: parsedDate ? parsedDate.toISOString().split('T')[0] : '',
          description: description || '',
          amount,
          type,
          suggestedCategoryId,
          suggestedCategoryName,
          isDuplicate: false, // Will be checked in preview step
          duplicateOf: null,
          isValid: rowErrors.length === 0,
          errors: rowErrors,
        })
      }

      const config: ImportConfig = {
        accountId,
        dateFormat,
        delimiter,
        hasHeader,
        invertAmounts,
        columnMapping: {
          date: dateColumn,
          description: descriptionColumn,
          amount: amountColumn,
        },
      }

      onConfigured(config, parsedTransactions)
    } catch (error) {
      setErrors(['Erro ao processar arquivo. Verifique o formato.'])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
        <FileText className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{fileName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {previewRows.length > 0 ? `${headers.length} colunas detectadas` : 'Processando...'}
          </p>
        </div>
      </div>

      {/* Account Selection */}
      <div className="space-y-2">
        <Label>Conta de destino *</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span className="flex items-center gap-2">
                  <span>{accountTypeIcons[account.type as keyof typeof accountTypeIcons]}</span>
                  <span>{account.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Delimiter & Header */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Delimitador</Label>
          <Select value={delimiter} onValueChange={setDelimiter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {delimiters.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="hasHeader" className="cursor-pointer">
            Primeira linha é cabeçalho
          </Label>
          <Switch
            id="hasHeader"
            checked={hasHeader}
            onCheckedChange={setHasHeader}
          />
        </div>
      </div>

      {/* Column Mapping */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Mapeamento de Colunas</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Coluna de Data *</Label>
            <Select value={dateColumn} onValueChange={setDateColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Coluna de Descrição *</Label>
            <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Coluna de Valor *</Label>
            <Select value={amountColumn} onValueChange={setAmountColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Date Format & Invert */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Formato de Data *</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="invertAmounts" className="cursor-pointer">
              Inverter sinais
            </Label>
            <p className="text-xs text-gray-500">
              Alguns bancos usam negativo para receitas
            </p>
          </div>
          <Switch
            id="invertAmounts"
            checked={invertAmounts}
            onCheckedChange={setInvertAmounts}
          />
        </div>
      </div>

      {/* Preview Table */}
      {previewRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Preview (primeiras 5 linhas)</h3>
          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-t dark:border-gray-700">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Corrija os erros:</span>
          </div>
          <ul className="mt-2 list-inside list-disc text-sm text-red-600">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleProcess} disabled={isProcessing}>
          {isProcessing ? (
            'Processando...'
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

