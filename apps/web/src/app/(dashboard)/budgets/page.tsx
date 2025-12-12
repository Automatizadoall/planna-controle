import { createClient } from '@/lib/supabase/server'
import { BudgetsList } from './budgets-list'
import { CreateBudgetDialog } from './create-budget-dialog'
import { BudgetsSummary } from './budgets-summary'
import { getPeriodDateRange } from '@/lib/validations/budget'

export default async function BudgetsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get budgets with category info
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      *,
      category:categories(id, name, icon, color, type)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Get expense categories for creating new budgets
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .eq('type', 'expense')
    .order('name')

  // Get all category IDs and date ranges for budgets
  const categoryIds = (budgets || []).map(b => b.category_id).filter(Boolean)
  
  // Get the widest date range needed (yearly covers all)
  const { start: yearStart, end: yearEnd } = getPeriodDateRange('yearly')
  const { start: monthStart, end: monthEnd } = getPeriodDateRange('monthly')
  const { start: weekStart, end: weekEnd } = getPeriodDateRange('weekly')

  // Single query to get ALL expense transactions for the user's budget categories this year
  const { data: allTransactions } = categoryIds.length > 0 
    ? await supabase
        .from('transactions')
        .select('amount, category_id, date')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .in('category_id', categoryIds)
        .gte('date', yearStart.toISOString().split('T')[0])
        .lte('date', yearEnd.toISOString().split('T')[0])
    : { data: [] }

  // Calculate spent amounts in memory (much faster than N queries)
  const budgetsWithSpent = (budgets || []).map((budget) => {
    const period = budget.period as 'monthly' | 'weekly' | 'yearly'
    let start: Date, end: Date
    
    if (period === 'yearly') {
      start = yearStart; end = yearEnd
    } else if (period === 'weekly') {
      start = weekStart; end = weekEnd
    } else {
      start = monthStart; end = monthEnd
    }
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    // Filter transactions for this budget's category and period
    const spent = (allTransactions || [])
      .filter(t => 
        t.category_id === budget.category_id && 
        t.date >= startStr && 
        t.date <= endStr
      )
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      ...budget,
      spent,
      remaining: Number(budget.amount) - spent,
      percentage: Math.round((spent / Number(budget.amount)) * 100),
    }
  })

  // Calculate summary
  const totalBudgeted = budgetsWithSpent.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0)
  const overBudgetCount = budgetsWithSpent.filter((b) => b.percentage >= 100).length
  const nearLimitCount = budgetsWithSpent.filter((b) => b.percentage >= b.alert_threshold && b.percentage < 100).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Defina limites de gastos por categoria</p>
        </div>
        <CreateBudgetDialog 
          categories={categories || []} 
          existingCategoryIds={budgets?.map(b => b.category_id) || []}
        />
      </div>

      {/* Summary */}
      <BudgetsSummary
        totalBudgeted={totalBudgeted}
        totalSpent={totalSpent}
        budgetsCount={budgetsWithSpent.length}
        overBudgetCount={overBudgetCount}
        nearLimitCount={nearLimitCount}
      />

      {/* Budgets List */}
      <BudgetsList 
        budgets={budgetsWithSpent} 
        categories={categories || []}
      />
    </div>
  )
}

