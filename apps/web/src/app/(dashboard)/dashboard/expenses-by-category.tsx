'use client'

import { useState, useCallback } from 'react'
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

// Custom active shape (hover/touch effect)
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={innerRadius}
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

  // Toggle para suporte touch (mobile)
  const handleItemClick = useCallback((idx: number) => {
    setActiveIndex(prev => prev === idx ? undefined : idx)
  }, [])

  if (data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 sm:mb-4">
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">Nenhuma despesa este mês</p>
            <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">Suas despesas aparecerão aqui</p>
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
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-red-500/10">
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          </div>
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6">
        <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4">
          {/* Chart */}
          <div className="relative h-[160px] sm:h-[200px] w-full md:w-[45%] flex-shrink-0">
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
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  onClick={(_, index) => handleItemClick(index)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`}
                      className="cursor-pointer"
                      style={{ 
                        opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.4,
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label - dynamic based on hover/touch */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeData ? (
                <>
                  <div 
                    className="p-1.5 sm:p-2 rounded-full mb-0.5 sm:mb-1 transition-all duration-200"
                    style={{ backgroundColor: `${activeData.color}15` }}
                  >
                    <div style={{ color: activeData.color }}>
                      <CategoryIcon 
                        icon={activeData.icon} 
                        className="h-4 w-4 sm:h-5 sm:w-5" 
                      />
                    </div>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{formatCurrency(activeData.value)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{Math.round(activeData.percent * 100)}%</p>
                </>
              ) : (
                <>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</p>
                  <p className="text-base sm:text-xl font-bold text-foreground">{formatCurrency(total)}</p>
                </>
              )}
            </div>
          </div>

          {/* Legend with progress bars */}
          <div className="w-full md:w-[55%] space-y-1 sm:space-y-1.5 max-h-[200px] sm:max-h-[250px] overflow-y-auto scrollbar-thin">
            {chartData.map((item, idx) => {
              const percentage = Math.round(item.percent * 100)
              const isActive = activeIndex === idx
              
              return (
                <div 
                  key={item.name}
                  className={`group p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation ${
                    isActive ? 'bg-accent/80 scale-[1.01] sm:scale-[1.02]' : 'hover:bg-accent/40 active:bg-accent/60'
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  onClick={() => handleItemClick(idx)}
                >
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <div 
                        className="p-0.5 sm:p-1 rounded-md transition-all duration-200 flex-shrink-0"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div style={{ color: item.color }}>
                          <CategoryIcon 
                            icon={item.icon} 
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5" 
                          />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 sm:h-1.5 bg-muted/50 rounded-full overflow-hidden">
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
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">{percentage}%</span>
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

