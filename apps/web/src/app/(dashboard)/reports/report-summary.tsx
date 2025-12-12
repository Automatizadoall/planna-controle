'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportSummaryProps {
  totalIncome: number
  totalExpenses: number
  transactionCount: number
  prevIncome: number
  prevExpenses: number
}

export function ReportSummary({
  totalIncome,
  totalExpenses,
  transactionCount,
  prevIncome,
  prevExpenses,
}: ReportSummaryProps) {
  const balance = totalIncome - totalExpenses
  const prevBalance = prevIncome - prevExpenses

  const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0
  const expensesChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0
  const balanceChange = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Income */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
              {prevIncome > 0 && (
                <div className={cn(
                  'flex items-center gap-1 text-xs mt-1',
                  incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {incomeChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{Math.abs(incomeChange).toFixed(1)}% vs período anterior</span>
                </div>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
              {prevExpenses > 0 && (
                <div className={cn(
                  'flex items-center gap-1 text-xs mt-1',
                  expensesChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {expensesChange <= 0 ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  <span>{Math.abs(expensesChange).toFixed(1)}% vs período anterior</span>
                </div>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card className={balance >= 0 ? '' : 'border-red-200 dark:border-red-800'}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo do Período</p>
              <p className={cn(
                'text-2xl font-bold',
                balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              )}>
                {formatCurrency(balance)}
              </p>
              {prevBalance !== 0 && (
                <div className={cn(
                  'flex items-center gap-1 text-xs mt-1',
                  balanceChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {balanceChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{Math.abs(balanceChange).toFixed(1)}% vs período anterior</span>
                </div>
              )}
            </div>
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'
            )}>
              <span className="text-2xl">{balance >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transações</p>
              <p className="text-2xl font-bold text-foreground">{transactionCount}</p>
              <p className="text-xs text-muted-foreground mt-1">no período selecionado</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Receipt className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

