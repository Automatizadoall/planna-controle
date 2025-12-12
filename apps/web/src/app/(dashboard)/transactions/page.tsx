import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TransactionsList } from './transactions-list'
import { CreateTransactionDialog } from './create-transaction-dialog'
import { ImportCSVDialog } from './import-csv-dialog'
import { TransactionFilters } from './transaction-filters'
import { PendingTransactions } from './pending-transactions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Read filter params from URL
  const params = await searchParams
  const typeFilter = typeof params.type === 'string' ? params.type : undefined
  const accountFilter = typeof params.account === 'string' ? params.account : undefined
  const categoryFilter = typeof params.category === 'string' ? params.category : undefined

  // Get pending transactions first (always shown, regardless of filters)
  const { data: pendingTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('date', { ascending: true })

  // Build query with filters for confirmed transactions
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'confirmed') // Only show confirmed in main list

  // Apply type filter
  if (typeFilter && typeFilter !== 'all') {
    query = query.eq('type', typeFilter)
  }

  // Apply account filter
  if (accountFilter && accountFilter !== 'all') {
    query = query.eq('account_id', accountFilter)
  }

  // Apply category filter
  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('category_id', categoryFilter)
  }

  // Get transactions (paginated, recent first)
  const { data: rawTransactions } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Get all accounts for lookup
  const { data: allAccounts } = await supabase
    .from('accounts')
    .select('id, name, type')
    .eq('user_id', user.id)

  // Get all categories for lookup
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, icon, color')
    .or(`user_id.eq.${user.id},is_system.eq.true`)

  // Map transactions with their relations
  const accountsMap = new Map((allAccounts || []).map(a => [a.id, a]))
  const categoriesMap = new Map((allCategories || []).map(c => [c.id, c]))

  const transactionsWithToAccount = (rawTransactions || []).map(t => ({
    ...t,
    account: t.account_id ? accountsMap.get(t.account_id) || null : null,
    category: t.category_id ? categoriesMap.get(t.category_id) || null : null,
    to_account: t.to_account_id ? accountsMap.get(t.to_account_id) || null : null,
  }))

  // Map pending transactions with relations
  const pendingWithRelations = (pendingTransactions || []).map(t => ({
    ...t,
    account: t.account_id ? accountsMap.get(t.account_id) || null : null,
    category: t.category_id ? categoriesMap.get(t.category_id) || null : null,
  }))

  // Get accounts for filter and form
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  // Get categories for filter and form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order('name')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transações</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie suas receitas, despesas e transferências</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportCSVDialog accounts={accounts || []} categories={categories || []} />
          <CreateTransactionDialog accounts={accounts || []} categories={categories || []} />
        </div>
      </div>

      {/* Pending Transactions Alert */}
      {pendingWithRelations.length > 0 && (
        <PendingTransactions transactions={pendingWithRelations} />
      )}

      {/* Filters */}
      <Suspense fallback={<div className="h-10" />}>
        <TransactionFilters accounts={accounts || []} categories={categories || []} />
      </Suspense>

      {/* Transactions List (only confirmed) */}
      <TransactionsList
        transactions={transactionsWithToAccount}
        accounts={accounts || []}
        categories={categories || []}
      />
    </div>
  )
}

