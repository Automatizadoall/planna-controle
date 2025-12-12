'use client'

import { useState, useCallback } from 'react'
import type { Account, Category } from '@mentoria/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, Settings, Eye, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { UploadStep } from './steps/upload-step'
import { MappingStep } from './steps/mapping-step'
import { PreviewStep } from './steps/preview-step'
import { ResultStep } from './steps/result-step'
import type { ImportConfig, ParsedTransaction } from '@/lib/validations/import'

interface ImportWizardProps {
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

export function ImportWizard({ accounts, categories }: ImportWizardProps) {
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

  return (
    <div className="space-y-6">
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
                        isComplete ? 'bg-emerald-500' : 'bg-gray-200'
                      )}
                    />
                  )}

                  {/* Step circle */}
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-colors',
                      isCurrent && 'border-emerald-500 text-emerald-600',
                      isComplete && 'border-emerald-500 bg-emerald-500 text-white',
                      !isCurrent && !isComplete && 'border-gray-300 text-gray-400'
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
                      !isCurrent && !isComplete && 'text-gray-500'
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
      <Card>
        <CardContent className="p-6">
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
            <ResultStep result={importResult} onReset={handleReset} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

