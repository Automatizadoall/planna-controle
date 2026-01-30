import { cn } from '@/lib/utils'
import { Button } from './button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode
  emoji?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'h-10 w-10',
      iconContainer: 'h-14 w-14',
      emoji: 'text-3xl',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'py-8 sm:py-12',
      icon: 'h-8 w-8 sm:h-10 sm:w-10',
      iconContainer: 'h-16 w-16 sm:h-20 sm:w-20',
      emoji: 'text-4xl sm:text-5xl',
      title: 'text-base sm:text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-12 sm:py-16',
      icon: 'h-12 w-12',
      iconContainer: 'h-24 w-24',
      emoji: 'text-5xl sm:text-6xl',
      title: 'text-lg sm:text-xl',
      description: 'text-sm sm:text-base',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center animate-fade-in',
        sizes.container,
        className
      )}
    >
      {/* Icon or Emoji */}
      {(Icon || emoji) && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted/50 mb-4',
            'animate-bounce-in',
            sizes.iconContainer
          )}
        >
          {emoji ? (
            <span className={sizes.emoji} role="img" aria-hidden="true">
              {emoji}
            </span>
          ) : Icon && typeof Icon === 'function' ? (
            <Icon className={cn(sizes.icon, 'text-muted-foreground/60')} />
          ) : (
            Icon
          )}
        </div>
      )}

      {/* Title */}
      <h3 className={cn('font-semibold text-foreground mb-1', sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-muted-foreground max-w-[280px] mb-4', sizes.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {action && (
            <Button
              onClick={action.onClick}
              className="min-w-[140px]"
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>{action.label}</a>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="min-w-[140px]"
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
