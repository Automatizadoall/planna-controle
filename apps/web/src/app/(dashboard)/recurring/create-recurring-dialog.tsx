'use client'

import { useState } from 'react'
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
import { frequencyLabels, type RecurringFrequency } from '@/lib/validations/recurring'
import { accountTypeIcons } from '@/lib/validations/account'
import { createRecurring } from './actions'
import { Plus, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { DatePicker } from '@/components/ui/date-picker'

interface CreateRecurringDialogProps {
  accounts: Account[]
  categories: Category[]
}

export function CreateRecurringDialog({ accounts, categories }: CreateRecurringDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>('')

  const filteredCategories = categories.filter((c) => c.type === type)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)

    const data = {
      type,
      accountId: formData.get('accountId') as string,
      categoryId: (formData.get('categoryId') as string) || null,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      frequency: formData.get('frequency') as RecurringFrequency,
      startDate,
      endDate: endDate || null,
    }

    // Validation
    if (!data.accountId) {
      setErrors({ accountId: 'Selecione uma conta' })
      setIsLoading(false)
      return
    }

    if (!data.amount || data.amount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    if (!data.description || data.description.trim().length === 0) {
      setErrors({ description: 'Descrição é obrigatória' })
      setIsLoading(false)
      return
    }

    try {
      const response = await createRecurring(data)

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      setType('expense')
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Recorrente
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transação Recorrente</DialogTitle>
          <DialogDescription>
            Crie uma despesa ou receita que se repete automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingDown className="h-4 w-4" />
                Despesa Fixa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingUp className="h-4 w-4" />
                Receita Fixa
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Aluguel, Netflix, Salário..."
              disabled={isLoading}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
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
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Conta</Label>
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria (opcional)</Label>
            <Select name="categoryId" disabled={isLoading}>
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
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select name="frequency" defaultValue="monthly" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(frequencyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <DatePicker
                name="startDate"
                value={startDate}
                onChange={setStartDate}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim (opcional)</Label>
              <DatePicker
                name="endDate"
                value={endDate}
                onChange={setEndDate}
                disabled={isLoading}
                placeholder="Sem data fim"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Recorrente'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

