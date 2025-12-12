'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, TrendingUp, Info } from 'lucide-react'

interface CategorySpending {
  categoryId: string
  categoryName: string
  categoryIcon: string
  currentAmount: number
  averageAmount: number
  percentageIncrease: number
}

interface UnusualSpendingAlertProps {
  unusualCategories: CategorySpending[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function UnusualSpendingAlert({ unusualCategories }: UnusualSpendingAlertProps) {
  // Filter categories with significant increases (>30% above average)
  const significantIncreases = unusualCategories.filter(
    (cat) => cat.percentageIncrease >= 30 && cat.currentAmount > 50
  )

  if (significantIncreases.length === 0) return null

  const totalExtra = significantIncreases.reduce(
    (sum, cat) => sum + (cat.currentAmount - cat.averageAmount),
    0
  )

  return (
    <Card className="border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-orange-700 dark:text-orange-300">
            Gastos Incomuns Detectados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Algumas categorias estão acima da sua média mensal:
        </p>

        <div className="space-y-2">
          {significantIncreases.slice(0, 3).map((cat) => (
            <div
              key={cat.categoryId}
              className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-slate-800/50 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.categoryIcon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{cat.categoryName}</p>
                  <p className="text-xs text-muted-foreground">
                    Média: {formatCurrency(cat.averageAmount)}/mês
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {formatCurrency(cat.currentAmount)}
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <TrendingUp className="h-3 w-3" />
                  +{cat.percentageIncrease.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {significantIncreases.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{significantIncreases.length - 3} outra{significantIncreases.length - 3 > 1 ? 's' : ''} categoria{significantIncreases.length - 3 > 1 ? 's' : ''}
          </p>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3">
          <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-700 dark:text-orange-300">
            Você está gastando aproximadamente{' '}
            <span className="font-semibold">{formatCurrency(totalExtra)}</span> a mais do que 
            o normal nestas categorias este mês.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

