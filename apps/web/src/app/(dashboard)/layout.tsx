import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  // Last 3 months for historical comparison (excluding current month)
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  // Fetch all notification data in parallel
  const [
    { data: profile },
    { data: goals },
    { data: recurring },
    { data: budgetAlerts },
    { data: pendingTransactions },
    { data: monthlyTransactions },
    { data: historicalTransactions },
    { data: categories },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('goals').select('id, name, icon, current_amount, target_amount').eq('user_id', user.id),
    supabase
      .from('recurring_transactions')
      .select('id, description, amount, type, next_occurrence, frequency, category:categories(icon, name)')
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase.from('budget_status').select('category_name, category_icon, spent, budget_amount, status').eq('user_id', user.id),
    supabase.from('transactions').select('id, amount, type').eq('user_id', user.id).eq('status', 'pending'),
    // Current month transactions with category
    supabase
      .from('transactions')
      .select('type, amount, category_id')
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth),
    // Last 3 months transactions for comparison
    supabase
      .from('transactions')
      .select('type, amount, category_id, date')
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .gte('date', threeMonthsAgo)
      .lt('date', startOfMonth),
    // Categories for names
    supabase
      .from('categories')
      .select('id, name, icon')
      .or(`user_id.eq.${user.id},is_system.eq.true`),
  ])

  // Calculate notification data
  const pendingCount = pendingTransactions?.length || 0
  const pendingTotal = pendingTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  
  const monthlyIncome = monthlyTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const monthlyExpenses = monthlyTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

  // Calculate current month expenses by category
  const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])
  const currentMonthByCategory: Record<string, number> = {}
  monthlyTransactions?.filter(t => t.type === 'expense' && t.category_id).forEach(t => {
    currentMonthByCategory[t.category_id] = (currentMonthByCategory[t.category_id] || 0) + Number(t.amount)
  })

  // Calculate average monthly expenses by category (last 3 months)
  const historicalByCategory: Record<string, number[]> = {}
  historicalTransactions?.filter(t => t.type === 'expense' && t.category_id).forEach(t => {
    if (!historicalByCategory[t.category_id]) {
      historicalByCategory[t.category_id] = []
    }
    historicalByCategory[t.category_id].push(Number(t.amount))
  })
  
  // Calculate average per category
  const avgByCategory: Record<string, number> = {}
  Object.entries(historicalByCategory).forEach(([catId, amounts]) => {
    avgByCategory[catId] = amounts.reduce((a, b) => a + b, 0) / 3 // Average over 3 months
  })

  // Find unusual spending (current > 50% above average)
  const unusualSpending: { categoryId: string; categoryName: string; categoryIcon: string; current: number; average: number; percentAbove: number }[] = []
  Object.entries(currentMonthByCategory).forEach(([catId, current]) => {
    const avg = avgByCategory[catId] || 0
    if (avg > 0 && current > avg * 1.5) { // 50% above average
      const cat = categoryMap.get(catId)
      unusualSpending.push({
        categoryId: catId,
        categoryName: cat?.name || 'Categoria',
        categoryIcon: cat?.icon || '📦',
        current,
        average: avg,
        percentAbove: ((current - avg) / avg) * 100,
      })
    }
  })
  // Sort by percent above (highest first)
  unusualSpending.sort((a, b) => b.percentAbove - a.percentAbove)

  // Calculate recurring expenses total (monthly equivalent)
  const recurringExpensesMonthly = recurring?.filter(r => r.type === 'expense').reduce((sum, r) => {
    const amount = Number(r.amount)
    switch (r.frequency) {
      case 'daily': return sum + amount * 30
      case 'weekly': return sum + amount * 4
      case 'monthly': return sum + amount
      case 'yearly': return sum + amount / 12
      default: return sum + amount
    }
  }, 0) || 0

  // Count streaming/subscription type recurring
  const subscriptionKeywords = ['netflix', 'spotify', 'disney', 'hbo', 'amazon', 'prime', 'youtube', 'apple', 'google', 'microsoft', 'adobe', 'gym', 'academia']
  const subscriptionCount = recurring?.filter(r => {
    const desc = r.description.toLowerCase()
    return r.type === 'expense' && subscriptionKeywords.some(k => desc.includes(k))
  }).length || 0

  const notificationData = {
    goals: goals || [],
    recurring: (recurring || []).map(r => ({
      ...r,
      category: Array.isArray(r.category) ? (r.category[0] ?? null) : (r.category ?? null),
    })),
    budgetAlerts: budgetAlerts || [],
    pendingCount,
    pendingTotal,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    // New data for insights
    unusualSpending,
    recurringExpensesMonthly,
    subscriptionCount,
  }

  return (
    <DashboardShell user={user} profile={profile} notificationData={notificationData}>
      {children}
    </DashboardShell>
  )
}
