'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  categoryColors,
  type CategoryType,
} from '@/lib/validations/category'
import { createCategory } from './actions'
import { Plus, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon, CATEGORY_ICON_MAP } from '@/lib/category-icons';

export function CreateCategoryDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<CategoryType>('expense')
  const [selectedIcon, setSelectedIcon] = useState('📦')
  const [selectedColor, setSelectedColor] = useState('#6B7280')
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

  const icons = type === 'expense' ? expenseIcons : incomeIcons

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
      const response = await createCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      setType('expense')
      setSelectedIcon('📦')
      setSelectedColor('#6B7280')
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar categoria. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>Crie uma categoria personalizada para suas transações.</DialogDescription>
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
                onClick={() => {
                  setType('expense')
                  setSelectedIcon(expenseIcons[0])
                }}
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
                onClick={() => {
                  setType('income')
                  setSelectedIcon(incomeIcons[0])
                }}
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
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Academia, Freelance..."
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

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <CategoryIcon icon={selectedIcon} className="text-xl" />
              </div>
              <span className="font-medium text-gray-700">
                {(document.querySelector('input[name="name"]') as HTMLInputElement)?.value ||
                  'Nome da categoria'}
              </span>
              <div
                className="ml-auto h-6 w-1 rounded"
                style={{ backgroundColor: selectedColor }}
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
                'Criar Categoria'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

