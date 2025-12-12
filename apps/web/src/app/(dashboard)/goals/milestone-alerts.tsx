'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Trophy, Target, PartyPopper } from 'lucide-react'
import Confetti from 'react-confetti'
import { CategoryIcon } from '@/lib/category-icons'

interface Goal {
  id: string
  name: string
  current_amount: number
  target_amount: number
  icon?: string
}

interface MilestoneAlertsProps {
  goals: Goal[]
}

interface Milestone {
  goalId: string
  goalName: string
  goalIcon?: string
  percentage: number
  type: '50' | '75' | '100'
}

const STORAGE_KEY = 'planna_dismissed_milestones'

function getDismissedMilestones(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function dismissMilestone(key: string) {
  const dismissed = getDismissedMilestones()
  dismissed.push(key)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed))
}

export function MilestoneAlerts({ goals }: MilestoneAlertsProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    const dismissed = getDismissedMilestones()
    const newMilestones: Milestone[] = []

    goals.forEach((goal) => {
      const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100

      // Check 100% milestone
      if (percentage >= 100) {
        const key = `${goal.id}-100`
        if (!dismissed.includes(key)) {
          newMilestones.push({
            goalId: goal.id,
            goalName: goal.name,
            goalIcon: goal.icon,
            percentage: 100,
            type: '100',
          })
        }
      }
      // Check 75% milestone
      else if (percentage >= 75) {
        const key = `${goal.id}-75`
        if (!dismissed.includes(key)) {
          newMilestones.push({
            goalId: goal.id,
            goalName: goal.name,
            goalIcon: goal.icon,
            percentage: Math.round(percentage),
            type: '75',
          })
        }
      }
      // Check 50% milestone
      else if (percentage >= 50) {
        const key = `${goal.id}-50`
        if (!dismissed.includes(key)) {
          newMilestones.push({
            goalId: goal.id,
            goalName: goal.name,
            goalIcon: goal.icon,
            percentage: Math.round(percentage),
            type: '50',
          })
        }
      }
    })

    setMilestones(newMilestones)

    // Show confetti for 100% milestones
    if (newMilestones.some((m) => m.type === '100')) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [goals])

  const handleDismiss = (milestone: Milestone) => {
    const key = `${milestone.goalId}-${milestone.type}`
    dismissMilestone(key)
    setMilestones((prev) => prev.filter((m) => !(m.goalId === milestone.goalId && m.type === milestone.type)))
  }

  if (milestones.length === 0) return null

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#FBBF24', '#F59E0B']}
        />
      )}

      <div className="space-y-3">
        {milestones.map((milestone) => (
          <Card
            key={`${milestone.goalId}-${milestone.type}`}
            className={
              milestone.type === '100'
                ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
                : milestone.type === '75'
                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                : 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      milestone.type === '100'
                        ? 'bg-amber-100 dark:bg-amber-900/50'
                        : milestone.type === '75'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-blue-100 dark:bg-blue-900/50'
                    }`}
                  >
                    {milestone.type === '100' ? (
                      <PartyPopper className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    ) : milestone.type === '75' ? (
                      <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CategoryIcon icon={milestone.goalIcon || '🎯'} className="text-lg" />
                      <h4 className="font-semibold text-foreground">{milestone.goalName}</h4>
                    </div>
                    <p className={`text-sm ${
                      milestone.type === '100'
                        ? 'text-amber-700 dark:text-amber-300'
                        : milestone.type === '75'
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {milestone.type === '100' ? (
                        <>🎉 Parabéns! Meta concluída com sucesso!</>
                      ) : milestone.type === '75' ? (
                        <>Incrível! Você já atingiu {milestone.percentage}% da meta!</>
                      ) : (
                        <>Ótimo progresso! Você passou de 50% da meta ({milestone.percentage}%)</>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleDismiss(milestone)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

