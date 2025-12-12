'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, Category, RecurringTransaction } from '@mentoria/database'
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
import { frequencyLabels, type RecurringFrequency } from '@/lib/validations/recurring'
import { accountTypeIcons } from '@/lib/validations/account'
import { updateRecurring } from './actions'
import { Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'
import { DatePicker } from '@/components/ui/date-picker'

interface RecurringWithRelations extends RecurringTransaction {
  account: Account | null
  category: Category | null
}

interface EditRecurringDialogProps {
  recurring: RecurringWithRelations
  accounts: Account[]
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRecurringDialog({
  recurring,
  accounts,
  categories,
  open,
  onOpenChange,
}: EditRecurringDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [endDate, setEndDate] = useState(recurring.end_date || '')

  const filteredCategories = categories.filter((c) => c.type === recurring.type)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)

    const data = {
      accountId: formData.get('accountId') as string,
      categoryId: (formData.get('categoryId') as string) || null,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      frequency: formData.get('frequency') as RecurringFrequency,
      endDate: endDate || null,
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
      const response = await updateRecurring(recurring.id, data)

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Transação Recorrente</DialogTitle>
          <DialogDescription>Altere os dados da transação recorrente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              name="description"
              defaultValue={recurring.description}
              disabled={isLoading}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
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
              defaultValue={Number(recurring.amount)}
              disabled={isLoading}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Conta</Label>
            <Select name="accountId" defaultValue={recurring.account_id} disabled={isLoading}>
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              name="categoryId"
              defaultValue={recurring.category_id || undefined}
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
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select name="frequency" defaultValue={recurring.frequency} disabled={isLoading}>
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

          {/* End Date */}
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

