'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Repeat, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'

interface RecurringSummaryProps {
  activeCount: number
  dueCount: number
  monthlyExpenses: number
  monthlyIncome: number
}

export function RecurringSummary({
  activeCount,
  dueCount,
  monthlyExpenses,
  monthlyIncome,
}: RecurringSummaryProps) {
  const monthlyBalance = monthlyIncome - monthlyExpenses

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Active Count */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recorrentes Ativas</p>
              <p className="text-xl font-bold text-foreground">{activeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Today */}
      <Card className={dueCount > 0 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${dueCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <AlertCircle className={`h-5 w-5 ${dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className={`text-xl font-bold ${dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                {dueCount > 0 ? `${dueCount} para lançar` : 'Nenhuma'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas Fixas/mês</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(monthlyExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receitas Fixas/mês</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthlyIncome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

