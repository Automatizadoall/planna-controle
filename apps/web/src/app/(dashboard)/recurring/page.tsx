import { createClient } from '@/lib/supabase/server'
import { RecurringList } from './recurring-list'
import { CreateRecurringDialog } from './create-recurring-dialog'
import { RecurringSummary } from './recurring-summary'

export default async function RecurringPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get recurring transactions with related data
  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select(`
      *,
      account:accounts(id, name, type),
      category:categories(id, name, icon, color)
    `)
    .eq('user_id', user.id)
    .order('next_occurrence', { ascending: true })

  // Get accounts for form
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  // Get categories for form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order('type')
    .order('name')

  // Separate active and inactive
  const activeRecurring = recurring?.filter((r) => r.is_active) || []
  const inactiveRecurring = recurring?.filter((r) => !r.is_active) || []

  // Calculate summary
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueCount = activeRecurring.filter((r) => {
    const next = new Date(r.next_occurrence)
    next.setHours(0, 0, 0, 0)
    return next <= today
  }).length

  const monthlyExpenses = activeRecurring
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => {
      const amount = Number(r.amount)
      switch (r.frequency) {
        case 'daily': return sum + amount * 30
        case 'weekly': return sum + amount * 4
        case 'monthly': return sum + amount
        case 'yearly': return sum + amount / 12
        default: return sum
      }
    }, 0)

  const monthlyIncome = activeRecurring
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => {
      const amount = Number(r.amount)
      switch (r.frequency) {
        case 'daily': return sum + amount * 30
        case 'weekly': return sum + amount * 4
        case 'monthly': return sum + amount
        case 'yearly': return sum + amount / 12
        default: return sum
      }
    }, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações Recorrentes</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e receitas fixas</p>
        </div>
        <CreateRecurringDialog accounts={accounts || []} categories={categories || []} />
      </div>

      {/* Summary */}
      <RecurringSummary
        activeCount={activeRecurring.length}
        dueCount={dueCount}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
      />

      {/* Active Recurring */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Ativas ({activeRecurring.length})
        </h2>
        <RecurringList
          recurring={activeRecurring}
          accounts={accounts || []}
          categories={categories || []}
        />
      </div>

      {/* Inactive Recurring */}
      {inactiveRecurring.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Inativas ({inactiveRecurring.length})
          </h2>
          <RecurringList
            recurring={inactiveRecurring}
            accounts={accounts || []}
            categories={categories || []}
            isInactive
          />
        </div>
      )}
    </div>
  )
}

