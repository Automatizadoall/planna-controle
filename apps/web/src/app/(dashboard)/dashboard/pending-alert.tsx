'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface PendingAlertProps {
  count: number
  totalAmount: number
}

export function PendingAlert({ count, totalAmount }: PendingAlertProps) {
  if (count === 0) return null

  return (
    <Card className="border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {count} {count === 1 ? 'transação pendente' : 'transações pendentes'}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-red-600">{formatCurrency(totalAmount)}</span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
            <Link href="/transactions">
              Revisar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

