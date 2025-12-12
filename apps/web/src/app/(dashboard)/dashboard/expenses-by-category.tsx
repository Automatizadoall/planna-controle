'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { CategoryIcon } from '@/lib/category-icons'
import { TrendingDown } from 'lucide-react'

interface CategoryData {
  name: string
  color: string
  icon: string
  total: number
}

interface ExpensesByCategoryProps {
  data: CategoryData[]
  total: number
}

// Paleta de cores vibrantes para fallback
const VIBRANT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
]

// Custom active shape (hover effect)
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  )
}


export function ExpensesByCategory({ data, total }: ExpensesByCategoryProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  if (data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <TrendingDown className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhuma despesa este mês</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Suas despesas aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, idx) => ({
    name: item.name,
    value: item.total,
    color: item.color || VIBRANT_COLORS[idx % VIBRANT_COLORS.length],
    icon: item.icon,
    percent: item.total / total,
  }))

  const activeData = activeIndex !== undefined ? chartData[activeIndex] : null

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Chart */}
          <div className="relative h-[200px] w-full lg:w-[45%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient 
                      key={`gradient-${index}`} 
                      id={`pieGradient-${index}`} 
                      x1="0" y1="0" x2="1" y2="1"
                    >
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`}
                      style={{ 
                        opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.4,
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label - dynamic based on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeData ? (
                <>
                  <div 
                    className="p-2 rounded-full mb-1 transition-all duration-200"
                    style={{ backgroundColor: `${activeData.color}15` }}
                  >
                    <div style={{ color: activeData.color }}>
                      <CategoryIcon 
                        icon={activeData.icon} 
                        className="h-5 w-5" 
                      />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(activeData.value)}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(activeData.percent * 100)}%</p>
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(total)}</p>
                </>
              )}
            </div>
          </div>

          {/* Legend with progress bars */}
          <div className="w-full lg:w-[55%] space-y-1.5">
            {chartData.map((item, idx) => {
              const percentage = Math.round(item.percent * 100)
              const isActive = activeIndex === idx
              
              return (
                <div 
                  key={item.name}
                  className={`group p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive ? 'bg-accent/80 scale-[1.02]' : 'hover:bg-accent/40'
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1 rounded-md transition-all duration-200"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div style={{ color: item.color }}>
                          <CategoryIcon 
                            icon={item.icon} 
                            className="h-3.5 w-3.5" 
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                        boxShadow: isActive ? `0 0 8px ${item.color}60` : 'none'
                      }}
                    />
                  </div>
                  <div className="flex justify-end mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{percentage}%</span>
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

