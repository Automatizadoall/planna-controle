import { 
  DashboardSummarySkeleton, 
  ChartSkeleton, 
  TransactionsSkeleton,
  CarouselCardSkeleton 
} from './loading-skeletons'

/**
 * Loading state para a página do dashboard
 * Renderizado automaticamente pelo Next.js durante carregamento
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <div className="h-7 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-64 bg-muted/50 animate-pulse rounded mt-1" />
      </div>

      {/* Summary Cards */}
      <DashboardSummarySkeleton />

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartSkeleton height="h-[300px]" />
        <ChartSkeleton height="h-[280px]" />
      </div>

      {/* Carousel Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <CarouselCardSkeleton />
        <CarouselCardSkeleton />
        <CarouselCardSkeleton />
      </div>

      {/* Recent Transactions */}
      <TransactionsSkeleton count={5} />
    </div>
  )
}
