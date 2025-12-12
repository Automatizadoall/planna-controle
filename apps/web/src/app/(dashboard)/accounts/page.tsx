import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { AccountsList } from './accounts-list'
import { CreateAccountDialog } from './create-account-dialog'

export default async function AccountsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all accounts (active and archived)
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const activeAccounts = accounts?.filter((a) => !a.is_archived) || []
  const archivedAccounts = accounts?.filter((a) => a.is_archived) || []
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas financeiras</p>
        </div>
        <CreateAccountDialog />
      </div>

      {/* Total Balance Card */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <p className="text-sm text-emerald-100">Patrimônio Total</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <p className="text-sm text-emerald-100 mt-2">
          {activeAccounts.length} conta{activeAccounts.length !== 1 ? 's' : ''} ativa
          {activeAccounts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Accounts List */}
      <AccountsList accounts={activeAccounts} archivedAccounts={archivedAccounts} />
    </div>
  )
}

