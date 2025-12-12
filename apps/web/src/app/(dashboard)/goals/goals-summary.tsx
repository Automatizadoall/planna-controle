'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react'

interface GoalsSummaryProps {
  totalTargetAmount: number
  totalCurrentAmount: number
  totalRemaining: number
  activeCount: number
  completedCount: number
}

export function GoalsSummary({
  totalTargetAmount,
  totalCurrentAmount,
  totalRemaining,
  activeCount,
  completedCount,
}: GoalsSummaryProps) {
  const percentage = calculatePercentage(totalCurrentAmount, totalTargetAmount)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Target */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total das Metas</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalTargetAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Economizado ({percentage}%)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCurrentAmount)}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Remaining */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Falta Economizar</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalRemaining)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Count */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metas</p>
              <p className="text-xl font-bold text-foreground">
                {activeCount} ativas
                {completedCount > 0 && (
                  <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400 ml-2">
                    +{completedCount} concluídas
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

