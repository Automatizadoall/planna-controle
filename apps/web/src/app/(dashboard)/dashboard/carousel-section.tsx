'use client'

import { ReactNode } from 'react'
import { CarouselSyncProvider } from '@/components/carousel-sync-context'

interface CarouselSectionProps {
  children: ReactNode
}

export function CarouselSection({ children }: CarouselSectionProps) {
  return (
    <CarouselSyncProvider>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </CarouselSyncProvider>
  )
}


