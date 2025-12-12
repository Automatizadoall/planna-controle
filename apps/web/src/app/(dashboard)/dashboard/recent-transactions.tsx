'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowRightLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string | null
  date: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">💳</div>
            <p className="text-muted-foreground">Nenhuma transação ainda</p>
            <p className="text-sm text-muted-foreground/70">Adicione sua primeira transação para começar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Category Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    transaction.type === 'income' && 'bg-emerald-100 dark:bg-emerald-900/30',
                    transaction.type === 'expense' && 'bg-red-100 dark:bg-red-900/30',
                    transaction.type === 'transfer' && 'bg-blue-100 dark:bg-blue-900/30'
                  )}
                >
                  {transaction.category?.icon ? (
                    <CategoryIcon icon={transaction.category.icon} className="text-lg" />
                  ) : (
                    getIcon(transaction.type)
                  )}
                </div>

                {/* Details */}
                <div>
                  <p className="font-medium text-foreground">
                    {transaction.description || transaction.category?.name || 'Transação'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category?.name || 'Sem categoria'} • {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <p
                className={cn(
                  'font-semibold',
                  transaction.type === 'income' && 'text-emerald-600 dark:text-emerald-400',
                  transaction.type === 'expense' && 'text-red-600 dark:text-red-400',
                  transaction.type === 'transfer' && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
                {formatCurrency(Number(transaction.amount))}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

