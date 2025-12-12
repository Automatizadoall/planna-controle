'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, Calendar, ChevronRight } from 'lucide-react'
import { CategoryIcon } from '@/lib/category-icons'
import { formatNextOccurrence, isDue, isUpcoming } from '@/lib/validations/recurring'
import { formatCurrency } from '@/lib/utils'

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  frequency: string
  next_occurrence: string
  account?: { name: string } | null
  category?: { name: string; icon: string } | null
}

interface DueBillsAlertProps {
  recurring: RecurringTransaction[]
}

function getDaysUntil(dateStr: string): number {
  const next = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  const diffTime = next.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getUrgencyLevel(days: number): 'critical' | 'warning' | 'info' {
  if (days <= 1) return 'critical'
  if (days <= 3) return 'warning'
  return 'info'
}

export function DueBillsAlert({ recurring }: DueBillsAlertProps) {
  // Filter expenses due in the next 7 days
  const upcomingBills = recurring
    .filter((r) => {
      const days = getDaysUntil(r.next_occurrence)
      return r.type === 'expense' && days >= 0 && days <= 7
    })
    .sort((a, b) => getDaysUntil(a.next_occurrence) - getDaysUntil(b.next_occurrence))

  if (upcomingBills.length === 0) return null

  const criticalBills = upcomingBills.filter((r) => getDaysUntil(r.next_occurrence) <= 1)
  const totalDue = upcomingBills.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <Card className={criticalBills.length > 0 
      ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' 
      : 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
    }>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {criticalBills.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Bell className="h-5 w-5 text-amber-500" />
            )}
            <span className={criticalBills.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
              {criticalBills.length > 0 
                ? `${criticalBills.length} conta${criticalBills.length > 1 ? 's' : ''} vence${criticalBills.length > 1 ? 'm' : ''} hoje/amanhã!`
                : `${upcomingBills.length} conta${upcomingBills.length > 1 ? 's' : ''} a vencer`
              }
            </span>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Total: {formatCurrency(totalDue)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingBills.slice(0, 4).map((bill) => {
          const days = getDaysUntil(bill.next_occurrence)
          const urgency = getUrgencyLevel(days)
          
          return (
            <div
              key={bill.id}
              className={`flex items-center justify-between rounded-lg p-2 ${
                urgency === 'critical'
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : urgency === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-900/40'
                  : 'bg-white/50 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon icon={bill.category?.icon || '📄'} className="text-xl" />
                <div>
                  <p className="text-sm font-medium text-foreground">{bill.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className={days <= 1 ? 'font-semibold text-red-600 dark:text-red-400' : ''}>
                      {formatNextOccurrence(bill.next_occurrence)}
                    </span>
                    {bill.account && <span>• {bill.account.name}</span>}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(Number(bill.amount))}
              </span>
            </div>
          )
        })}

        {upcomingBills.length > 4 && (
          <p className="text-xs text-muted-foreground text-center">
            +{upcomingBills.length - 4} outra{upcomingBills.length - 4 > 1 ? 's' : ''} conta{upcomingBills.length - 4 > 1 ? 's' : ''}
          </p>
        )}

        <Link href="/recurring" className="block">
          <Button variant="ghost" size="sm" className="w-full mt-2">
            Ver todas as recorrências
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

