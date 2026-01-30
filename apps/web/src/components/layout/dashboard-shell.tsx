'use client'

import { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@mentoria/database'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileHeader } from './mobile-header'
import { MobileNav } from './mobile-nav'
import { cn } from '@/lib/utils'

export interface UnusualSpending {
  categoryId: string
  categoryName: string
  categoryIcon: string
  current: number
  average: number
  percentAbove: number
}

export interface NotificationData {
  goals: { id: string; name: string; icon?: string; current_amount: number; target_amount: number }[]
  recurring: { id: string; description: string; amount: number; type: 'income' | 'expense'; next_occurrence: string; frequency?: string; category: { icon: string; name?: string } | null }[]
  budgetAlerts: { category_name: string; category_icon: string; spent: number; budget_amount: number; status: string }[]
  pendingCount: number
  pendingTotal: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  // New insight data
  unusualSpending: UnusualSpending[]
  recurringExpensesMonthly: number
  subscriptionCount: number
}

interface DashboardShellProps {
  user: User
  profile: Profile | null
  notificationData: NotificationData
  children: ReactNode
}

function DashboardContent({ user, profile, notificationData, children }: DashboardShellProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop Only */}
      <Sidebar user={user} profile={profile} />

      {/* Main Content Wrapper */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        {/* Mobile Header - Only visible on mobile */}
        <MobileHeader user={user} profile={profile} notificationData={notificationData} />
        
        {/* Desktop Header - Only visible on desktop */}
        <Header user={user} profile={profile} notificationData={notificationData} />

        {/* Page Content */}
        <main className="flex-1 p-3 pb-20 sm:p-4 lg:p-6 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}

export function DashboardShell({ user, profile, notificationData, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardContent user={user} profile={profile} notificationData={notificationData}>
        {children}
      </DashboardContent>
    </SidebarProvider>
  )
}


