'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Repeat, ArrowRight, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCarouselSync } from '@/components/carousel-sync-context'
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
  if (diffDays === 1) return 'Amanha'
  if (diffDays <= 7) return `Em ${diffDays} dias`

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
  const { tick } = useCarouselSync()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Sync with global tick
  useEffect(() => {
    if (recurring.length <= 1) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % recurring.length)
      setIsAnimating(false)
    }, 300)
  }, [tick, recurring.length])

  const goToNext = () => {
    if (recurring.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % recurring.length)
      setIsAnimating(false)
    }, 300)
  }

  const goToPrev = () => {
    if (recurring.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + recurring.length) % recurring.length)
      setIsAnimating(false)
    }, 300)
  }

  if (recurring.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Proximas Recorrentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/recurring">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Repeat className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma recorrente</p>
            <p className="text-xs text-muted-foreground/70">Crie despesas/receitas fixas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dueCount = recurring.filter((r) => isDue(r.next_occurrence)).length
  const currentItem = recurring[currentIndex]
  const due = isDue(currentItem.next_occurrence)

  return (
    <Card className={dueCount > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className={cn('h-5 w-5', dueCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400')} />
          Proximas Recorrentes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/recurring">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {dueCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-3">
            <span>⚠️ {dueCount} pendente(s) para lancar</span>
          </div>
        )}

        <div className="relative">
          {/* Navigation arrows */}
          {recurring.length > 1 && (
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

          {/* Recurring Card */}
          <div
            className={cn(
              'rounded-xl border p-4 pr-8 transition-all duration-300',
              due && 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CategoryIcon icon={currentItem.category?.icon || ''} className="text-xl" />
                <span className="font-medium text-foreground">{currentItem.description}</span>
              </div>
              <p
                className={cn(
                  'text-sm font-bold',
                  currentItem.type === 'expense' ? 'text-red-500' : 'text-emerald-500'
                )}
              >
                {currentItem.type === 'expense' ? '-' : '+'}
                {formatCurrency(Number(currentItem.amount))}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className={cn('text-sm', due ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground')}>
                {formatNextOccurrence(currentItem.next_occurrence)}
              </p>
              
              {/* Dots indicator */}
              {recurring.length > 1 && (
                <div className="flex items-center gap-1">
                  {recurring.map((_, index) => (
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
                          ? 'w-4 bg-blue-500' 
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
