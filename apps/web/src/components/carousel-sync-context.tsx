'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface CarouselSyncContextType {
  tick: number
}

const CarouselSyncContext = createContext<CarouselSyncContextType>({ tick: 0 })

export function CarouselSyncProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 4000) // Sync every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <CarouselSyncContext.Provider value={{ tick }}>
      {children}
    </CarouselSyncContext.Provider>
  )
}

export function useCarouselSync() {
  return useContext(CarouselSyncContext)
}


