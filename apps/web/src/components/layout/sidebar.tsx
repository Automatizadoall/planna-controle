'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@mentoria/database'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  CreditCard,
  Settings,
  Repeat,
  BarChart3,
  Tags,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  user: User
  profile: Profile | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Contas', href: '/accounts', icon: CreditCard },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Recorrentes', href: '/recurring', icon: Repeat },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
]

const secondaryNavigation = [{ name: 'Configurações', href: '/settings', icon: Settings }]

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, toggle } = useSidebar()
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<string>>(new Set())

  // Prefetch on hover for instant navigation
  const handleMouseEnter = useCallback((href: string) => {
    if (!prefetchedRoutes.has(href)) {
      router.prefetch(href)
      setPrefetchedRoutes(prev => new Set(prev).add(href))
    }
  }, [router, prefetchedRoutes])

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out z-50',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        )}
      >
        <div className="flex flex-col flex-grow border-r border-border bg-card overflow-hidden">
          {/* Logo */}
          <div className={cn(
            'flex items-center flex-shrink-0 h-16 border-b border-border',
            isCollapsed ? 'justify-center px-2' : 'px-4'
          )}>
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Poupefy"
                width={40}
                height={40}
                className="drop-shadow-md rounded-lg"
              />
              {!isCollapsed && (
                <span className="text-lg font-bold text-foreground whitespace-nowrap">
                  Poupefy
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  className={cn(
                    'group flex items-center rounded-lg transition-all duration-200',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="px-2 py-2 border-t border-border">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  className={cn(
                    'group flex items-center rounded-lg transition-all duration-200',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </div>

          {/* User Info */}
          <div className={cn(
            'flex-shrink-0 border-t border-border p-3',
            isCollapsed && 'flex justify-center'
          )}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover cursor-default"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold cursor-default">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className={cn(
                'w-full transition-all duration-200',
                isCollapsed ? 'justify-center px-2' : 'justify-between'
              )}
            >
              {!isCollapsed && (
                <span className="text-xs text-muted-foreground">Recolher menu</span>
              )}
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
