'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/lib/category-icons'

interface CategoryData {
  id: string
  name: string
  icon: string
  color: string
  total: number
  count: number
}

interface CategoryBreakdownProps {
  title: string
  data: CategoryData[]
  total: number
  type: 'income' | 'expense'
}

export function CategoryBreakdown({ title, data, total, type }: CategoryBreakdownProps) {
  const sortedData = [...data].sort((a, b) => b.total - a.total)

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">{type === 'expense' ? '💸' : '💰'}</div>
            <p className="text-muted-foreground">Nenhuma transação no período</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = sortedData.map((item) => ({
    name: item.name,
    value: item.total,
    color: item.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgb(0 0 0 / 0.25)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{
                    color: 'hsl(var(--popover-foreground))',
                    fontWeight: 500,
                  }}
                  labelStyle={{
                    color: 'hsl(var(--popover-foreground))',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {sortedData.map((item) => {
              const percentage = calculatePercentage(item.total, total)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <CategoryIcon icon={item.icon} className="h-5 w-5 text-foreground" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({item.count})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-semibold',
                      type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    )}>
                      {formatCurrency(item.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

