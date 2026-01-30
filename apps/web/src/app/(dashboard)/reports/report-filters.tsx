'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

// Format YYYY-MM-DD to DD/MM/YYYY without timezone conversion issues
function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

interface ReportFiltersProps {
  currentPeriod: string
  startDate: string
  endDate: string
}

const periods = [
  { id: 'week', label: 'Última Semana' },
  { id: 'month', label: 'Este Mês' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Este Ano' },
  { id: 'custom', label: 'Personalizado' },
]

export function ReportFilters({ currentPeriod, startDate, endDate }: ReportFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    if (period !== 'custom') {
      params.delete('startDate')
      params.delete('endDate')
    }
    router.push(`/reports?${params.toString()}`)
  }

  const handleCustomDateChange = (type: 'startDate' | 'endDate', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', 'custom')
    params.set(type, value)
    router.push(`/reports?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Period Buttons */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={currentPeriod === period.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange(period.id)}
                className={cn(
                  'h-8 px-2 sm:px-3 text-xs sm:text-sm',
                  currentPeriod === period.id 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'border border-border hover:bg-accent text-foreground'
                )}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range + Current Period Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Custom Date Range */}
            {currentPeriod === 'custom' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">De:</Label>
                  <DatePicker
                    value={startDate}
                    onChange={(value) => handleCustomDateChange('startDate', value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Até:</Label>
                  <DatePicker
                    value={endDate}
                    onChange={(value) => handleCustomDateChange('endDate', value)}
                    className="w-auto"
                  />
                </div>
              </div>
            )}

            {/* Current Period Display */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

