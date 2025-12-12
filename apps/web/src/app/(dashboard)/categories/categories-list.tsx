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
        'transition-all hover:shadow-md',
        isSystem && 'opacity-75'
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Icon with color background */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color ?? ''}20` }}
          >
            <CategoryIcon icon={category.icon ?? ''} className="text-xl" />
          </div>

          {/* Name */}
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              {isSystem ? 'Sistema' : 'Personalizada'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isSystem && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
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

