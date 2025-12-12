'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account } from '@mentoria/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  accountTypeLabels,
  accountTypeIcons,
  type AccountType,
} from '@/lib/validations/account'
import { updateAccount } from './actions'
import { Loader2 } from 'lucide-react'

interface EditAccountDialogProps {
  account: Account
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAccountDialog({ account, open, onOpenChange }: EditAccountDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as AccountType,
    }

    if (!data.name || data.name.length < 2) {
      setErrors({ name: 'Nome deve ter pelo menos 2 caracteres' })
      setIsLoading(false)
      return
    }

    try {
      const response = await updateAccount(account.id, data)
      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao atualizar conta. Tente novamente.' })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Conta</DialogTitle>
          <DialogDescription>
            Altere as informações da conta. O saldo só pode ser alterado através de transações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">{errors.general}</div>
          )}

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Conta</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={account.name}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-type">Tipo de Conta</Label>
            <Select name="type" defaultValue={account.type} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(accountTypeLabels) as AccountType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <span>{accountTypeIcons[type]}</span>
                      <span>{accountTypeLabels[type]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Balance (read-only) */}
          <div className="space-y-2">
            <Label>Saldo Atual</Label>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              R$ {Number(account.balance).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              O saldo só pode ser alterado através de transações.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

