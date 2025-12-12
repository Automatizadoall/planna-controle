'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { PiggyBank, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface BudgetsSummaryProps {
  totalBudgeted: number
  totalSpent: number
  budgetsCount: number
  overBudgetCount: number
  nearLimitCount: number
}

export function BudgetsSummary({
  totalBudgeted,
  totalSpent,
  budgetsCount,
  overBudgetCount,
  nearLimitCount,
}: BudgetsSummaryProps) {
  const remaining = totalBudgeted - totalSpent
  const percentage = calculatePercentage(totalSpent, totalBudgeted)
  const healthyCount = budgetsCount - overBudgetCount - nearLimitCount

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Budgeted */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orçamento Total</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalBudgeted)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gasto ({percentage}%)</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage >= 100
                  ? 'bg-red-500'
                  : percentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atenção</p>
              <p className="text-xl font-bold">
                {overBudgetCount > 0 ? (
                  <span className="text-red-600 dark:text-red-400">{overBudgetCount} estourado(s)</span>
                ) : nearLimitCount > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">{nearLimitCount} no limite</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">Tudo OK!</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${remaining >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <CheckCircle className={`h-5 w-5 ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Restante</p>
              <p className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

