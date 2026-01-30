'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Bell, X, Target, Calendar, Lightbulb, Clock, AlertTriangle, Trophy, Sparkles, TrendingUp, CreditCard, Zap } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatCurrency } from '@/lib/utils'

// Lazy load confetti e useWindowSize - só carrega quando meta é concluída
const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

interface Goal {
  id: string
  name: string
  icon?: string
  current_amount: number
  target_amount: number
}

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  next_occurrence: string
  frequency?: string
  category?: { icon: string; name?: string } | null
}

interface BudgetAlert {
  category_name: string
  category_icon: string
  spent: number
  budget_amount: number
  status: string
}

interface UnusualSpending {
  categoryId: string
  categoryName: string
  categoryIcon: string
  current: number
  average: number
  percentAbove: number
}

interface NotificationsDropdownProps {
  goals: Goal[]
  recurring: RecurringTransaction[]
  budgetAlerts: BudgetAlert[]
  pendingCount: number
  pendingTotal: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  // New insight data
  unusualSpending?: UnusualSpending[]
  recurringExpensesMonthly?: number
  subscriptionCount?: number
}

interface Notification {
  id: string
  type: 'milestone' | 'due-bill' | 'suggestion' | 'pending' | 'budget' | 'unusual' | 'insight'
  icon: React.ReactNode
  title: string
  description: string
  link?: string
  priority: 'high' | 'medium' | 'low'
  isGoalCompleted?: boolean
}

const STORAGE_KEY = 'poupefy_dismissed_notifications'

function getDismissed(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function dismiss(id: string) {
  const dismissed = getDismissed()
  if (!dismissed.includes(id)) {
    dismissed.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed))
  }
}

