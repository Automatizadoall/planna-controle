'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    // Validate with Zod
    const result = registerSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterInput
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      console.log('Iniciando cadastro com:', { email: data.email, fullName: data.fullName })
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      console.log('Resposta do Supabase:', { authData, error })

      if (error) {
        console.error('Supabase auth error:', error)
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setGeneralError('Este email já está cadastrado. Tente fazer login.')
        } else if (error.message.includes('Invalid email')) {
          setGeneralError('Email inválido.')
        } else if (error.message.includes('Password')) {
          setGeneralError('Senha não atende aos requisitos mínimos.')
        } else {
          setGeneralError(`Erro: ${error.message}`)
        }
        setIsLoading(false)
        return
      }

      // Check if user needs email confirmation
      if (authData.user && !authData.session) {
        // Email confirmation required
        setSuccess(true)
      } else if (authData.session) {
        // Auto-confirmed, redirect to dashboard
        router.push('/dashboard')
      } else {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Registration catch error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setGeneralError(`Erro inesperado: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle>Conta criada com sucesso!</CardTitle>
          <CardDescription>
            Enviamos um email de confirmação para você. Verifique sua caixa de entrada e clique no
            link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Ir para Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para começar a controlar suas finanças.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {generalError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{generalError}</div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="João Silva"
              autoComplete="name"
              disabled={isLoading}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            <p className="text-xs text-gray-500">
              Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Fazer login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

