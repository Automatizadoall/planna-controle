'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Category } from '@mentoria/database'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Copy,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { ImportConfig, ParsedTransaction } from '@/lib/validations/import'
import { importTransactions, checkDuplicates } from '../actions'

interface PreviewStepProps {
  transactions: ParsedTransaction[]
  config: ImportConfig
  categories: Category[]
  onImported: (result: { imported: number; skipped: number; errors: number }) => void
  onBack: () => void
}

export function PreviewStep({
  transactions: initialTransactions,
  config,
  categories,
  onImported,
  onBack,
}: PreviewStepProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isChecking, setIsChecking] = useState(true)
  const [isImporting, setIsImporting] = useState(false)

  // Filter categories by type
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  // Stats
  const stats = useMemo(() => {
    const valid = transactions.filter((t) => t.isValid)
    const duplicates = transactions.filter((t) => t.isDuplicate)
    const selected = transactions.filter((t) => selectedIds.has(t.rowNumber))
    const totalAmount = selected.reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
      0
    )

    return {
      total: transactions.length,
      valid: valid.length,
      duplicates: duplicates.length,
      invalid: transactions.length - valid.length,
      selected: selected.length,
      totalAmount,
    }
  }, [transactions, selectedIds])

  // Check for duplicates on mount
  useEffect(() => {
    async function check() {
      setIsChecking(true)
      try {
        const result = await checkDuplicates(
          config.accountId,
          transactions.map((t) => ({ date: t.date, amount: t.amount, description: t.description }))
        )

        setTransactions((prev) =>
          prev.map((t, i) => ({
            ...t,
            isDuplicate: result.duplicates[i] || false,
            duplicateOf: result.duplicateIds[i] || null,
          }))
        )

        // Auto-select non-duplicate valid transactions
        const autoSelected = new Set<number>()
        transactions.forEach((t, i) => {
          if (t.isValid && !result.duplicates[i]) {
            autoSelected.add(t.rowNumber)
          }
        })
        setSelectedIds(autoSelected)
      } catch (error) {
        console.error('Error checking duplicates:', error)
      } finally {
        setIsChecking(false)
      }
    }
    check()
  }, [config.accountId, transactions])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const validIds = transactions.filter((t) => t.isValid && !t.isDuplicate).map((t) => t.rowNumber)
      setSelectedIds(new Set(validIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelect = (rowNumber: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) {
        next.delete(rowNumber)
      } else {
        next.add(rowNumber)
      }
      return next
    })
  }

  const handleCategoryChange = (rowNumber: number, categoryId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.rowNumber === rowNumber
          ? {
              ...t,
              suggestedCategoryId: categoryId,
              suggestedCategoryName: categories.find((c) => c.id === categoryId)?.name || null,
            }
          : t
      )
    )
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const toImport = transactions.filter((t) => selectedIds.has(t.rowNumber) && t.isValid)

      const result = await importTransactions(config.accountId, toImport)

      onImported({
        imported: result.imported,
        skipped: stats.total - toImport.length,
        errors: result.errors,
      })
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-4 text-gray-600">Verificando duplicatas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Válidas</p>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.duplicates}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Duplicatas</p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.selected}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Selecionadas</p>
        </div>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="selectAll"
            checked={stats.selected === stats.valid - stats.duplicates}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="selectAll" className="cursor-pointer text-sm font-medium">
            Selecionar todas as válidas (exceto duplicatas)
          </label>
        </div>
        <p className="text-sm text-gray-500">
          Total selecionado:{' '}
          <span className={cn('font-semibold', stats.totalAmount >= 0 ? 'text-income' : 'text-expense')}>
            {formatCurrency(stats.totalAmount)}
          </span>
        </p>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="w-10 px-3 py-2"></th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Data</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Descrição</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Categoria</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
                <tr
                key={t.rowNumber}
                className={cn(
                  'border-t dark:border-gray-700',
                  !t.isValid && 'bg-red-50 dark:bg-red-900/20',
                  t.isDuplicate && 'bg-amber-50 dark:bg-amber-900/20',
                  selectedIds.has(t.rowNumber) && t.isValid && !t.isDuplicate && 'bg-emerald-50 dark:bg-emerald-900/20'
                )}
              >
                <td className="px-3 py-2">
                  <Checkbox
                    checked={selectedIds.has(t.rowNumber)}
                    onCheckedChange={() => handleToggleSelect(t.rowNumber)}
                    disabled={!t.isValid}
                  />
                </td>
                <td className="px-3 py-2">
                  {!t.isValid ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Inválida
                    </span>
                  ) : t.isDuplicate ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Copy className="h-4 w-4" />
                      Duplicata
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      OK
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{t.date ? formatDate(t.date) : '-'}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white max-w-xs truncate">{t.description || '-'}</td>
                <td className="px-3 py-2">
                  <Select
                    value={t.suggestedCategoryId || ''}
                    onValueChange={(v) => handleCategoryChange(t.rowNumber, v)}
                    disabled={!t.isValid}
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {(t.type === 'expense' ? expenseCategories : incomeCategories).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-1">
                            <span>{c.icon}</span>
                            <span>{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={cn(
                      'flex items-center justify-end gap-1 font-medium',
                      t.type === 'income' ? 'text-income' : 'text-expense'
                    )}
                  >
                    {t.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatCurrency(t.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isImporting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleImport}
          disabled={isImporting || stats.selected === 0}
        >
          {isImporting ? (
            'Importando...'
          ) : (
            <>
              Importar {stats.selected} transações
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

