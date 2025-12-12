import { createClient } from '@/lib/supabase/server'
import { GoalsList } from './goals-list'
import { CreateGoalDialog } from './create-goal-dialog'
import { GoalsSummary } from './goals-summary'

export default async function GoalsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Separate active and completed goals
  const activeGoals = goals?.filter((g) => Number(g.current_amount) < Number(g.target_amount)) || []
  const completedGoals = goals?.filter((g) => Number(g.current_amount) >= Number(g.target_amount)) || []

  // Calculate summary
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0)
  const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0)
  const totalRemaining = totalTargetAmount - totalCurrentAmount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas de Economia</h1>
          <p className="text-muted-foreground">Defina objetivos e acompanhe seu progresso</p>
        </div>
        <CreateGoalDialog />
      </div>

      {/* Summary */}
      <GoalsSummary
        totalTargetAmount={totalTargetAmount}
        totalCurrentAmount={totalCurrentAmount}
        totalRemaining={totalRemaining}
        activeCount={activeGoals.length}
        completedCount={completedGoals.length}
      />

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Metas Ativas ({activeGoals.length})
        </h2>
        <GoalsList goals={activeGoals} />
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Metas Concluídas ({completedGoals.length}) 🎉
          </h2>
          <GoalsList goals={completedGoals} isCompleted />
        </div>
      )}
    </div>
  )
}

