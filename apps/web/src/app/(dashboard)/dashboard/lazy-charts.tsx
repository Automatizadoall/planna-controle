'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Loading skeleton para gráficos
function ChartSkeleton({ height = 'h-[200px]' }: { height?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 px-3 sm:px-6">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Skeleton className={`${height} w-full rounded-lg`} />
      </CardContent>
    </Card>
  )
}

// Lazy load ExpensesByCategory (usa PieChart do Recharts)
export const LazyExpensesByCategory = dynamic(
  () => import('./expenses-by-category').then((mod) => ({ default: mod.ExpensesByCategory })),
  {
    loading: () => <ChartSkeleton height="h-[300px]" />,
    ssr: true, // Manter SSR para SEO, mas o JS será carregado depois
  }
)

// Lazy load IncomeVsExpenses (usa BarChart do Recharts)
export const LazyIncomeVsExpenses = dynamic(
  () => import('./income-vs-expenses').then((mod) => ({ default: mod.IncomeVsExpenses })),
  {
    loading: () => <ChartSkeleton height="h-[280px]" />,
    ssr: true,
  }
)
