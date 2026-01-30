'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

interface DashboardSummaryProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  accountsCount: number
}

export const DashboardSummary = memo(function DashboardSummary({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  accountsCount,
}: DashboardSummaryProps) {
  const savings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4" role="region" aria-label="Resumo financeiro">
      {/* Total Balance - Hero Card */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white border-0 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 animate-fade-in-up"
        aria-label={`Saldo total: ${totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <CardContent className="relative p-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-emerald-100">Saldo Total</p>
              <p className="text-sm sm:text-2xl font-bold mt-0.5 sm:mt-1 truncate">
                <AnimatedNumber value={totalBalance} duration={1200} />
              </p>
              <p className="text-[9px] sm:text-xs text-emerald-100/80 mt-0.5 sm:mt-1">
                {accountsCount} {accountsCount === 1 ? 'conta' : 'contas'}
              </p>
            </div>
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0" aria-hidden="true">
              <Wallet className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card 
        className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
        aria-label={`Receitas do mês: ${monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
      >
        <CardContent className="p-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-sm sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 truncate">
                <AnimatedNumber value={monthlyIncome} duration={1000} delay={100} />
              </p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">Este mês</p>
            </div>
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" aria-hidden="true">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card 
        className="group hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
        aria-label={`Despesas do mês: ${monthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
      >
        <CardContent className="p-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-sm sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5 sm:mt-1 truncate">
                <AnimatedNumber value={monthlyExpenses} duration={1000} delay={200} />
              </p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">Este mês</p>
            </div>
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-red-100 dark:bg-red-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" aria-hidden="true">
              <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings */}
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 animate-fade-in-up ${
          savings >= 0 
            ? 'hover:shadow-blue-500/5' 
            : 'border-red-200 dark:border-red-800/50 hover:shadow-red-500/5'
        }`}
        style={{ animationDelay: '150ms' }}
        aria-label={`Economia do mês: ${savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, ${savingsRate >= 0 ? savingsRate.toFixed(0) + '% da receita' : 'déficit'}`}
      >
        <CardContent className="p-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Economia</p>
              <p className={`text-sm sm:text-2xl font-bold mt-0.5 sm:mt-1 truncate ${
                savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <AnimatedNumber value={savings} duration={1000} delay={300} />
              </p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                {savingsRate >= 0 ? `${savingsRate.toFixed(0)}% da receita` : 'Déficit'}
              </p>
            </div>
            <div className={`flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
              savings >= 0 
                ? 'bg-blue-100 dark:bg-blue-500/20' 
                : 'bg-red-100 dark:bg-red-500/20'
            }`} aria-hidden="true">
              <PiggyBank className={`h-4 w-4 sm:h-6 sm:w-6 ${
                savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

DashboardSummary.displayName = 'DashboardSummary'
