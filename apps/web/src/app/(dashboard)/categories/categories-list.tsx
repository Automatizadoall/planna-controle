'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@mentoria/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditCategoryDialog } from './edit-category-dialog'
import { deleteCategory } from './actions'
import { CategoryIcon } from '@/lib/category-icons';

interface CategoriesListProps {
  categories: Category[]
  type: 'income' | 'expense'
}

export function CategoriesList({ categories, type }: CategoriesListProps) {
  const router = useRouter()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const systemCategories = categories.filter((c) => c.is_system)
  const userCategories = categories.filter((c) => !c.is_system)

  if (categories.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma categoria de {type === 'expense' ? 'despesa' : 'receita'}
          </h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie categorias personalizadas para organizar melhor suas transações.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (category: Category) => {
    if (category.is_system) return
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) return

    await deleteCategory(category.id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* User Categories */}
      {userCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Minhas Categorias</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {userCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => setEditingCategory(category)}
                onDelete={() => handleDelete(category)}
              />
            ))}
          </div>
        </div>
      )}

      {/* System Categories */}
      {systemCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Categorias do Sistema
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systemCategories.map((category) => (
              <CategoryCard key={category.id} category={category} isSystem />
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}
    </div>
  )
}

interface CategoryCardProps {
  category: Category
  isSystem?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function CategoryCard({ category, isSystem, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md relative overflow-hidden',
        isSystem && 'opacity-75'
      )}
    >
      <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Icon with color background */}
          <div
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${category.color ?? ''}20` }}
          >
            <CategoryIcon icon={category.icon ?? ''} className="text-lg sm:text-xl" />
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium text-foreground truncate">{category.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {isSystem ? 'Sistema' : 'Personalizada'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isSystem && (
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 sm:h-9 sm:w-9">
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 sm:h-9 sm:w-9">
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
        )}

        {/* Color indicator */}
        <div
          className="absolute right-0 top-0 h-full w-1 rounded-r-lg"
          style={{ backgroundColor: category.color ?? '' }}
        />
      </CardContent>
    </Card>
  )
}

