'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, ArrowRight, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCarouselSync } from '@/components/carousel-sync-context'
import { CategoryIcon } from '@/lib/category-icons'

interface BudgetAlert {
  id: string
  category_name: string
  category_icon: string
  category_color: string
  limit_amount: number
  spent: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
}

interface BudgetAlertsProps {
  alerts: BudgetAlert[]
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  const { tick } = useCarouselSync()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Sync with global tick
  useEffect(() => {
    if (alerts.length <= 1) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
      setIsAnimating(false)
    }, 300)
  }, [tick, alerts.length])

  const goToNext = () => {
    if (alerts.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
      setIsAnimating(false)
    }, 300)
  }

  const goToPrev = () => {
    if (alerts.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length)
      setIsAnimating(false)
    }, 300)
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Alertas de Orcamento</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/budgets">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Tudo sob controle!</p>
            <p className="text-xs text-muted-foreground">Nenhum orcamento em alerta</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentAlert = alerts[currentIndex]

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          Alertas de Orcamento
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/budgets">
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {alerts.length > 1 && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
              <button
                onClick={goToPrev}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}

          <div
            className={cn(
              'rounded-xl border p-4 pr-8 transition-all duration-300',
              currentAlert.status === 'exceeded' && 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
              currentAlert.status === 'warning' && 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CategoryIcon icon={currentAlert.category_icon} className="text-xl" />
                <span className="font-medium text-foreground">{currentAlert.category_name}</span>
              </div>
              <span
                className={cn(
                  'text-sm font-bold px-2.5 py-0.5 rounded-full',
                  currentAlert.status === 'exceeded' && 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
                  currentAlert.status === 'warning' && 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                )}
              >
                {currentAlert.percentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  currentAlert.status === 'exceeded' && 'bg-red-500',
                  currentAlert.status === 'warning' && 'bg-amber-500'
                )}
                style={{ width: `${Math.min(currentAlert.percentage, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(currentAlert.spent)} de {formatCurrency(currentAlert.limit_amount)}
              </p>
              
              {alerts.length > 1 && (
                <div className="flex items-center gap-1">
                  {alerts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsAnimating(true)
                        setTimeout(() => {
                          setCurrentIndex(index)
                          setIsAnimating(false)
                        }, 300)
                      }}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === currentIndex 
                          ? 'w-4 bg-amber-500' 
                          : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
