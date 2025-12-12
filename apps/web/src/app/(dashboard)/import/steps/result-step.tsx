'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface ResultStepProps {
  result: {
    imported: number
    skipped: number
    errors: number
  }
  onReset: () => void
}

export function ResultStep({ result, onReset }: ResultStepProps) {
  const hasErrors = result.errors > 0
  const hasImported = result.imported > 0

  return (
    <div className="flex flex-col items-center py-8">
      {/* Icon */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          hasErrors ? 'bg-amber-100' : 'bg-emerald-100'
        }`}
      >
        {hasErrors ? (
          <AlertTriangle className="h-10 w-10 text-amber-600" />
        ) : (
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        )}
      </div>

      {/* Title */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        {hasImported ? 'Importação Concluída!' : 'Importação Finalizada'}
      </h2>

      {/* Stats */}
      <div className="mt-6 grid w-full max-w-md gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-2xl font-bold">{result.imported}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">Importadas</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-2xl font-bold">{result.skipped}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">Ignoradas</p>
        </div>

        <div className="rounded-lg bg-red-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="text-2xl font-bold">{result.errors}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">Erros</p>
        </div>
      </div>

      {/* Message */}
      <p className="mt-6 text-center text-gray-600">
        {hasImported
          ? 'Suas transações foram importadas com sucesso! Você pode visualizá-las na página de transações.'
          : 'Nenhuma transação foi importada. Verifique o arquivo e tente novamente.'}
      </p>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Importar Outro Arquivo
        </Button>
        <Button asChild>
          <Link href="/transactions">
            Ver Transações
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Tips */}
      {result.skipped > 0 && (
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4 max-w-md">
          <h4 className="font-medium text-blue-900">💡 Dica</h4>
          <p className="mt-1 text-sm text-blue-800">
            {result.skipped} transações foram ignoradas (duplicatas ou inválidas). 
            Isso é normal e ajuda a manter seus dados organizados.
          </p>
        </div>
      )}
    </div>
  )
}

