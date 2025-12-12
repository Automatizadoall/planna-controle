'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Budget, Category } from '@mentoria/database'
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
import { Slider } from '@/components/ui/slider'
import { budgetPeriodLabels, type BudgetPeriod } from '@/lib/validations/budget'
import { updateBudget } from './actions'
import { Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'

interface BudgetWithCategory extends Budget {
  category: Category | null
}

interface EditBudgetDialogProps {
  budget: BudgetWithCategory
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBudgetDialog({
  budget,
  categories,
  open,
  onOpenChange,
}: EditBudgetDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState(budget.alert_threshold)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const period = formData.get('period') as BudgetPeriod

    if (!amount || amount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateBudget(budget.id, {
        amount,
        period,
        alertThreshold,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar orçamento. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Orçamento</DialogTitle>
          <DialogDescription>
            Altere o limite de gastos para {budget.category?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Category (read-only) */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted">
              <CategoryIcon icon={budget.category?.icon ?? ''} className="text-xl" />
              <span className="font-medium">{budget.category?.name}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor Limite (R$)</Label>
            <Input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={Number(budget.amount)}
              disabled={isLoading}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select name="period" defaultValue={budget.period} disabled={isLoading}>
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

