'use client'

import { useState, useCallback } from 'react'
import type { Account, Category } from '@mentoria/database'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Upload, Settings, Eye, CheckCircle, FileUp } from 'lucide-react'
import { UploadStep } from '../import/steps/upload-step'
import { MappingStep } from '../import/steps/mapping-step'
import { PreviewStep } from '../import/steps/preview-step'
import { ResultStep } from '../import/steps/result-step'
import type { ImportConfig, ParsedTransaction } from '@/lib/validations/import'

interface ImportCSVDialogProps {
  accounts: Account[]
  categories: Category[]
}

type Step = 'upload' | 'mapping' | 'preview' | 'result'

const steps: { id: Step; title: string; icon: typeof Upload }[] = [
  { id: 'upload', title: 'Upload', icon: Upload },
  { id: 'mapping', title: 'Configurar', icon: Settings },
  { id: 'preview', title: 'Preview', icon: Eye },
  { id: 'result', title: 'Resultado', icon: CheckCircle },
]

export function ImportCSVDialog({ accounts, categories }: ImportCSVDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [config, setConfig] = useState<ImportConfig | null>(null)
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    errors: number
  } | null>(null)

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleFileUploaded = useCallback((content: string, name: string) => {
    setFileContent(content)
    setFileName(name)
    setCurrentStep('mapping')
  }, [])

  const handleConfigured = useCallback((newConfig: ImportConfig, transactions: ParsedTransaction[]) => {
    setConfig(newConfig)
    setParsedTransactions(transactions)
    setCurrentStep('preview')
  }, [])

  const handleImported = useCallback((result: { imported: number; skipped: number; errors: number }) => {
    setImportResult(result)
    setCurrentStep('result')
  }, [])

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }, [currentStepIndex])

  const handleReset = useCallback(() => {
    setFileContent(null)
    setFileName(null)
    setConfig(null)
    setParsedTransactions([])
    setImportResult(null)
    setCurrentStep('upload')
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset when dialog closes
      setTimeout(() => {
        handleReset()
      }, 300) // Wait for animation
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          <span className="hidden sm:inline">Importar CSV</span>
          <span className="sm:hidden">CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Importar Transações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Steps */}
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isCurrent = step.id === currentStep
                const isComplete = index < currentStepIndex
                const Icon = step.icon

                return (
                  <li key={step.id} className="flex-1">
                    <div
                      className={cn(
                        'group flex flex-col items-center',
                        index < steps.length - 1 && 'relative'
                      )}
                    >
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            'absolute top-5 left-1/2 h-0.5 w-full',
                            isComplete ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                          )}
                        />
                      )}

                      {/* Step circle */}
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900 transition-colors',
                          isCurrent && 'border-emerald-500 text-emerald-600',
                          isComplete && 'border-emerald-500 bg-emerald-500 text-white',
                          !isCurrent && !isComplete && 'border-gray-300 dark:border-gray-600 text-gray-400'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Step title */}
                      <span
                        className={cn(
                          'mt-2 text-sm font-medium',
                          isCurrent && 'text-emerald-600',
                          isComplete && 'text-emerald-600',
                          !isCurrent && !isComplete && 'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 'upload' && (
              <UploadStep onFileUploaded={handleFileUploaded} />
            )}

            {currentStep === 'mapping' && fileContent && fileName && (
              <MappingStep
                fileContent={fileContent}
                fileName={fileName}
                accounts={accounts}
                categories={categories}
                onConfigured={handleConfigured}
                onBack={handleBack}
              />
            )}

            {currentStep === 'preview' && config && (
              <PreviewStep
                transactions={parsedTransactions}
                config={config}
                categories={categories}
                onImported={handleImported}
                onBack={handleBack}
              />
            )}

            {currentStep === 'result' && importResult && (
              <ResultStepInDialog result={importResult} onReset={handleReset} onClose={() => setOpen(false)} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modified ResultStep for dialog (without Link, with close button)
function ResultStepInDialog({ 
  result, 
  onReset, 
  onClose 
}: { 
  result: { imported: number; skipped: number; errors: number }
  onReset: () => void
  onClose: () => void
}) {
  const hasErrors = result.errors > 0
  const hasImported = result.imported > 0

  return (
    <div className="flex flex-col items-center py-8">
      {/* Icon */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          hasErrors ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
        }`}
      >
        {hasErrors ? (
          <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
        {hasImported ? 'Importação Concluída!' : 'Importação Finalizada'}
      </h2>

      {/* Stats */}
      <div className="mt-6 grid w-full max-w-md gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-2xl font-bold">{result.imported}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Importadas</p>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
            <span className="text-2xl font-bold">{result.skipped}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Ignoradas</p>
        </div>

        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-2xl font-bold">{result.errors}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Erros</p>
        </div>
      </div>

      {/* Message */}
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        {hasImported
          ? 'Suas transações foram importadas com sucesso!'
          : 'Nenhuma transação foi importada. Verifique o arquivo e tente novamente.'}
      </p>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={onReset}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Importar Outro
        </Button>
        <Button onClick={onClose}>
          Concluir
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>

      {/* Tips */}
      {result.skipped > 0 && (
        <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 max-w-md">
          <h4 className="font-medium text-blue-900 dark:text-blue-200">💡 Dica</h4>
          <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
            {result.skipped} transações foram ignoradas (duplicatas ou inválidas). 
            Isso é normal e ajuda a manter seus dados organizados.
          </p>
        </div>
      )}
    </div>
  )
}


