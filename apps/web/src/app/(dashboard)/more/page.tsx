import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  CreditCard,
  Tags,
  Repeat,
  BarChart3,
  Upload,
  Settings,
  HelpCircle,
  Shield,
  Bell,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Gestão',
    items: [
      { name: 'Contas', href: '/accounts', icon: CreditCard, description: 'Gerenciar contas bancárias' },
      { name: 'Categorias', href: '/categories', icon: Tags, description: 'Organizar categorias' },
      { name: 'Recorrentes', href: '/recurring', icon: Repeat, description: 'Despesas e receitas fixas' },
      { name: 'Importar CSV', href: '/import', icon: Upload, description: 'Importar extratos' },
    ],
  },
  {
    title: 'Análise',
    items: [
      { name: 'Relatórios', href: '/reports', icon: BarChart3, description: 'Análise detalhada' },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { name: 'Configurações', href: '/settings', icon: Settings, description: 'Preferências do app' },
    ],
  },
]

export default function MorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mais Opções</h1>
        <p className="text-muted-foreground">Acesse todas as funcionalidades</p>
      </div>

      {menuItems.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {section.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="transition-all hover:shadow-md hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


