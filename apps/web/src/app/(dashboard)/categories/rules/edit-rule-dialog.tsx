'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category, CategorizationRule } from '@mentoria/database'
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
import { updateRule } from './actions'
import { Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'

interface RuleWithCategory extends CategorizationRule {
  category: Category | null
}

interface EditRuleDialogProps {
  rule: RuleWithCategory
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRuleDialog({ rule, categories, open, onOpenChange }: EditRuleDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const pattern = formData.get('pattern') as string
    const categoryId = formData.get('categoryId') as string
    const priority = parseInt(formData.get('priority') as string) || 90

    if (!pattern || pattern.trim().length < 2) {
      setErrors({ pattern: 'Padrão deve ter no mínimo 2 caracteres' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateRule(rule.id, {
        pattern: pattern.trim(),
        categoryId,
        priority,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar regra. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Regra</DialogTitle>
          <DialogDescription>Altere os dados da regra de categorização.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Pattern */}
          <div className="space-y-2">
            <Label htmlFor="edit-pattern">Padrão (palavras-chave)</Label>
            <Input
              id="edit-pattern"
              name="pattern"
              defaultValue={rule.pattern}
              disabled={isLoading}
              className={errors.pattern ? 'border-red-500' : ''}
            />
            {errors.pattern && <p className="text-xs text-red-500">{errors.pattern}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select name="categoryId" defaultValue={rule.category_id} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.length > 0 && (
                  <>
                    <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Despesas</p>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon icon={category.icon ?? ''} className="text-base" />
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
                {incomeCategories.length > 0 && (
                  <>
                    <p className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Receitas</p>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon icon={category.icon ?? ''} className="text-base" />
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="edit-priority">Prioridade (0-100)</Label>
            <Input
              id="edit-priority"
              name="priority"
              type="number"
              min="0"
              max="100"
              defaultValue={rule.priority}
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

