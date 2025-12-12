'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@mentoria/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addContribution } from './actions'
import { Loader2, TrendingUp, Trophy, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { calculateGoalProgress } from '@/lib/validations/goal'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface AddContributionDialogProps {
  goal: Goal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddContributionDialog({ goal, open, onOpenChange }: AddContributionDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [completedMessage, setCompletedMessage] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { width, height } = useWindowSize()

  const currentAmount = Number(goal.current_amount)
  const targetAmount = Number(goal.target_amount)
  const remaining = targetAmount - currentAmount
  const percentage = calculateGoalProgress(currentAmount, targetAmount)

  // Preview calculation
  const previewAmount = parseFloat(amount) || 0
  const newTotal = currentAmount + previewAmount
  const newPercentage = calculateGoalProgress(newTotal, targetAmount)
  const willComplete = newTotal >= targetAmount

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const contributionAmount = parseFloat(amount)

    if (!contributionAmount || contributionAmount <= 0) {
      setErrors({ amount: 'Valor deve ser maior que zero' })
      setIsLoading(false)
      return
    }

    try {
      const response = await addContribution({
        goalId: goal.id,
        amount: contributionAmount,
      })

      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      if (response.isCompleted && response.message) {
        setCompletedMessage(response.message)
        setShowConfetti(true)
        // Wait longer to enjoy the celebration!
        setTimeout(() => {
          onOpenChange(false)
          setCompletedMessage(null)
          setShowConfetti(false)
          setAmount('')
          router.refresh()
        }, 4500)
      } else {
        onOpenChange(false)
        setAmount('')
        router.refresh()
      }
    } catch (error) {
      setErrors({ general: 'Erro ao adicionar contribuição. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Celebration state - EPIC VERSION!
  if (completedMessage) {
    return (
      <>
        {/* Full screen confetti */}
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={300}
            gravity={0.2}
            colors={['#10B981', '#34D399', '#6EE7B7', '#FFD700', '#FFC107', '#FF6B6B', '#A855F7', '#3B82F6']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
          />
        )}
        
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md text-center border-0 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 dark:from-emerald-950 dark:via-slate-900 dark:to-yellow-950">
            <div className="py-8 space-y-6">
              {/* Trophy with glow effect */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl animate-pulse" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl shadow-yellow-500/50 animate-bounce">
                    <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              {/* Sparkles decoration */}
              <div className="flex justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              
              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-yellow-500 bg-clip-text text-transparent">
                  Parabéns! 🎉
                </h2>
                <p className="text-lg text-muted-foreground">{completedMessage}</p>
              </div>
              
              {/* Goal info card */}
              <div className="mx-4 rounded-xl bg-white/80 dark:bg-slate-800/80 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{goal.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{goal.name}</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(targetAmount)} alcançados!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress bar at 100% */}
              <div className="mx-4">
                <div className="h-3 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-yellow-400 transition-all duration-1000"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-2">100% Completo!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon}</span>
            {goal.name}
          </DialogTitle>
          <DialogDescription>
            Adicione um valor à sua meta de economia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">{errors.general}</div>
          )}

          {/* Current Progress */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso atual</span>
              <span className="font-semibold text-foreground">{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(currentAmount)}</span>
              <span>{formatCurrency(targetAmount)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="contribution-amount">Valor a adicionar (R$)</Label>
            <Input
              id="contribution-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className={`text-lg font-semibold ${errors.amount ? 'border-red-500' : ''}`}
              autoFocus
            />
            {errors.amount && <p className="text-xs text-red-500 dark:text-red-400">{errors.amount}</p>}
            <p className="text-xs text-muted-foreground">
              Faltam {formatCurrency(remaining)} para atingir a meta
            </p>
          </div>

          {/* Preview */}
          {previewAmount > 0 && (
            <div className={`rounded-lg p-4 ${willComplete ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`h-4 w-4 ${willComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className={`text-sm font-medium ${willComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {willComplete ? '🎉 Meta será alcançada!' : 'Após adicionar'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={willComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                  Novo total: {formatCurrency(newTotal)}
                </span>
                <span className={`font-bold ${willComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {newPercentage}%
                </span>
              </div>
            </div>
          )}

          {/* Quick amounts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valores rápidos</Label>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 200, 500].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value.toString())}
                  disabled={isLoading}
                >
                  +{formatCurrency(value)}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(remaining.toFixed(2))}
                disabled={isLoading || remaining <= 0}
              >
                Completar
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !amount || parseFloat(amount) <= 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

