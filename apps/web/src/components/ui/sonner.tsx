'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-950/50',
          error: 'group-[.toaster]:border-red-500/50 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/50',
          warning: 'group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/50',
          info: 'group-[.toaster]:border-blue-500/50 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/50',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
