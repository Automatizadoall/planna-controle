import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from './profile-form'
import { ThemeSettings } from './theme-settings'
import { ExportDataCard } from './export-data-card'

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} profile={profile} />
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Personalize a aparência do app</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Dados de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
              <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conta criada em</p>
              <p className="text-foreground">
                {new Date(user.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
              <p className="text-foreground">
                {new Date(profile?.updated_at || user.updated_at || new Date()).toLocaleDateString(
                  'pt-BR',
                  {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Data Card */}
        <ExportDataCard />

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>Ações irreversíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-destructive/10">
              <div>
                <p className="font-medium text-foreground">Excluir Conta</p>
                <p className="text-sm text-muted-foreground">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-destructive bg-card border border-destructive/30 rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Em breve
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

