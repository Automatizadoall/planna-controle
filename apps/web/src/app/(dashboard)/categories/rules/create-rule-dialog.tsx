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
import { createRule } from './actions'
import { Plus, Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'

interface CreateRuleDialogProps {
  categories: Category[]
}

export function CreateRuleDialog({ categories }: CreateRuleDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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

    if (!categoryId) {
      setErrors({ categoryId: 'Selecione uma categoria' })
      setIsLoading(false)
      return
    }

    try {
      const response = await createRule({
        pattern: pattern.trim(),
        categoryId,
        priority,
        isActive: true,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar regra. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Regra de Categorização</DialogTitle>
          <DialogDescription>
            Crie uma regra para categorizar transações automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Pattern */}
          <div className="space-y-2">
            <Label htmlFor="pattern">Padrão (palavras-chave)</Label>
            <Input
              id="pattern"
              name="pattern"
              placeholder="Ex: netflix|spotify|disney"
              disabled={isLoading}
              className={errors.pattern ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              Use <code className="bg-gray-100 px-1 rounded">|</code> para múltiplas palavras (ex: uber|99|taxi)
            </p>
            {errors.pattern && <p className="text-xs text-red-500">{errors.pattern}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select name="categoryId" disabled={isLoading}>
              <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a categoria" />
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
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade (0-100)</Label>
            <Input
              id="priority"
              name="priority"
              type="number"
              min="0"
              max="100"
              defaultValue="90"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Regras com maior prioridade são verificadas primeiro
            </p>
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
                'Criar Regra'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

