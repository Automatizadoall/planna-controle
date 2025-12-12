'use client'

import { ReactNode } from 'react'
import { CarouselSyncProvider } from '@/components/carousel-sync-context'

interface CarouselSectionProps {
  children: ReactNode
}

export function CarouselSection({ children }: CarouselSectionProps) {
  return (
    <CarouselSyncProvider>
      <div className="grid gap-6 lg:grid-cols-3">
        {children}
      </div>
    </CarouselSyncProvider>
  )
}


