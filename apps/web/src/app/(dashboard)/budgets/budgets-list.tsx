'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Budget, Category } from '@mentoria/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { budgetPeriodLabels, getProgressColor, getProgressTextColor } from '@/lib/validations/budget'
import { Pencil, Trash2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { EditBudgetDialog } from './edit-budget-dialog'
import { deleteBudget } from './actions'

interface BudgetWithDetails extends Budget {
  category: Category | null
  spent: number
  remaining: number
  percentage: number
}

interface BudgetsListProps {
  budgets: BudgetWithDetails[]
  categories: Category[]
}

export function BudgetsList({ budgets, categories }: BudgetsListProps) {
  const router = useRouter()
  const [editingBudget, setEditingBudget] = useState<BudgetWithDetails | null>(null)

  if (budgets.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum orçamento definido</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie orçamentos para controlar seus gastos por categoria e receber alertas quando estiver perto do limite.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (budget: BudgetWithDetails) => {
    if (!confirm(`Tem certeza que deseja excluir o orçamento de "${budget.category?.name}"?`)) return

    await deleteBudget(budget.id)
    router.refresh()
  }

  // Sort: over budget first, then near limit, then healthy
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aOverLimit = a.percentage >= 100
    const bOverLimit = b.percentage >= 100
    const aNearLimit = a.percentage >= a.alert_threshold
    const bNearLimit = b.percentage >= b.alert_threshold

    if (aOverLimit && !bOverLimit) return -1
    if (!aOverLimit && bOverLimit) return 1
    if (aNearLimit && !bNearLimit) return -1
    if (!aNearLimit && bNearLimit) return 1
    return b.percentage - a.percentage
  })

  return (
    <div className="space-y-4">
      {sortedBudgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={() => setEditingBudget(budget)}
          onDelete={() => handleDelete(budget)}
        />
      ))}

      {/* Edit Dialog */}
      {editingBudget && (
        <EditBudgetDialog
          budget={editingBudget}
          categories={categories}
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
        />
      )}
    </div>
  )
}

interface BudgetCardProps {
  budget: BudgetWithDetails
  onEdit: () => void
  onDelete: () => void
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const isOverBudget = budget.percentage >= 100
  const isNearLimit = budget.percentage >= budget.alert_threshold && !isOverBudget
  const progressColor = getProgressColor(budget.percentage, budget.alert_threshold)
  const textColor = getProgressTextColor(budget.percentage, budget.alert_threshold)

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isOverBudget && 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20',
      isNearLimit && 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20'
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          {/* Category Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${budget.category?.color}20` }}
            >
              <CategoryIcon icon={budget.category?.icon ?? ''} className="text-xl sm:text-2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{budget.category?.name}</h3>
                {isOverBudget && (
                  <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-red-100 dark:bg-red-900/40 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Estourado</span>
                    <span className="sm:hidden">!</span>
                  </span>
                )}
                {isNearLimit && (
                  <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Atenção</span>
                  </span>
                )}
                {!isOverBudget && !isNearLimit && (
                  <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    OK
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {budgetPeriodLabels[budget.period as keyof typeof budgetPeriodLabels]}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 sm:h-9 sm:w-9">
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 sm:h-9 sm:w-9">
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span className={textColor}>
              {formatCurrency(budget.spent)} de {formatCurrency(Number(budget.amount))}
            </span>
            <span className={cn('font-semibold', textColor)}>{budget.percentage}%</span>
          </div>
          <div className="h-2 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${Math.min(budget.percentage, 100)}%`,
                backgroundColor: budget.percentage >= 100 ? '#ef4444' : budget.percentage >= 80 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1">
            <span>
              {budget.remaining >= 0
                ? `Restam ${formatCurrency(budget.remaining)}`
                : `Excedeu ${formatCurrency(Math.abs(budget.remaining))}`}
            </span>
            <span className="hidden sm:inline">Alerta em {budget.alert_threshold}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

