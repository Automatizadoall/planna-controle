'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Clock, 
  Check, 
  X, 
  Pencil, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { confirmTransaction, confirmAllPendingTransactions, deleteTransaction } from './actions'
import { formatCurrency } from '@/lib/utils'

interface PendingTransaction {
  id: string
  description: string | null
  amount: number
  date: string
  type: 'income' | 'expense' | 'transfer'
  category?: {
    name: string
    icon: string
    color: string
  } | null
  account?: {
    name: string
  } | null
  recurring_id: string | null
}

interface PendingTransactionsProps {
  transactions: PendingTransaction[]
}

export function PendingTransactions({ transactions }: PendingTransactionsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmingAll, setConfirmingAll] = useState(false)
  const [expanded, setExpanded] = useState(true)

  if (transactions.length === 0) {
    return null
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const toggleSelectAll = () => {
    if (selected.size === transactions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(transactions.map(t => t.id)))
    }
  }

  const handleConfirm = async (id: string) => {
    setLoading(id)
    try {
      const result = await confirmTransaction(id)
      if (result.error) {
        console.error(result.error)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação pendente?')) {
      return
    }
    setLoading(id)
    try {
      const result = await deleteTransaction(id)
      if (result.error) {
        console.error(result.error)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleConfirmSelected = async () => {
    if (selected.size === 0) return
    
    setConfirmingAll(true)
    try {
      const result = await confirmAllPendingTransactions(Array.from(selected))
      if (result.error) {
        console.error(result.error)
      } else {
        setSelected(new Set())
      }
    } finally {
      setConfirmingAll(false)
    }
  }

  const totalPending = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount)
  }, 0)

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Transações Pendentes
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  {transactions.length}
                </span>
              </CardTitle>
              <CardDescription>
                Confirme os pagamentos que já foram realizados
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                Impacto no saldo após confirmação:
              </span>
            </div>
            <span className={`font-semibold ${totalPending >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(totalPending)}
            </span>
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selected.size === transactions.length && transactions.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-muted-foreground">
                Selecionar todas ({selected.size} de {transactions.length})
              </span>
            </label>
            
            {selected.size > 0 && (
              <Button
                size="sm"
                onClick={handleConfirmSelected}
                disabled={confirmingAll}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {confirmingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Selecionadas ({selected.size})
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selected.has(transaction.id)
                    ? 'bg-amber-100/50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-900 border-border hover:border-amber-300'
                }`}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={selected.has(transaction.id)}
                  onCheckedChange={() => toggleSelect(transaction.id)}
                />

                {/* Category Icon */}
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ 
                    backgroundColor: transaction.category?.color 
                      ? `${transaction.category.color}20` 
                      : '#f3f4f6'
                  }}
                >
                  {transaction.category?.icon || (transaction.type === 'income' ? '💰' : '💸')}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {transaction.description || 'Sem descrição'}
                    </span>
                    {transaction.recurring_id && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        🔄 Recorrente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{transaction.account?.name || 'Conta'}</span>
                    {transaction.category && (
                      <>
                        <span>•</span>
                        <span>{transaction.category.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className={`font-semibold whitespace-nowrap ${
                  transaction.type === 'income' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                    onClick={() => handleConfirm(transaction.id)}
                    disabled={loading === transaction.id}
                    title="Confirmar"
                  >
                    {loading === transaction.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Editar antes de confirmar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={loading === transaction.id}
                    title="Excluir (não realizada)"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            💡 Transações pendentes são criadas automaticamente de recorrências. 
            Confirme quando o pagamento for realizado.
          </p>
        </CardContent>
      )}
    </Card>
  )
}

