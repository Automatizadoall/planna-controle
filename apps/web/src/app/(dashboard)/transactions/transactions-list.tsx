'use client'

import { useState } from 'react'
import type { Account, Category, Transaction } from '@mentoria/database'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowLeftRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { deleteTransaction } from './actions'
import { useRouter } from 'next/navigation'
import { CategoryIcon } from '@/lib/category-icons';

interface TransactionWithRelations extends Transaction {
  account: Account | null
  category: Category | null
  to_account: Account | null
}

interface TransactionsListProps {
  transactions: TransactionWithRelations[]
  accounts: Account[]
  categories: Category[]
}

export function TransactionsList({ transactions, accounts, categories }: TransactionsListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(null)

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">💸</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma transação encontrada</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Adicione sua primeira transação para começar a acompanhar suas finanças.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, TransactionWithRelations[]>
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date}>
          {/* Date Header */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {formatRelativeDate(date)}
          </h3>

          {/* Transactions for this date */}
          <div className="space-y-2">
            {dayTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={() => setEditingTransaction(transaction)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Edit Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          accounts={accounts}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </div>
  )
}

interface TransactionCardProps {
  transaction: TransactionWithRelations
  onEdit: () => void
}

function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    setIsDeleting(true)
    await deleteTransaction(transaction.id)
    router.refresh()
  }

  const TypeIcon =
    transaction.type === 'income'
      ? TrendingUp
      : transaction.type === 'expense'
        ? TrendingDown
        : ArrowLeftRight

  const typeColorClass =
    transaction.type === 'income'
      ? 'bg-green-100 dark:bg-green-900/30 text-income'
      : transaction.type === 'expense'
        ? 'bg-red-100 dark:bg-red-900/30 text-expense'
        : 'bg-blue-100 dark:bg-blue-900/30 text-transfer'

  const amountColorClass =
    transaction.type === 'income'
      ? 'text-income'
      : transaction.type === 'expense'
        ? 'text-expense'
        : 'text-transfer'

  return (
    <Card className={cn('transition-all hover:shadow-md', isDeleting && 'opacity-50')}>
      <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Icon */}
          <div className={cn('flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0', typeColorClass)}>
            {transaction.category?.icon ? (
              <CategoryIcon icon={transaction.category.icon} className="text-base sm:text-lg" />
            ) : (
              <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium text-foreground truncate">
              {transaction.description || transaction.category?.name || 'Sem descrição'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {transaction.category?.name && (
                <span>{transaction.category.name} • </span>
              )}
              {transaction.account?.name}
              {transaction.type === 'transfer' && transaction.to_account && (
                <span> → {transaction.to_account.name}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Amount */}
          <span className={cn('text-sm sm:text-base font-semibold whitespace-nowrap', amountColorClass)}>
            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
            {formatCurrency(Number(transaction.amount))}
          </span>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 sm:p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground touch-manipulation"
              disabled={isDeleting}
            >
              <MoreHorizontal className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 z-20 mt-1 w-28 sm:w-32 rounded-lg border bg-card shadow-lg py-1">
                  <button
                    onClick={() => {
                      onEdit()
                      setShowActions(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-foreground hover:bg-accent active:bg-accent/80"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowActions(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

