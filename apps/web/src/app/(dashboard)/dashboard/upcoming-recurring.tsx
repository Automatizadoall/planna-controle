'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Repeat, ArrowRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  next_occurrence: string
  account: { id: string; name: string } | null
  category: { id: string; name: string; icon: string } | null
}

interface UpcomingRecurringProps {
  recurring: RecurringTransaction[]
}

function formatNextOccurrence(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Atrasado'
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays <= 7) return `${diffDays}d`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function isDue(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date <= today
}

export function UpcomingRecurring({ recurring }: UpcomingRecurringProps) {
  // Mostrar apenas os 3 primeiros
  const visibleItems = recurring.slice(0, 3)
  const remainingCount = recurring.length - 3

  if (recurring.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Próximas Recorrentes</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" asChild>
            <Link href="/recurring">
              Ver todas <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted mb-2 sm:mb-3">
              <Repeat className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma recorrente</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">Crie despesas/receitas fixas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dueCount = recurring.filter((r) => isDue(r.next_occurrence)).length

  return (
    <Card className={dueCount > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
          <Calendar className={cn('h-4 w-4 sm:h-5 sm:w-5', dueCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400')} />
          <span className="truncate">Recorrentes</span>
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3 flex-shrink-0" asChild>
          <Link href="/recurring">
            <span className="hidden sm:inline">Ver todas</span>
            <ArrowRight className="sm:ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {dueCount > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3">
            <span>⚠️ {dueCount} pendente(s)</span>
          </div>
        )}

        {/* Lista compacta */}
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const due = isDue(item.next_occurrence)
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  due 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {/* Ícone */}
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0',
                  item.type === 'expense' 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                )}>
                  <CategoryIcon icon={item.category?.icon || ''} className="text-base" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                  <p className={cn(
                    'text-[10px]',
                    due ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'
                  )}>
                    {formatNextOccurrence(item.next_occurrence)}
                  </p>
                </div>

                {/* Valor */}
                <p className={cn(
                  'text-sm font-bold flex-shrink-0',
                  item.type === 'expense' ? 'text-red-500' : 'text-emerald-500'
                )}>
                  {item.type === 'expense' ? '-' : '+'}
                  {formatCurrency(Number(item.amount))}
                </p>
              </div>
            )
          })}
        </div>

        {/* Indicador de mais itens */}
        {remainingCount > 0 && (
          <Link 
            href="/recurring"
            className="block mt-2 text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            +{remainingCount} recorrente{remainingCount > 1 ? 's' : ''}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
