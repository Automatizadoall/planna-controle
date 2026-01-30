'use client'

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

interface DailyData {
  date: string
  income: number
  expenses: number
}

interface TrendChartProps {
  data: DailyData[]
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Evolução no Período</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📈</div>
            <p className="text-sm text-muted-foreground">Sem dados para exibir</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Agrupar por semana se tiver muitos dados (mais de 14 dias)
  const shouldGroup = data.length > 14
  
  let chartData
  if (shouldGroup) {
    // Agrupar por semana
    const weeklyData: { [key: string]: { income: number; expenses: number; count: number } } = {}
    data.forEach((item) => {
      const date = new Date(item.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { income: 0, expenses: 0, count: 0 }
      }
      weeklyData[weekKey].income += item.income
      weeklyData[weekKey].expenses += item.expenses
      weeklyData[weekKey].count++
    })
    
    chartData = Object.entries(weeklyData).map(([date, values]) => ({
      displayDate: `Sem ${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`,
      income: values.income,
      expenses: values.expenses,
    }))
  } else {
    chartData = data.map((item) => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }))
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Evolução no Período</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                className="text-muted-foreground fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value) => 
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                }
                className="text-muted-foreground fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Receitas' : 'Despesas',
                ]}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: 'var(--foreground)',
                  fontSize: '12px',
                }}
              />
              <Legend
                formatter={(value) => value === 'income' ? 'Receitas' : 'Despesas'}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar
                dataKey="expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

