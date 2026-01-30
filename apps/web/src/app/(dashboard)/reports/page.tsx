import nextDynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { ReportFilters } from './report-filters'
import { ReportSummary } from './report-summary'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Lazy load gráficos pesados (Recharts) - reduz bundle inicial
const CategoryBreakdown = nextDynamic(
  () => import('./category-breakdown').then((m) => ({ default: m.CategoryBreakdown })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    ),
    ssr: true,
  }
)

const TrendChart = nextDynamic(
  () => import('./trend-chart').then((m) => ({ default: m.TrendChart })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    ),
    ssr: true,
  }
)

const MonthlyComparison = nextDynamic(
  () => import('./monthly-comparison').then((m) => ({ default: m.MonthlyComparison })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false, // Client only - fetches its own data
  }
)

const ExportPDFButton = nextDynamic(
  () => import('./export-pdf-button').then((m) => ({ default: m.ExportPDFButton })),
  {
    loading: () => <Skeleton className="h-10 w-32" />,
    ssr: false, // Client only - uses browser APIs
  }
)

interface SearchParams {
  period?: string
  startDate?: string
  endDate?: string
}

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'

// Helper to format date as YYYY-MM-DD
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get current date - use server's local time (should be configured for Brazil)
  const now = new Date()
  
  // Extract date components using local time (not UTC)
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentDay = now.getDate()
  
  let startDate: string
  let endDate: string = formatDate(currentYear, currentMonth, currentDay)
  
  const period = searchParams.period || 'month'

  switch (period) {
    case 'week':
      // 7 days ago
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      startDate = formatDate(weekAgo.getFullYear(), weekAgo.getMonth() + 1, weekAgo.getDate())
      break
    case 'month':
      // First day of current month
      startDate = formatDate(currentYear, currentMonth, 1)
      break
    case 'quarter':
      // First day of current quarter
      const quarterStartMonth = Math.floor((currentMonth - 1) / 3) * 3 + 1 // 1, 4, 7, or 10
      startDate = formatDate(currentYear, quarterStartMonth, 1)
      break
    case 'year':
      // First day of current year
      startDate = formatDate(currentYear, 1, 1)
      break
    case 'custom':
      startDate = searchParams.startDate || formatDate(currentYear, currentMonth, 1)
      endDate = searchParams.endDate || formatDate(currentYear, currentMonth, currentDay)
      break
    default:
      startDate = formatDate(currentYear, currentMonth, 1)
  }
  
  // Fetch transactions for the period - simplified query to avoid join issues
  const { data: rawTransactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  
  if (txError) {
    console.error('[Reports] Transaction fetch error:', txError)
  }
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
  
  // Map categories to transactions
  const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])
  const transactions = rawTransactions?.map(t => ({
    ...t,
    category: t.category_id ? categoryMap.get(t.category_id) : null
  })) || []
  
  // Calculate totals
  const totalIncome = transactions
    ?.filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const totalExpenses = transactions
    ?.filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const transactionCount = transactions?.length || 0

  // Group by category
  const expensesByCategory = transactions
    ?.filter((t) => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const catId = t.category?.id || 'uncategorized'
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          name: t.category?.name || 'Sem categoria',
          icon: t.category?.icon || '📦',
          color: t.category?.color || '#6B7280',
          total: 0,
          count: 0,
        }
      }
      acc[catId].total += Number(t.amount)
      acc[catId].count++
      return acc
    }, {} as Record<string, { id: string; name: string; icon: string; color: string; total: number; count: number }>)

  const incomeByCategory = transactions
    ?.filter((t) => t.type === 'income' && t.category)
    .reduce((acc, t) => {
      const catId = t.category?.id || 'uncategorized'
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          name: t.category?.name || 'Sem categoria',
          icon: t.category?.icon || '📦',
          color: t.category?.color || '#6B7280',
          total: 0,
          count: 0,
        }
      }
      acc[catId].total += Number(t.amount)
      acc[catId].count++
      return acc
    }, {} as Record<string, { id: string; name: string; icon: string; color: string; total: number; count: number }>)

  // Group by day for trend chart
  type DailyData = { date: string; income: number; expenses: number }
  const dailyData = transactions?.reduce((acc, t) => {
    const date = t.date
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0 }
    }
    if (t.type === 'income') {
      acc[date].income += Number(t.amount)
    } else if (t.type === 'expense') {
      acc[date].expenses += Number(t.amount)
    }
    return acc
  }, {} as Record<string, DailyData>)

  const trendData = (Object.values(dailyData || {}) as DailyData[]).sort((a, b) => a.date.localeCompare(b.date))

  // Get previous period for comparison
  const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  const prevStartDate = new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const prevEndDate = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: prevTransactions } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user.id)
    .gte('date', prevStartDate)
    .lte('date', prevEndDate)

  const prevIncome = prevTransactions
    ?.filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const prevExpenses = prevTransactions
    ?.filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <ExportPDFButton
          period={period}
          startDate={startDate}
          endDate={endDate}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          transactionCount={transactionCount}
          expensesByCategory={Object.values(expensesByCategory || {})}
          incomeByCategory={Object.values(incomeByCategory || {})}
        />
      </div>

      {/* Filters */}
      <ReportFilters
        currentPeriod={period}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Summary */}
      <ReportSummary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        transactionCount={transactionCount}
        prevIncome={prevIncome}
        prevExpenses={prevExpenses}
      />

      {/* Trend Chart */}
      <TrendChart data={trendData} />

      {/* Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown
          title="Despesas por Categoria"
          data={Object.values(expensesByCategory || {})}
          total={totalExpenses}
          type="expense"
        />
        <CategoryBreakdown
          title="Receitas por Categoria"
          data={Object.values(incomeByCategory || {})}
          total={totalIncome}
          type="income"
        />
      </div>

      {/* Monthly Comparison (for year view) */}
      {period === 'year' && (
        <MonthlyComparison userId={user.id} year={now.getFullYear()} />
      )}
    </div>
  )
}