function getDaysUntil(dateStr: string): number {
  const next = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function NotificationsDropdown({
  goals,
  recurring,
  budgetAlerts,
  pendingCount,
  pendingTotal,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  unusualSpending = [],
  recurringExpensesMonthly = 0,
  subscriptionCount = 0,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Get window size only when confetti is needed
  useEffect(() => {
    if (showConfetti) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
  }, [showConfetti])

  // Load dismissed IDs only on client after mount
  useEffect(() => {
    setIsMounted(true)
    setDismissedIds(getDismissed())
  }, [])

  // Calculate notifications only on client to avoid hydration mismatch
  const { notifications, hasCompletedGoal } = useMemo(() => {
    if (!isMounted) {
      return { notifications: [], hasCompletedGoal: false }
    }

    const notifications: Notification[] = []
    let hasCompletedGoal = false

    // 1. Pending transactions
    if (pendingCount > 0) {
      notifications.push({
        id: 'pending-transactions',
        type: 'pending',
        icon: <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
        title: `${pendingCount} transação${pendingCount > 1 ? 'ões' : ''} pendente${pendingCount > 1 ? 's' : ''}`,
        description: `${formatCurrency(pendingTotal)} aguardando confirmação`,
        link: '/transactions',
        priority: 'high',
      })
    }

    // 2. Due bills (next 7 days)
    const dueBills = recurring.filter(r => {
      const days = getDaysUntil(r.next_occurrence)
      return r.type === 'expense' && days >= 0 && days <= 7
    })
    
    if (dueBills.length > 0) {
      const urgentCount = dueBills.filter(r => getDaysUntil(r.next_occurrence) <= 1).length
      const totalDue = dueBills.reduce((sum, r) => sum + Number(r.amount), 0)
      
      notifications.push({
        id: 'due-bills',
        type: 'due-bill',
        icon: <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
        title: urgentCount > 0 
          ? `${urgentCount} conta${urgentCount > 1 ? 's' : ''} vence${urgentCount > 1 ? 'm' : ''} hoje/amanhã!`
          : `${dueBills.length} conta${dueBills.length > 1 ? 's' : ''} a vencer`,
        description: `Total: ${formatCurrency(totalDue)} nos próximos 7 dias`,
        link: '/recurring',
        priority: urgentCount > 0 ? 'high' : 'medium',
      })
    }

    // 3. Budget alerts
    const exceededBudgets = budgetAlerts.filter(b => b.status === 'exceeded' || b.status === 'warning')
    if (exceededBudgets.length > 0) {
      notifications.push({
        id: 'budget-alerts',
        type: 'budget',
        icon: <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />,
        title: `${exceededBudgets.length} orçamento${exceededBudgets.length > 1 ? 's' : ''} no limite`,
        description: exceededBudgets.map(b => b.category_name).slice(0, 2).join(', '),
        link: '/budgets',
        priority: 'high',
      })
    }

    // 4. ⚠️ UNUSUAL SPENDING ALERTS (NEW!)
    unusualSpending.slice(0, 2).forEach((item, index) => {
      const id = `unusual-${item.categoryId}-${new Date().getMonth()}`
      if (!dismissedIds.includes(id)) {
        notifications.push({
          id,
          type: 'unusual',
          icon: <TrendingUp className="h-4 w-4 text-orange-500 dark:text-orange-400" />,
          title: `⚠️ Gasto incomum: ${item.categoryName}`,
          description: `${formatCurrency(item.current)} este mês (${item.percentAbove.toFixed(0)}% acima da média de ${formatCurrency(item.average)})`,
          link: '/reports',
          priority: 'high',
        })
      }
    })

    // 5. Goal milestones
    goals.forEach(goal => {
      const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100
      let milestoneType: '50' | '75' | '100' | null = null
      
      if (percentage >= 100) milestoneType = '100'
      else if (percentage >= 75) milestoneType = '75'
      else if (percentage >= 50) milestoneType = '50'
      
      if (milestoneType) {
        const id = `milestone-${goal.id}-${milestoneType}`
        if (!dismissedIds.includes(id)) {
          const isCompleted = milestoneType === '100'
          if (isCompleted) hasCompletedGoal = true
          
          notifications.push({
            id,
            type: 'milestone',
            icon: isCompleted 
              ? <Trophy className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              : <Target className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />,
            title: isCompleted 
              ? `Meta "${goal.name}" concluída!`
              : `Meta "${goal.name}" em ${milestoneType}%`,
            description: `${formatCurrency(Number(goal.current_amount))} de ${formatCurrency(Number(goal.target_amount))}`,
            link: '/goals',
            priority: isCompleted ? 'high' : 'medium',
            isGoalCompleted: isCompleted,
          })
        }
      }
    })

    // 6. 💡 ECONOMY SUGGESTIONS (NEW!)
    
    // 6a. Low savings rate
    if (savingsRate < 10 && monthlyIncome > 0) {
      const id = 'suggestion-low-savings'
      if (!dismissedIds.includes(id)) {
        notifications.push({
          id,
          type: 'suggestion',
          icon: <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
          title: '💡 Taxa de poupança baixa',
          description: `Você está economizando apenas ${savingsRate.toFixed(0)}% da renda. Recomendado: 20%`,
          priority: 'low',
        })
      }
    }

    // 6b. High recurring expenses (> 40% of income)
    if (monthlyIncome > 0 && recurringExpensesMonthly > monthlyIncome * 0.4) {
      const id = 'suggestion-high-recurring'
      if (!dismissedIds.includes(id)) {
        const percentOfIncome = (recurringExpensesMonthly / monthlyIncome) * 100
        notifications.push({
          id,
          type: 'insight',
          icon: <CreditCard className="h-4 w-4 text-purple-500 dark:text-purple-400" />,
          title: '💡 Despesas fixas altas',
          description: `${formatCurrency(recurringExpensesMonthly)}/mês (${percentOfIncome.toFixed(0)}% da renda) em recorrentes`,
          link: '/recurring',
          priority: 'low',
        })
      }
    }

    // 6c. Many subscriptions
    if (subscriptionCount >= 3) {
      const id = 'suggestion-subscriptions'
      if (!dismissedIds.includes(id)) {
        notifications.push({
          id,
          type: 'insight',
          icon: <Zap className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />,
          title: '💡 Muitas assinaturas',
          description: `${subscriptionCount} serviços de streaming/assinatura ativos. Revise se usa todos!`,
          link: '/recurring',
          priority: 'low',
        })
      }
    }

    // 6d. Spending more than earning
    if (monthlyIncome > 0 && monthlyExpenses > monthlyIncome) {
      const id = 'suggestion-overspending'
      if (!dismissedIds.includes(id)) {
        const overspent = monthlyExpenses - monthlyIncome
        notifications.push({
          id,
          type: 'insight',
          icon: <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />,
          title: '⚠️ Gastando mais que ganha',
          description: `Despesas excedem receitas em ${formatCurrency(overspent)} este mês`,
          link: '/reports',
          priority: 'high',
        })
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return { notifications, hasCompletedGoal }
  }, [
    isMounted,
    dismissedIds,
    pendingCount,
    pendingTotal,
    recurring,
    budgetAlerts,
    unusualSpending,
    goals,
    savingsRate,
    monthlyIncome,
    recurringExpensesMonthly,
    subscriptionCount,
    monthlyExpenses,
  ])

  // Trigger confetti when opening with completed goal
  useEffect(() => {
    if (open && hasCompletedGoal) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [open, hasCompletedGoal])

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dismiss(id)
    setDismissedIds([...dismissedIds, id])
  }

  const notificationCount = notifications.length

  return (
    <>
      {/* Confetti for completed goals - lazy loaded */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#10B981', '#34D399', '#6EE7B7', '#FFD700', '#FFC107', '#FF6B6B']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all"
          >
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-80 p-0 border-border bg-card" align="end">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <h4 className="font-semibold text-foreground">Notificações</h4>
            {notificationCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {notificationCount} nova{notificationCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Tudo em dia! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 transition-all duration-200 hover:bg-accent/50 ${
                      notification.isGoalCompleted 
                        ? 'bg-gradient-to-r from-emerald-50 to-yellow-50 dark:from-emerald-950/30 dark:to-yellow-950/30 animate-pulse-subtle' 
                        : notification.priority === 'high' 
                          ? 'bg-red-50/50 dark:bg-red-950/20' 
                          : ''
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${notification.isGoalCompleted ? 'animate-bounce' : ''}`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        notification.isGoalCompleted 
                          ? 'text-emerald-700 dark:text-emerald-300' 
                          : 'text-foreground'
                      }`}>
                        {notification.isGoalCompleted && <Sparkles className="inline h-3 w-3 mr-1" />}
                        {notification.title}
                        {notification.isGoalCompleted && ' 🎉'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.description}
                      </p>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-xs text-primary hover:underline mt-1 inline-block font-medium"
                          onClick={() => setOpen(false)}
                        >
                          Ver detalhes →
                        </Link>
                      )}
                    </div>
                    {['milestone', 'suggestion', 'unusual', 'insight'].includes(notification.type) ? (
                      <button
                        onClick={(e) => handleDismiss(notification.id, e)}
                        className="shrink-0 p-1 hover:bg-accent rounded-md transition-colors"
                        title="Dispensar"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="border-t border-border px-4 py-2 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                +{notifications.length - 5} outras notificações
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

