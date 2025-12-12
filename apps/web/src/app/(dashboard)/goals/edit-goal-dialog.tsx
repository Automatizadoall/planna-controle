'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@mentoria/database'
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
import { goalIcons, goalColors } from '@/lib/validations/goal'
import { updateGoal } from './actions'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { DatePicker } from '@/components/ui/date-picker'

interface EditGoalDialogProps {
  goal: Goal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(goal.icon || '🎯')
  const [selectedColor, setSelectedColor] = useState(goal.color || '#10B981')
  const [targetDate, setTargetDate] = useState(goal.target_date || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const targetAmountValue = parseFloat(formData.get('targetAmount') as string)

    if (!name || name.trim().length === 0) {
      setErrors({ name: 'Nome é obrigatório' })
      setIsLoading(false)
      return
    }

    if (!targetAmountValue || targetAmountValue <= 0) {
      setErrors({ targetAmount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateGoal(goal.id, {
        name: name.trim(),
        targetAmount: targetAmountValue,
        targetDate: targetDate || undefined,
        icon: selectedIcon,
        color: selectedColor,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar meta. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
          <DialogDescription>Altere os dados da sua meta.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Meta</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={goal.name}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-targetAmount">Valor da Meta (R$)</Label>
            <Input
              id="edit-targetAmount"
              name="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={Number(goal.target_amount)}
              disabled={isLoading}
              className={errors.targetAmount ? 'border-red-500' : ''}
            />
            {errors.targetAmount && <p className="text-xs text-red-500">{errors.targetAmount}</p>}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Data Limite</Label>
            <DatePicker
              name="targetDate"
              value={targetDate}
              onChange={setTargetDate}
              disabled={isLoading}
              placeholder="Selecione uma data"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {goalIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all',
                    selectedIcon === icon
                      ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                      : 'border-border hover:border-muted-foreground/50 dark:border-border'
                  )}
                >
                  <CategoryIcon icon={icon} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-3">
              {goalColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all ring-offset-background',
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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

