'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

interface DashboardSummaryProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  accountsCount: number
}

export function DashboardSummary({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  accountsCount,
}: DashboardSummaryProps) {
  const savings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance - Hero Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white border-0 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="relative p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100">Saldo Total</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-emerald-100/80 mt-1">
                {accountsCount} {accountsCount === 1 ? 'conta' : 'contas'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas do Mês</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(monthlyIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="group hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(monthlyExpenses)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/20 group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings */}
      <Card className={`group hover:shadow-lg transition-all duration-300 ${
        savings >= 0 
          ? 'hover:shadow-blue-500/5' 
          : 'border-red-200 dark:border-red-800/50 hover:shadow-red-500/5'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Economia do Mês</p>
              <p className={`text-2xl font-bold mt-1 ${
                savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(savings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {savingsRate >= 0 ? `${savingsRate.toFixed(0)}% da receita` : 'Déficit'}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
              savings >= 0 
                ? 'bg-blue-100 dark:bg-blue-500/20' 
                : 'bg-red-100 dark:bg-red-500/20'
            }`}>
              <PiggyBank className={`h-6 w-6 ${
                savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
