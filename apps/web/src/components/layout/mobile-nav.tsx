'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Settings,
} from 'lucide-react'

const mobileNavItems = [
  { name: 'Início', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Config', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Prefetch all mobile nav routes on mount for instant navigation
  useEffect(() => {
    mobileNavItems.forEach(item => {
      router.prefetch(item.href)
    })
  }, [router])

  // Reset navigation state when pathname changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  // Handle navigation with optimistic UI feedback
  const handleClick = useCallback((href: string, e: React.MouseEvent) => {
    if (pathname !== href) {
      setNavigatingTo(href)
    }
  }, [pathname])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1 pb-[env(safe-area-inset-bottom,8px)]">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isNavigating = navigatingTo === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={(e) => handleClick(item.href, e)}
              className={cn(
                'relative flex flex-col items-center justify-center min-w-[56px] py-2 px-1 rounded-xl transition-all duration-200 active:scale-95',
                isActive || isNavigating
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Indicador de ativo */}
              {(isActive || isNavigating) && (
                <span 
                  className={cn(
                    'absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-500 transition-all',
                    isNavigating && 'animate-pulse'
                  )} 
                />
              )}
              
              {/* Ícone com fundo quando ativo */}
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                (isActive || isNavigating) && 'bg-emerald-100 dark:bg-emerald-900/40'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-transform',
                  (isActive || isNavigating) && 'scale-110',
                  isNavigating && 'animate-pulse'
                )} />
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-[10px] mt-0.5 transition-all',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


