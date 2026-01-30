import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading skeleton para os cards de resumo do dashboard
 */
export function DashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-2.5 sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-2 w-12 mt-2" />
              </div>
              <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Loading skeleton para gráficos
 */
export function ChartSkeleton({ height = 'h-[200px]', title }: { height?: string; title?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 px-3 sm:px-6">
        {title ? (
          <Skeleton className="h-6 w-48" />
        ) : (
          <Skeleton className="h-6 w-48" />
        )}
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Skeleton className={`${height} w-full rounded-lg`} />
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton para lista de transações
 */
export function TransactionsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-2 sm:p-3"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton para cards do carousel (alerts, goals, recurring)
 */
export function CarouselCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-1.5 w-1.5 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
