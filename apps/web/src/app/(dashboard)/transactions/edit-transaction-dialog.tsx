'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, Category, Transaction } from '@mentoria/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { transactionTypeLabels, type TransactionType } from '@/lib/validations/transaction'
import { accountTypeIcons } from '@/lib/validations/account'
import { updateTransaction } from './actions'
import { learnFromCorrection } from '../categories/actions'
import { Loader2, TrendingUp, TrendingDown, ArrowLeftRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { DatePicker } from '@/components/ui/date-picker'

interface TransactionWithRelations extends Transaction {
  account: Account | null
  category: Category | null
  to_account: Account | null
}

interface EditTransactionDialogProps {
  transaction: TransactionWithRelations
  accounts: Account[]
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({
  transaction,
  accounts,
  categories,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<TransactionType>(transaction.type as TransactionType)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    transaction.category_id
  )
  const [learnedPattern, setLearnedPattern] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [date, setDate] = useState(transaction.date)

  const filteredCategories = categories.filter((c) => {
    if (type === 'transfer') return false
    return c.type === type
  })

  // Track if category changed for learning
  const categoryChanged = selectedCategoryId !== transaction.category_id

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})
    setLearnedPattern(null)

    const formData = new FormData(event.currentTarget)

    const data = {
      type,
      amount: parseFloat(formData.get('amount') as string) || 0,
      description: (formData.get('description') as string) || undefined,
      date,
      accountId: formData.get('accountId') as string,
      categoryId: selectedCategoryId,
      toAccountId: (formData.get('toAccountId') as string) || null,
    }

    // Basic validation
    if (data.amount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    if (type === 'transfer' && (!data.toAccountId || data.toAccountId === data.accountId)) {
      setErrors({ toAccountId: 'Selecione uma conta destino diferente' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateTransaction(transaction.id, data)
      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      // Learn from category correction
      if (categoryChanged && selectedCategoryId && transaction.description) {
        const learnResult = await learnFromCorrection(transaction.description, selectedCategoryId)
        if (learnResult.success && learnResult.pattern) {
          setLearnedPattern(learnResult.pattern)
          // Show success briefly before closing
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar transação. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>Altere os dados da transação.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Learning indicator */}
          {learnedPattern && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
              <Sparkles className="h-4 w-4" />
              <span>
                Aprendi! Transações com <code className="bg-emerald-100 px-1 rounded">{learnedPattern}</code> serão categorizadas automaticamente.
              </span>
            </div>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === 'expense'
                    ? 'border-expense bg-red-50 text-expense'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingDown className="h-4 w-4" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === 'income'
                    ? 'border-income bg-green-50 text-income'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingUp className="h-4 w-4" />
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === 'transfer'
                    ? 'border-transfer bg-blue-50 text-transfer'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Transferência
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor (R$)</Label>
            <Input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={Number(transaction.amount)}
              disabled={isLoading}
              className={cn('text-lg font-semibold', errors.amount && 'border-red-500')}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>{type === 'transfer' ? 'Conta Origem' : 'Conta'}</Label>
            <Select name="accountId" defaultValue={transaction.account_id} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
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

          {/* Destination Account (for transfers) */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <Label>Conta Destino</Label>
              <Select
                name="toAccountId"
                defaultValue={transaction.to_account_id || undefined}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.toAccountId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a conta destino" />
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
              {errors.toAccountId && <p className="text-xs text-red-500">{errors.toAccountId}</p>}
            </div>
          )}

          {/* Category */}
          {type !== 'transfer' && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                name="categoryId"
                value={selectedCategoryId || undefined}
                onValueChange={setSelectedCategoryId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon icon={category.icon ?? ''} className="text-base" />
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryChanged && transaction.description && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Ao salvar, vou aprender a categorizar transações similares
                </p>
              )}
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Data</Label>
            <DatePicker
              name="date"
              value={date}
              onChange={setDate}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Input
              name="description"
              type="text"
              defaultValue={transaction.description || ''}
              placeholder="Ex: Supermercado, Salário, etc."
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

