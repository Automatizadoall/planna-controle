'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  createAccountSchema,
  accountTypeLabels,
  accountTypeIcons,
  type AccountType,
} from '@/lib/validations/account'
import { createAccount } from './actions'
import { Plus, Loader2 } from 'lucide-react'

export function CreateAccountDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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
      balance: parseFloat(formData.get('balance') as string) || 0,
      currency: 'BRL',
    }

    // Validate
    const result = createAccountSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await createAccount(data)
      if (response.error) {
        setErrors({ general: response.error })
        setIsLoading(false)
        return
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Adicione uma conta financeira para começar a rastrear seu dinheiro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errors.general}</div>
          )}

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Nubank, Itaú Corrente"
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conta</Label>
            <Select name="type" defaultValue="checking" disabled={isLoading}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
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
            {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Inicial (R$)</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              defaultValue="0"
              disabled={isLoading}
              className={errors.balance ? 'border-red-500' : ''}
            />
            {errors.balance && <p className="text-xs text-red-500">{errors.balance}</p>}
            <p className="text-xs text-gray-500">
              Informe o saldo atual da conta para começar com o valor correto.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

