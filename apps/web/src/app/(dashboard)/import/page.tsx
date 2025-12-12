import { createClient } from '@/lib/supabase/server'
import { ImportWizard } from './import-wizard'

export default async function ImportPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get accounts for selection
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  // Get categories for auto-categorization
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order('name')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Transações</h1>
        <p className="text-gray-500">
          Importe transações de extratos bancários em formato CSV
        </p>
      </div>

      {/* Import Wizard */}
      <ImportWizard accounts={accounts || []} categories={categories || []} />
    </div>
  )
}

