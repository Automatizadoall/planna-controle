'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, Category, RecurringTransaction } from '@mentoria/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  frequencyLabels,
  formatNextOccurrence,
  isDue,
  isUpcoming,
} from '@/lib/validations/recurring'
import { accountTypeIcons } from '@/lib/validations/account'
import {
  Pencil,
  Trash2,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditRecurringDialog } from './edit-recurring-dialog'
import { deleteRecurring, toggleRecurring, processRecurring } from './actions'
import { CategoryIcon } from '@/lib/category-icons';

interface RecurringWithRelations extends RecurringTransaction {
  account: Account | null
  category: Category | null
}

interface RecurringListProps {
  recurring: RecurringWithRelations[]
  accounts: Account[]
  categories: Category[]
  isInactive?: boolean
}

export function RecurringList({
  recurring,
  accounts,
  categories,
  isInactive = false,
}: RecurringListProps) {
  const router = useRouter()
  const [editingRecurring, setEditingRecurring] = useState<RecurringWithRelations | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  if (recurring.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isInactive ? 'Nenhuma recorrente inativa' : 'Nenhuma transação recorrente'}
          </h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {isInactive
              ? 'Suas recorrentes pausadas aparecerão aqui.'
              : 'Crie transações recorrentes para despesas e receitas fixas como aluguel, salário, assinaturas, etc.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (item: RecurringWithRelations) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.description}"?`)) return
    await deleteRecurring(item.id)
    router.refresh()
  }

  const handleToggle = async (item: RecurringWithRelations) => {
    await toggleRecurring(item.id, !item.is_active)
    router.refresh()
  }

  const handleProcess = async (item: RecurringWithRelations) => {
    setProcessingId(item.id)
    await processRecurring(item.id)
    setProcessingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {recurring.map((item) => (
        <RecurringCard
          key={item.id}
          item={item}
          isInactive={isInactive}
          isProcessing={processingId === item.id}
          onEdit={() => setEditingRecurring(item)}
          onDelete={() => handleDelete(item)}
          onToggle={() => handleToggle(item)}
          onProcess={() => handleProcess(item)}
        />
      ))}

      {/* Edit Dialog */}
      {editingRecurring && (
        <EditRecurringDialog
          recurring={editingRecurring}
          accounts={accounts}
          categories={categories}
          open={!!editingRecurring}
          onOpenChange={(open) => !open && setEditingRecurring(null)}
        />
      )}
    </div>
  )
}

interface RecurringCardProps {
  item: RecurringWithRelations
  isInactive: boolean
  isProcessing: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onProcess: () => void
}

function RecurringCard({
  item,
  isInactive,
  isProcessing,
  onEdit,
  onDelete,
  onToggle,
  onProcess,
}: RecurringCardProps) {
  const due = isDue(item.next_occurrence)
  const upcoming = isUpcoming(item.next_occurrence)
  const isExpense = item.type === 'expense'

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isInactive && 'opacity-60',
        due && !isInactive && 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20',
        upcoming && !due && !isInactive && 'border-blue-200 dark:border-blue-800'
      )}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout: Stack vertically */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Top Row: Icon + Details + Amount */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div
              className={cn(
                'flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl shrink-0',
                isExpense ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
              )}
            >
              {item.category?.icon ? (
                <CategoryIcon icon={item.category.icon} className="text-base sm:text-xl" />
              ) : isExpense ? (
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-medium text-foreground truncate max-w-[150px] sm:max-w-none">{item.description}</h3>
                {due && !isInactive && (
                  <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-amber-700 dark:text-amber-300">
                    Pendente
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm text-muted-foreground flex-wrap">
                <span>{frequencyLabels[item.frequency as keyof typeof frequencyLabels]}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{item.category?.name || 'Sem categoria'}</span>
                {/* Mobile: Show next occurrence inline */}
                <span className="sm:hidden text-[10px]">• {formatNextOccurrence(item.next_occurrence)}</span>
              </div>
            </div>

            {/* Amount - Always visible */}
            <div className="text-right flex-shrink-0">
              <p
                className={cn(
                  'text-sm sm:text-lg font-bold whitespace-nowrap',
                  isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {isExpense ? '-' : '+'}
                {formatCurrency(Number(item.amount))}
              </p>
            </div>
          </div>

          {/* Bottom Row (Mobile) / Right side (Desktop): Next + Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            {/* Next Occurrence - Desktop only */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-muted-foreground">Próxima</p>
              <p className={cn(
                'text-sm font-medium',
                due ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
              )}>
                {formatNextOccurrence(item.next_occurrence)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Process Button (only if due) */}
              {due && !isInactive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onProcess}
                  disabled={isProcessing}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                >
                  {isProcessing ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Lançar</span>
                    </>
                  )}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={onToggle} title={isInactive ? 'Ativar' : 'Pausar'} className="h-8 w-8 sm:h-9 sm:w-9">
                {isInactive ? (
                  <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 sm:h-9 sm:w-9">
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 sm:h-9 sm:w-9">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

