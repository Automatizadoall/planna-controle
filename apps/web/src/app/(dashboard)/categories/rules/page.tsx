import { createClient } from '@/lib/supabase/server'
import { RulesList } from './rules-list'
import { CreateRuleDialog } from './create-rule-dialog'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function RulesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all rules (system + user)
  const { data: rules } = await supabase
    .from('categorization_rules')
    .select(
      `
      *,
      category:categories(id, name, icon, color, type)
    `
    )
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('priority', { ascending: false })

  // Get categories for creating new rules
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order('type')
    .order('name')

  const userRules = rules?.filter((r) => r.user_id !== null) || []
  const systemRules = rules?.filter((r) => r.user_id === null) || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">Categorias</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Regras de Categorização</h1>
            <p className="text-muted-foreground">
              Gerencie regras automáticas para categorizar suas transações
            </p>
          </div>
          <CreateRuleDialog categories={categories || []} />
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <h3 className="font-medium text-foreground mb-2">💡 Como funciona?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Ao criar uma transação, a descrição é comparada com os padrões cadastrados</li>
          <li>• Suas regras têm prioridade sobre as regras do sistema</li>
          <li>• Quando você corrige uma categoria, uma nova regra é criada automaticamente</li>
          <li>• Use palavras-chave separadas por <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-xs">|</code> para múltiplos padrões</li>
        </ul>
      </div>

      {/* Rules */}
      <RulesList userRules={userRules} systemRules={systemRules} categories={categories || []} />
    </div>
  )
}

