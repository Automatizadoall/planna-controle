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
  Cell,
} from 'recharts'

interface MonthlyData {
  name: string
  income: number
  expenses: number
}

interface IncomeVsExpensesProps {
  data: MonthlyData[]
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.dataKey === 'income' ? 'Receitas' : 'Despesas'}
              </span>
            </div>
            <span className={`text-sm font-semibold ${
              entry.dataKey === 'income' 
                ? 'text-emerald-500' 
                : 'text-red-500'
            }`}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom Legend Component
function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <span className="text-sm text-muted-foreground">Receitas</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-muted-foreground">Despesas</span>
      </div>
    </div>
  )
}

export function IncomeVsExpenses({ data }: IncomeVsExpensesProps) {
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-muted-foreground">Sem dados suficientes</p>
            <p className="text-sm text-muted-foreground/70">O gráfico aparecerá conforme você adicionar transações</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find max value for better Y axis
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2 sm:px-6">
        <div className="h-[220px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
              barCategoryGap="15%"
            >
              <defs>
                {/* Income Gradient */}
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
                {/* Expenses Gradient */}
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                vertical={false}
              />
              
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => 
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                }
                width={40}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ 
                  fill: 'hsl(var(--muted))',
                  opacity: 0.3,
                  radius: 8,
                }}
              />
              
              <Bar 
                dataKey="income" 
                fill="url(#incomeGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`income-${index}`}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Bar>
              
              <Bar 
                dataKey="expenses" 
                fill="url(#expensesGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`expense-${index}`}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  )
}
