'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, Category } from '@mentoria/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  transactionTypeLabels,
  type TransactionType,
} from '@/lib/validations/transaction'
import { accountTypeIcons } from '@/lib/validations/account'
import { createTransaction } from './actions'
import { autoCategorize } from '../categories/actions'
import { Plus, Loader2, TrendingUp, TrendingDown, ArrowLeftRight, Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { DatePicker } from '@/components/ui/date-picker'

interface CreateTransactionDialogProps {
  accounts: Account[]
  categories: Category[]
}

export function CreateTransactionDialog({ accounts, categories }: CreateTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [autoSuggestion, setAutoSuggestion] = useState<{
    categoryId: string
    confidence: number
    categoryName: string
  } | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const filteredCategories = categories.filter((c) => {
    if (type === 'transfer') return false
    return c.type === type
  })

  // Auto-categorize when description changes
  const handleDescriptionChange = useCallback(
    async (description: string) => {
      if (type === 'transfer' || !description || description.length < 3) {
        setAutoSuggestion(null)
        return
      }

      // Debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await autoCategorize(description)
          if (result.categoryId && result.confidence > 0.5) {
            const category = categories.find((c) => c.id === result.categoryId)
            if (category && category.type === type) {
              setAutoSuggestion({
                categoryId: result.categoryId,
                confidence: result.confidence,
                categoryName: category.name,
              })
              // Auto-select if high confidence and no manual selection
              if (result.confidence >= 0.85 && !selectedCategoryId) {
                setSelectedCategoryId(result.categoryId)
              }
            } else {
              setAutoSuggestion(null)
            }
          } else {
            setAutoSuggestion(null)
          }
        } catch (error) {
          console.error('Auto-categorize error:', error)
        }
      }, 300)
    },
    [type, categories, selectedCategoryId]
  )

  // Clear auto-suggestion when type changes
  useEffect(() => {
    setAutoSuggestion(null)
    setSelectedCategoryId(null)
  }, [type])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)

    const data = {
      type,
      amount: parseFloat(formData.get('amount') as string) || 0,
      description: (formData.get('description') as string) || undefined,
      date,
      accountId: formData.get('accountId') as string,
      categoryId: selectedCategoryId || (formData.get('categoryId') as string) || null,
      toAccountId: (formData.get('toAccountId') as string) || null,
    }

    // Basic validation
    if (data.amount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    if (!data.accountId) {
      setErrors({ accountId: 'Selecione uma conta' })
      setIsLoading(false)
      return
    }

    if (type === 'transfer' && (!data.toAccountId || data.toAccountId === data.accountId)) {
      setErrors({ toAccountId: 'Selecione uma conta destino diferente' })
      setIsLoading(false)
      return
    }

    try {
      const response = await createTransaction(data)
      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      setType('expense')
      setSelectedCategoryId(null)
      setAutoSuggestion(null)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar transação. Tente novamente.' })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Registre uma receita, despesa ou transferência.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
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

          {/* Description - moved up for auto-categorization */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Ex: Supermercado, Salário, iFood..."
              disabled={isLoading}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
            {/* Auto-suggestion indicator */}
            {autoSuggestion && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <Sparkles className="h-3 w-3" />
                <span>
                  Sugestão: <strong>{autoSuggestion.categoryName}</strong>
                  {autoSuggestion.confidence >= 0.85 && (
                    <span className="ml-1 text-emerald-700">
                      <Check className="h-3 w-3 inline" /> aplicada
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              disabled={isLoading}
              className={cn('text-lg font-semibold', errors.amount && 'border-red-500')}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="accountId">
              {type === 'transfer' ? 'Conta Origem' : 'Conta'}
            </Label>
            <Select name="accountId" disabled={isLoading}>
              <SelectTrigger className={errors.accountId ? 'border-red-500' : ''}>
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
            {errors.accountId && <p className="text-xs text-red-500">{errors.accountId}</p>}
          </div>

          {/* Destination Account (for transfers) */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="toAccountId">Conta Destino</Label>
              <Select name="toAccountId" disabled={isLoading}>
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

          {/* Category (for income/expense) */}
          {type !== 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
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
                        {autoSuggestion?.categoryId === category.id && (
                          <Sparkles className="h-3 w-3 text-amber-500" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <DatePicker
              id="date"
              name="date"
              value={date}
              onChange={setDate}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                type === 'income' && 'bg-income hover:bg-income/90',
                type === 'expense' && 'bg-expense hover:bg-expense/90',
                type === 'transfer' && 'bg-transfer hover:bg-transfer/90'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                `Adicionar ${transactionTypeLabels[type]}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
