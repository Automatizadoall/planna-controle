'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { id: 'light', name: 'Claro', icon: Sun, description: 'Tema claro' },
  { id: 'dark', name: 'Escuro', icon: Moon, description: 'Tema escuro' },
  { id: 'system', name: 'Sistema', icon: Monitor, description: 'Seguir sistema' },
]

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Label>Tema</Label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <div
              key={t.id}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-muted/50 animate-pulse"
            >
              <div className="h-6 w-6 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label>Tema</Label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const Icon = t.icon
          const isActive = theme === t.id

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-accent'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                {t.name}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Escolha como o app deve aparecer. Selecione &quot;Sistema&quot; para usar a preferência do seu dispositivo.
      </p>
    </div>
  )
}


