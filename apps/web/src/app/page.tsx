import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="text-center animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="Poupefy"
            width={80}
            height={80}
            className="drop-shadow-lg rounded-2xl"
          />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Poupefy
          <span className="block text-emerald-600 dark:text-emerald-400">Controle Financeiro</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Gerencie suas finanças de forma simples e inteligente. Controle gastos, crie orçamentos e
          alcance suas metas.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-700 hover:shadow-xl"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-600 bg-white dark:bg-slate-800 px-8 py-3 text-base font-medium text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-50 dark:hover:bg-slate-700"
          >
            Criar Conta
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 p-6 backdrop-blur-sm animate-stagger">
            <div className="mb-3 text-3xl">📊</div>
            <h3 className="mb-2 font-semibold text-foreground">Dashboard Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Visualize seu patrimônio e gastos em tempo real
            </p>
          </div>
          <div
            className="rounded-xl bg-white/60 dark:bg-slate-800/60 p-6 backdrop-blur-sm animate-stagger"
            style={{ animationDelay: '100ms' }}
          >
            <div className="mb-3 text-3xl">🎯</div>
            <h3 className="mb-2 font-semibold text-foreground">Metas de Poupança</h3>
            <p className="text-sm text-muted-foreground">Defina objetivos e acompanhe seu progresso</p>
          </div>
          <div
            className="rounded-xl bg-white/60 dark:bg-slate-800/60 p-6 backdrop-blur-sm animate-stagger"
            style={{ animationDelay: '200ms' }}
          >
            <div className="mb-3 text-3xl">🤖</div>
            <h3 className="mb-2 font-semibold text-foreground">Categorização Automática</h3>
            <p className="text-sm text-muted-foreground">Transações categorizadas automaticamente</p>
          </div>
        </div>
      </div>
    </main>
  )
}
