'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@mentoria/database'
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
import { Slider } from '@/components/ui/slider'
import { budgetPeriodLabels, type BudgetPeriod } from '@/lib/validations/budget'
import { createBudget } from './actions'
import { Plus, Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'

interface CreateBudgetDialogProps {
  categories: Category[]
  existingCategoryIds: string[]
}

export function CreateBudgetDialog({ categories, existingCategoryIds }: CreateBudgetDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState(80)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Filter out categories that already have budgets
  const availableCategories = categories.filter((c) => !existingCategoryIds.includes(c.id))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const categoryId = formData.get('categoryId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const period = formData.get('period') as BudgetPeriod

    // Validation
    if (!categoryId) {
      setErrors({ categoryId: 'Selecione uma categoria' })
      setIsLoading(false)
      return
    }

    if (!amount || amount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    try {
      const response = await createBudget({
        categoryId,
        amount,
        period: period || 'monthly',
        alertThreshold,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      setAlertThreshold(80)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar orçamento. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={availableCategories.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>
            Defina um limite de gastos para uma categoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select name="categoryId" disabled={isLoading}>
              <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <CategoryIcon icon={category.icon ?? ''} className="text-lg" />
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            {availableCategories.length === 0 && (
              <p className="text-xs text-amber-600">
                Todas as categorias já possuem orçamento definido.
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor Limite (R$)</Label>
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

          {/* Period */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select name="period" defaultValue="monthly" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(budgetPeriodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Alerta de Limite</Label>
              <span className="text-sm font-medium text-emerald-600">{alertThreshold}%</span>
            </div>
            <Slider
              value={[alertThreshold]}
              onValueChange={([value]) => setAlertThreshold(value)}
              min={50}
              max={100}
              step={5}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Você será alertado quando atingir {alertThreshold}% do orçamento.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || availableCategories.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Orçamento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

