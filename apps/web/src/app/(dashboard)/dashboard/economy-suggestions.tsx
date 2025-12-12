'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, TrendingDown, PiggyBank, CreditCard, Repeat } from 'lucide-react'

interface EconomySuggestionsProps {
  monthlyExpenses: number
  monthlyIncome: number
  savingsRate: number
  budgetAlerts: number
  recurringExpenses: number
  topExpenseCategory?: { name: string; icon: string; total: number }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface Suggestion {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export function EconomySuggestions({
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  budgetAlerts,
  recurringExpenses,
  topExpenseCategory,
}: EconomySuggestionsProps) {
  const suggestions: Suggestion[] = []

  // Suggestion 1: Low savings rate
  if (savingsRate < 10 && monthlyIncome > 0) {
    suggestions.push({
      id: 'low-savings',
      icon: <PiggyBank className="h-5 w-5 text-amber-500" />,
      title: 'Aumente sua taxa de poupança',
      description: `Você está economizando apenas ${savingsRate.toFixed(0)}% da sua renda. Tente guardar pelo menos 10-20% todo mês.`,
      priority: 'high',
    })
  }

  // Suggestion 2: Budget alerts
  if (budgetAlerts > 0) {
    suggestions.push({
      id: 'budget-alerts',
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      title: 'Atenção aos orçamentos',
      description: `Você tem ${budgetAlerts} orçamento${budgetAlerts > 1 ? 's' : ''} próximo${budgetAlerts > 1 ? 's' : ''} do limite. Revise seus gastos nestas categorias.`,
      priority: 'high',
    })
  }

  // Suggestion 3: High recurring expenses
  const recurringPercentage = monthlyIncome > 0 ? (recurringExpenses / monthlyIncome) * 100 : 0
  if (recurringPercentage > 50) {
    suggestions.push({
      id: 'recurring-high',
      icon: <Repeat className="h-5 w-5 text-orange-500" />,
      title: 'Revise assinaturas e contas fixas',
      description: `${recurringPercentage.toFixed(0)}% da sua renda vai para despesas recorrentes. Considere cancelar serviços não essenciais.`,
      priority: 'medium',
    })
  }

  // Suggestion 4: Top expense category
  if (topExpenseCategory && monthlyExpenses > 0) {
    const categoryPercentage = (topExpenseCategory.total / monthlyExpenses) * 100
    if (categoryPercentage > 30) {
      suggestions.push({
        id: 'top-category',
        icon: <CreditCard className="h-5 w-5 text-blue-500" />,
        title: `Analise gastos com ${topExpenseCategory.name}`,
        description: `Esta categoria representa ${categoryPercentage.toFixed(0)}% das suas despesas (${formatCurrency(topExpenseCategory.total)}). Há espaço para redução?`,
        priority: 'medium',
      })
    }
  }

  // Suggestion 5: Positive savings rate
  if (savingsRate >= 20) {
    suggestions.push({
      id: 'good-savings',
      icon: <Lightbulb className="h-5 w-5 text-emerald-500" />,
      title: 'Ótima taxa de poupança! 🎉',
      description: `Você está economizando ${savingsRate.toFixed(0)}% da renda. Considere investir para fazer seu dinheiro trabalhar para você.`,
      priority: 'low',
    })
  }

  if (suggestions.length === 0) return null

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Sugestões de Economia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion) => (
          <div
            key={suggestion.id}
            className={`flex items-start gap-3 rounded-lg p-3 ${
              suggestion.priority === 'high'
                ? 'bg-red-50 dark:bg-red-900/20'
                : suggestion.priority === 'medium'
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}
          >
            <div className="mt-0.5">{suggestion.icon}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

