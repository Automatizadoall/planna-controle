'use client'

import { forwardRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  /** Prefetch on mount (default: true for visible links) */
  prefetch?: boolean
  /** Additional prefetch on hover */
  prefetchOnHover?: boolean
  /** Show loading state */
  showLoading?: boolean
  /** Active class */
  activeClassName?: string
  /** Whether currently active */
  isActive?: boolean
}

/**
 * Enhanced Link component with:
 * - Prefetch on hover for instant navigation
 * - View transition support (when available)
 * - Loading feedback
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      href,
      children,
      className,
      prefetch = true,
      prefetchOnHover = true,
      showLoading = false,
      activeClassName,
      isActive,
      onMouseEnter,
      onClick,
      ...props
    },
    ref
  ) => {
    const router = useRouter()
    const [isPrefetched, setIsPrefetched] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)

    // Prefetch on hover for instant navigation
    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (prefetchOnHover && !isPrefetched && typeof href === 'string') {
          router.prefetch(href)
          setIsPrefetched(true)
        }
        onMouseEnter?.(e)
      },
      [prefetchOnHover, isPrefetched, href, router, onMouseEnter]
    )

    // Use View Transitions API if available
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e)
        
        if (e.defaultPrevented) return

        // Check for View Transitions API support
        if (typeof document !== 'undefined' && 'startViewTransition' in document) {
          e.preventDefault()
          setIsNavigating(true)
          
          // @ts-ignore - View Transitions API
          document.startViewTransition(() => {
            router.push(typeof href === 'string' ? href : href.pathname || '/')
          })
        } else {
          setIsNavigating(true)
        }
      },
      [onClick, href, router]
    )

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className={cn(
          className,
          isActive && activeClassName,
          isNavigating && showLoading && 'opacity-70'
        )}
        {...props}
      >
        {children}
      </Link>
    )
  }
)

NavLink.displayName = 'NavLink'
