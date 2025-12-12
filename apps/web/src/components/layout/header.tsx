'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@mentoria/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationsDropdown } from './notifications-dropdown'
import { LogOut, Plus } from 'lucide-react'
import type { NotificationData } from './dashboard-shell'

interface HeaderProps {
  user: User
  profile: Profile | null
  notificationData: NotificationData
}

export function Header({ user, profile, notificationData }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 hidden lg:block bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Spacer for layout */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Add Transaction Button */}
          <Button size="sm" className="shadow-lg shadow-primary/20" asChild>
            <Link href="/transactions">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Link>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <NotificationsDropdown {...notificationData} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

