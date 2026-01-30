'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatOptions?: Intl.NumberFormatOptions
  prefix?: string
  suffix?: string
  className?: string
  delay?: number
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatOptions = {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  prefix = '',
  suffix = '',
  className,
  delay = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  const formatter = new Intl.NumberFormat('pt-BR', formatOptions)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const change = endValue - startValue

    if (change === 0) {
      setDisplayValue(value)
      return
    }

    const startAnimation = () => {
      setIsAnimating(true)
      startTimeRef.current = undefined

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp
        }

        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3)

        const currentValue = startValue + change * easeOut
        setDisplayValue(currentValue)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setDisplayValue(endValue)
          previousValue.current = endValue
          setIsAnimating(false)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Apply delay if specified
    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, delay])

  const formattedValue = formatOptions.style === 'currency'
    ? formatter.format(displayValue)
    : formatter.format(displayValue)

  return (
    <span
      className={cn(
        'tabular-nums transition-colors',
        isAnimating && 'text-foreground',
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// Simpler version for percentages
interface AnimatedPercentageProps {
  value: number
  duration?: number
  className?: string
  showSign?: boolean
}

export function AnimatedPercentage({
  value,
  duration = 800,
  className,
  showSign = true,
}: AnimatedPercentageProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const change = endValue - startValue

    if (Math.abs(change) < 0.01) {
      setDisplayValue(value)
      return
    }

    startTimeRef.current = undefined

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + change * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  const sign = showSign && displayValue > 0 ? '+' : ''
  const formattedValue = `${sign}${displayValue.toFixed(1)}%`

  return (
    <span className={cn('tabular-nums', className)}>
      {formattedValue}
    </span>
  )
}
