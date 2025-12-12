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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expenseIcons, incomeIcons, categoryColors } from '@/lib/validations/category'
import { updateCategory } from './actions'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons';

interface EditCategoryDialogProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(category.icon)
  const [selectedColor, setSelectedColor] = useState(category.color)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const expenseIcons = [
    'lucide:utensils',
    'lucide:car',
    'lucide:home',
    'lucide:clapperboard',
    'lucide:heart-pulse',
    'lucide:book-open',
    'lucide:shopping-cart',
    'lucide:smartphone',
    'lucide:plane',
    'lucide:dumbbell',
    'lucide:gamepad',
    'lucide:wine',
  ];
  const incomeIcons = [
    'lucide:briefcase',
    'lucide:laptop',
    'lucide:trending-up',
    'lucide:wallet',
    'lucide:banknote',
    'lucide:gift',
  ];
  const icons = category.type === 'expense' ? expenseIcons : incomeIcons;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string

    if (!name || name.trim().length === 0) {
      setErrors({ name: 'Nome é obrigatório' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateCategory(category.id, {
        name: name.trim(),
        icon: selectedIcon ?? undefined,
        color: selectedColor ?? undefined,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar categoria. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>Altere os dados da categoria.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={category.name}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-all',
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <CategoryIcon icon={icon} className="text-xl" />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    selectedColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
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

