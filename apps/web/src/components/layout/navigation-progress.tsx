'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset on route change complete
  useEffect(() => {
    setIsNavigating(false)
    setProgress(0)
  }, [pathname, searchParams])

  // Listen for navigation start
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
      setProgress(20)
    }

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link?.href && !link.href.startsWith('#') && !link.target) {
        const url = new URL(link.href)
        // Only trigger for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          handleStart()
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        // Slow down as we get closer to 100
        const increment = Math.max(1, (90 - prev) / 10)
        return Math.min(90, prev + increment)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isNavigating])

  // Complete animation
  useEffect(() => {
    if (!isNavigating && progress > 0) {
      setProgress(100)
      const timeout = setTimeout(() => setProgress(0), 200)
      return () => clearTimeout(timeout)
    }
  }, [isNavigating, progress])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
      <div
        className={cn(
          'h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500',
          'shadow-lg shadow-emerald-500/50',
          'transition-all duration-200 ease-out'
        )}
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
