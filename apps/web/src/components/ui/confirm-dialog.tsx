'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConfirmVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: ConfirmVariant
  loading?: boolean
  children?: React.ReactNode
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-500/20',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    buttonVariant: 'default' as const,
  },
  info: {
    icon: XCircle,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20',
    buttonVariant: 'default' as const,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full mb-4',
              config.iconBg
            )}
          >
            <Icon className={cn('h-6 w-6', config.iconColor)} />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className="w-full sm:w-auto"
          >
            {isLoading || loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Aguarde...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar o confirm dialog de forma simples
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description?: string
    variant?: ConfirmVariant
    onConfirm: () => void | Promise<void>
  }>({
    open: false,
    title: '',
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    description?: string
    variant?: ConfirmVariant
    onConfirm: () => void | Promise<void>
  }) => {
    setState({
      open: true,
      ...options,
    })
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      variant={state.variant}
      onConfirm={state.onConfirm}
      confirmLabel={state.variant === 'danger' ? 'Excluir' : 'Confirmar'}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
