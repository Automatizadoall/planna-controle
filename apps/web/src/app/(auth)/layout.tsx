import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 p-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Poupefy"
          width={48}
          height={48}
          className="drop-shadow-lg"
        />
        <span className="text-2xl font-bold text-foreground">Poupefy</span>
      </Link>

      {/* Content */}
      {children}

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Poupefy. Todos os direitos reservados.
      </p>
    </div>
  )
}
