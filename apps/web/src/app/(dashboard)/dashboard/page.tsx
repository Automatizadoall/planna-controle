import { createClient } from '@/lib/supabase/server'
import { DashboardSummary } from './dashboard-summary'
import { ExpensesByCategory } from './expenses-by-category'
import { IncomeVsExpenses } from './income-vs-expenses'
import { RecentTransactions } from './recent-transactions'
import { BudgetAlerts } from './budget-alerts'
import { GoalsProgress } from './goals-progress'
import { UpcomingRecurring } from './upcoming-recurring'
import { CarouselSection } from './carousel-section'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  // Fetch all data in parallel
  const [
    { data: accounts },
    { data: transactions },
    { data: budgets },
    { data: goals },
    { data: recurring },
  ] = await Promise.all([
    // Accounts with balance
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false),
    
    // Transactions for current month
    supabase
      .from('transactions')
      .select('*, category:categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false }),
    
    // Budget status view
    supabase
      .from('budget_status')
      .select('*')
      .eq('user_id', user.id),
    
    // Active goals
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('target_date', { ascending: true }),
    
    // Upcoming recurring
    supabase
      .from('recurring_transactions')
      .select('*, account:accounts(id, name), category:categories(id, name, icon)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('next_occurrence', { ascending: true })
      .limit(5),
  ])

  // Calculate summary
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
  
  const monthlyIncome = transactions
    ?.filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  
  const monthlyExpenses = transactions
    ?.filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Group expenses by category
  const expensesByCategory = transactions
    ?.filter((t) => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const catId = t.category?.id || 'uncategorized'
      const catName = t.category?.name || 'Sem categoria'
      const catColor = t.category?.color || '#6B7280'
      const catIcon = t.category?.icon || '📦'
      
      if (!acc[catId]) {
        acc[catId] = { name: catName, color: catColor, icon: catIcon, total: 0 }
      }
      acc[catId].total += Number(t.amount)
      return acc
    }, {} as Record<string, { name: string; color: string; icon: string; total: number }>)

  type CategoryData = { name: string; color: string; icon: string; total: number }
  const expensesByCategoryArray = (Object.values(expensesByCategory || {}) as CategoryData[])
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  // Get last 6 months for chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      year: date.getFullYear(),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0],
    }
  })

  // Fetch historical transactions
  const { data: historicalTransactions } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .eq('user_id', user.id)
    .gte('date', last6Months[0].startDate)
    .lte('date', last6Months[5].endDate)

  // Calculate monthly totals
  const monthlyData = last6Months.map((month) => {
    const monthTransactions = historicalTransactions?.filter(
      (t) => t.date >= month.startDate && t.date <= month.endDate
    ) || []
    
    return {
      name: month.month,
      income: monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      expenses: monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }
  })

  // Budget alerts (warning or exceeded)
  const budgetAlerts = budgets?.filter((b) => b.status === 'warning' || b.status === 'exceeded') || []

  // Recent transactions (last 5)
  const recentTransactions = transactions?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças em {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <DashboardSummary
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        accountsCount={accounts?.length || 0}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensesByCategory data={expensesByCategoryArray} total={monthlyExpenses} />
        <IncomeVsExpenses data={monthlyData} />
      </div>

      {/* Alerts and Progress Row */}
      <CarouselSection>
        <BudgetAlerts alerts={budgetAlerts} />
        <GoalsProgress goals={goals || []} />
        <UpcomingRecurring recurring={recurring || []} />
      </CarouselSection>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}
