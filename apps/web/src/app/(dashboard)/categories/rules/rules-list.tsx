'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category, CategorizationRule } from '@mentoria/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Lock, Zap, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditRuleDialog } from './edit-rule-dialog'
import { deleteRule, toggleRule } from './actions'
import { CategoryIcon } from '@/lib/category-icons';

interface RuleWithCategory extends CategorizationRule {
  category: Category | null
}

interface RulesListProps {
  userRules: RuleWithCategory[]
  systemRules: RuleWithCategory[]
  categories: Category[]
}

export function RulesList({ userRules, systemRules, categories }: RulesListProps) {
  const router = useRouter()
  const [editingRule, setEditingRule] = useState<RuleWithCategory | null>(null)

  const handleDelete = async (rule: RuleWithCategory) => {
    if (rule.user_id === null) return // Can't delete system rules
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return

    await deleteRule(rule.id)
    router.refresh()
  }

  const handleToggle = async (rule: RuleWithCategory, isActive: boolean) => {
    if (rule.user_id === null) return // Can't toggle system rules
    await toggleRule(rule.id, isActive)
    router.refresh()
  }

  if (userRules.length === 0 && systemRules.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma regra configurada</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie regras para categorizar suas transações automaticamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Minhas Regras ({userRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma regra personalizada. Crie uma ou corrija a categoria de uma transação para
              aprender automaticamente.
            </p>
          ) : (
            <div className="space-y-2">
              {userRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={() => setEditingRule(rule)}
                  onDelete={() => handleDelete(rule)}
                  onToggle={(isActive) => handleToggle(rule, isActive)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Regras do Sistema ({systemRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} isSystem />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingRule && (
        <EditRuleDialog
          rule={editingRule}
          categories={categories}
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
        />
      )}
    </div>
  )
}

interface RuleCardProps {
  rule: RuleWithCategory
  isSystem?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggle?: (isActive: boolean) => void
}

function RuleCard({ rule, isSystem, onEdit, onDelete, onToggle }: RuleCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-border p-3 transition-all',
        !rule.is_active && 'opacity-50 bg-muted/50',
        isSystem && 'bg-muted/30'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Category indicator */}
        {rule.category && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: `${rule.category?.color ?? ''}20` }}
          >
            <CategoryIcon icon={rule.category?.icon ?? ''} className="text-xl" />
          </div>
        )}

        {/* Pattern and category */}
        <div className="min-w-0 flex-1">
          <code className="text-sm bg-muted px-2 py-0.5 rounded text-foreground font-mono block truncate">
            {rule.pattern}
          </code>
          <p className="text-xs text-muted-foreground mt-1">
            → {rule.category?.name || 'Categoria removida'}
            <span className="ml-2 opacity-60">
              (prioridade: {rule.priority})
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        {!isSystem ? (
          <>
            <Switch
              checked={rule.is_active}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </>
        ) : (
          <Zap className="h-4 w-4 text-amber-500" />
        )}
      </div>
    </div>
  )
}

