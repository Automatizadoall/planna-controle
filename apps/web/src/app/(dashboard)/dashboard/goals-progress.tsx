'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { Target, ArrowRight, Trophy, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCarouselSync } from '@/components/carousel-sync-context'
import { CategoryIcon } from '@/lib/category-icons'

interface Goal {
  id: string
  name: string
  icon: string | null
  color: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
}

interface GoalsProgressProps {
  goals: Goal[]
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  const { tick } = useCarouselSync()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Determine status based on current_amount vs target_amount
  const activeGoals = goals.filter((g) => Number(g.current_amount) < Number(g.target_amount))
  const completedGoals = goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount))

  // Sync with global tick
  useEffect(() => {
    if (activeGoals.length <= 1) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeGoals.length)
      setIsAnimating(false)
    }, 300)
  }, [tick, activeGoals.length])

  const goToNext = () => {
    if (activeGoals.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeGoals.length)
      setIsAnimating(false)
    }, 300)
  }

  const goToPrev = () => {
    if (activeGoals.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeGoals.length) % activeGoals.length)
      setIsAnimating(false)
    }, 300)
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Metas de Economia</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" asChild>
            <Link href="/goals">
              Ver todas <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted mb-2 sm:mb-3">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma meta criada</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">Crie metas para economizar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentGoal = activeGoals[currentIndex]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
          Metas de Economia
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" asChild>
          <Link href="/goals">
            <span className="hidden sm:inline">Ver todas</span>
            <ArrowRight className="sm:ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {/* Completed Count */}
          {completedGoals.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{completedGoals.length} meta(s) alcançada(s)!</span>
            </div>
          )}

          {/* Carousel */}
          {activeGoals.length > 0 && currentGoal && (
            <div className="relative">
              {/* Navigation arrows */}
              {activeGoals.length > 1 && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
                  <button
                    onClick={goToPrev}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}

              {/* Goal Card */}
              <div
                className={cn(
                  'rounded-xl border border-border p-3 sm:p-4 pr-7 sm:pr-8 transition-all duration-300',
                  isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                )}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <div 
                      className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${currentGoal.color || '#10B981'}20`, color: currentGoal.color || '#10B981' }}
                    >
                      <CategoryIcon icon={currentGoal.icon || 'lucide:target'} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-foreground truncate">{currentGoal.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold flex-shrink-0 ml-2" style={{ color: currentGoal.color || '#10B981' }}>
                    {calculatePercentage(Number(currentGoal.current_amount), Number(currentGoal.target_amount))}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 sm:h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(calculatePercentage(Number(currentGoal.current_amount), Number(currentGoal.target_amount)), 100)}%`,
                      backgroundColor: currentGoal.color || '#10B981'
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {formatCurrency(Number(currentGoal.current_amount))} de {formatCurrency(Number(currentGoal.target_amount))}
                  </p>
                  
                  {/* Dots indicator */}
                  {activeGoals.length > 1 && (
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {activeGoals.map((_, index) => (
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
                              ? 'w-3 sm:w-4 bg-primary' 
                              : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
