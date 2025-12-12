'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'

interface MonthlyComparisonProps {
  userId: string
  year: number
}

interface MonthData {
  month: string
  income: number
  expenses: number
  balance: number
}

export function MonthlyComparison({ userId, year }: MonthlyComparisonProps) {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)

      // Group by month
      const monthlyData: Record<number, { income: number; expenses: number }> = {}
      
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { income: 0, expenses: 0 }
      }

      transactions?.forEach((t) => {
        const month = new Date(t.date).getMonth()
        if (t.type === 'income') {
          monthlyData[month].income += Number(t.amount)
        } else if (t.type === 'expense') {
          monthlyData[month].expenses += Number(t.amount)
        }
      })

      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      
      const chartData = months.map((month, index) => ({
        month,
        income: monthlyData[index].income,
        expenses: monthlyData[index].expenses,
        balance: monthlyData[index].income - monthlyData[index].expenses,
      }))

      setData(chartData)
      setLoading(false)
    }

    fetchData()
  }, [userId, year])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo Mensal - {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativo Mensal - {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Receitas' : name === 'expenses' ? 'Despesas' : 'Saldo',
                ]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: 'var(--foreground)',
                }}
              />
              <Legend
                formatter={(value) =>
                  value === 'income' ? 'Receitas' : value === 'expenses' ? 'Despesas' : 'Saldo'
                }
                iconType="circle"
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Mês</th>
                <th className="text-right py-2 font-medium text-emerald-600 dark:text-emerald-400">Receitas</th>
                <th className="text-right py-2 font-medium text-red-600 dark:text-red-400">Despesas</th>
                <th className="text-right py-2 font-medium text-foreground">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium text-foreground">{row.month}</td>
                  <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(row.income)}</td>
                  <td className="py-2 text-right text-red-600 dark:text-red-400">{formatCurrency(row.expenses)}</td>
                  <td className={`py-2 text-right font-medium ${row.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-muted/50 font-semibold">
                <td className="py-2 text-foreground">Total</td>
                <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
                </td>
                <td className="py-2 text-right text-red-600 dark:text-red-400">
                  {formatCurrency(data.reduce((sum, d) => sum + d.expenses, 0))}
                </td>
                <td className={`py-2 text-right ${
                  data.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(data.reduce((sum, d) => sum + d.balance, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

