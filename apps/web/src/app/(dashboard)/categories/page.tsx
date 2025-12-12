import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CategoriesList } from './categories-list'
import { CreateCategoryDialog } from './create-category-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all categories (system + user)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order('is_system', { ascending: false })
    .order('name')

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []
  const incomeCategories = categories?.filter((c) => c.type === 'income') || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize suas transações com categorias personalizadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/categories/rules">
              <Zap className="mr-2 h-4 w-4" />
              Regras Automáticas
            </Link>
          </Button>
          <CreateCategoryDialog />
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <span className="text-expense">↓</span>
            Despesas ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <span className="text-income">↑</span>
            Receitas ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-6">
          <CategoriesList categories={expenseCategories} type="expense" />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <CategoriesList categories={incomeCategories} type="income" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

