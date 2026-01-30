'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@mentoria/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  calculateGoalProgress,
  calculateDaysRemaining,
  calculateMonthlySavingsNeeded,
  getGoalProgressColor,
  formatRemainingTime,
} from '@/lib/validations/goal'
import { Pencil, Trash2, Plus, Trophy, Calendar, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'
import { EditGoalDialog } from './edit-goal-dialog'
import { AddContributionDialog } from './add-contribution-dialog'
import { deleteGoal } from './actions'

interface GoalsListProps {
  goals: Goal[]
  isCompleted?: boolean
}

export function GoalsList({ goals, isCompleted = false }: GoalsListProps) {
  const router = useRouter()
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null)

  if (goals.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isCompleted ? 'Nenhuma meta concluída' : 'Nenhuma meta definida'}
          </h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {isCompleted
              ? 'Suas metas concluídas aparecerão aqui.'
              : 'Crie metas de economia para acompanhar seu progresso e alcançar seus objetivos financeiros.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (goal: Goal) => {
    if (!confirm(`Tem certeza que deseja excluir a meta "${goal.name}"?`)) return

    await deleteGoal(goal.id)
    router.refresh()
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          isCompleted={isCompleted}
          onEdit={() => setEditingGoal(goal)}
          onDelete={() => handleDelete(goal)}
          onContribute={() => setContributingGoal(goal)}
        />
      ))}

      {/* Edit Dialog */}
      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}

      {/* Contribution Dialog */}
      {contributingGoal && (
        <AddContributionDialog
          goal={contributingGoal}
          open={!!contributingGoal}
          onOpenChange={(open) => !open && setContributingGoal(null)}
        />
      )}
    </div>
  )
}

interface GoalCardProps {
  goal: Goal
  isCompleted: boolean
  onEdit: () => void
  onDelete: () => void
  onContribute: () => void
}

function GoalCard({ goal, isCompleted, onEdit, onDelete, onContribute }: GoalCardProps) {
  const current = Number(goal.current_amount)
  const target = Number(goal.target_amount)
  const remaining = target - current
  const percentage = calculateGoalProgress(current, target)
  const daysRemaining = calculateDaysRemaining(goal.target_date)
  const monthlySavings = calculateMonthlySavingsNeeded(remaining, goal.target_date)
  const progressColor = getGoalProgressColor(percentage)
  const goalColor = goal.color || '#10B981'

  return (
    <Card className={cn(
      'transition-all hover:shadow-lg',
      isCompleted && 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    )}>
      <CardContent className="p-3 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${goalColor}20`, color: goalColor }}
            >
              {isCompleted ? (
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <CategoryIcon icon={goal.icon || 'lucide:target'} className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{goal.name}</h3>
              {goal.target_date && (
                <p className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatRemainingTime(daysRemaining)}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isCompleted && (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 sm:h-9 sm:w-9">
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 sm:h-9 sm:w-9">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
            <span className="font-semibold text-foreground">{formatCurrency(current)}</span>
            <span className="text-muted-foreground">de {formatCurrency(target)}</span>
          </div>
          <div className="h-2 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-emerald-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {isCompleted ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Meta alcançada!
                </span>
              ) : remaining > 0 ? (
                `Faltam ${formatCurrency(remaining)}`
              ) : (
                'Concluída!'
              )}
            </span>
            <span className={cn(
              'text-xs sm:text-sm font-bold',
              percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
            )}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Monthly suggestion */}
        {!isCompleted && monthlySavings && monthlySavings > 0 && (
          <div className="mt-2 sm:mt-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">
            💡 Economize <strong>{formatCurrency(monthlySavings)}/mês</strong> para atingir no prazo
          </div>
        )}

        {/* Add Contribution Button */}
        {!isCompleted && (
          <Button
            className="w-full mt-3 sm:mt-4 h-9 sm:h-10 text-sm"
            variant="outline"
            onClick={onContribute}
          >
            <Plus className="mr-1.5 sm:mr-2 h-4 w-4" />
            Adicionar Valor
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

