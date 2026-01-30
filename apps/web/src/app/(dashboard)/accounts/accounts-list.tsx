'use client'

import { useState } from 'react'
import type { Account } from '@mentoria/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { accountTypeLabels, accountTypeIcons } from '@/lib/validations/account'
import { ChevronDown, ChevronUp, Archive, MoreHorizontal, Pencil, RotateCcw, Star } from 'lucide-react'
import { EditAccountDialog } from './edit-account-dialog'
import { archiveAccount, unarchiveAccount, setDefaultAccount } from './actions'

interface AccountsListProps {
  accounts: Account[]
  archivedAccounts: Account[]
}

export function AccountsList({ accounts, archivedAccounts }: AccountsListProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  if (accounts.length === 0 && archivedAccounts.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie sua primeira conta para começar a rastrear suas finanças.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Accounts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={() => setEditingAccount(account)}
            onArchive={() => archiveAccount(account.id)}
            onSetDefault={() => setDefaultAccount(account.id)}
          />
        ))}
      </div>

      {/* Archived Accounts */}
      {archivedAccounts.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {showArchived ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {archivedAccounts.length} conta{archivedAccounts.length !== 1 ? 's' : ''} arquivada
            {archivedAccounts.length !== 1 ? 's' : ''}
          </button>

          {showArchived && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {archivedAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  isArchived
                  onUnarchive={() => unarchiveAccount(account.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
        />
      )}
    </div>
  )
}

interface AccountCardProps {
  account: Account
  isArchived?: boolean
  onEdit?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onSetDefault?: () => void
}

function AccountCard({ account, isArchived, onEdit, onArchive, onUnarchive, onSetDefault }: AccountCardProps) {
  const [showActions, setShowActions] = useState(false)
  const icon = accountTypeIcons[account.type as keyof typeof accountTypeIcons]
  const typeLabel = accountTypeLabels[account.type as keyof typeof accountTypeLabels]

  return (
    <Card className={`${isArchived ? 'opacity-60' : ''} ${account.is_default ? 'ring-2 ring-emerald-500/50' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-lg sm:text-xl flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <CardTitle className="text-sm sm:text-base font-semibold truncate">{account.name}</CardTitle>
              {account.is_default && (
                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                  <span className="hidden sm:inline">Padrão</span>
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{typeLabel}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 sm:p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground touch-manipulation"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 sm:w-44 rounded-lg border bg-card shadow-lg py-1">
                {!isArchived ? (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.()
                        setShowActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-foreground hover:bg-accent active:bg-accent/80"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    {!account.is_default && (
                      <button
                        onClick={() => {
                          onSetDefault?.()
                          setShowActions(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-foreground hover:bg-accent active:bg-accent/80"
                      >
                        <Star className="h-4 w-4" />
                        Definir padrão
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onArchive?.()
                        setShowActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-foreground hover:bg-accent active:bg-accent/80"
                    >
                      <Archive className="h-4 w-4" />
                      Arquivar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onUnarchive?.()
                      setShowActions(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-foreground hover:bg-accent active:bg-accent/80"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <p
          className={`text-xl sm:text-2xl font-bold ${
            Number(account.balance) >= 0 ? 'text-foreground' : 'text-expense'
          }`}
        >
          {formatCurrency(Number(account.balance))}
        </p>
        {isArchived && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Archive className="h-3 w-3" />
            Arquivada
          </p>
        )}
      </CardContent>
    </Card>
  )
}

