'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadStepProps {
  onFileUploaded: (content: string, fileName: string) => void
}

export function UploadStep({ onFileUploaded }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      // Validate file type
      if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
        setError('Por favor, selecione um arquivo CSV válido.')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo é muito grande. Tamanho máximo: 5MB.')
        return
      }

      try {
        const content = await file.text()
        const lines = content.split(/\r?\n/).filter((l) => l.trim())

        if (lines.length < 2) {
          setError('O arquivo deve ter pelo menos 2 linhas (cabeçalho + dados).')
          return
        }

        onFileUploaded(content, file.name)
      } catch (err) {
        setError('Erro ao ler o arquivo. Verifique se é um arquivo CSV válido.')
      }
    },
    [onFileUploaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-accent/30'
        )}
      >
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}
        >
          <Upload
            className={cn('h-8 w-8 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>

        <h3 className="mt-4 text-lg font-medium text-foreground">
          Arraste seu arquivo CSV aqui
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">ou clique para selecionar</p>

        <label className="mt-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            className="sr-only"
          />
          <Button type="button" variant="outline" className="cursor-pointer" asChild>
            <span>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar Arquivo
            </span>
          </Button>
        </label>

        <p className="mt-4 text-xs text-muted-foreground">Tamanho máximo: 5MB</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <h4 className="flex items-center gap-2 font-medium text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Dicas para importação
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Exporte o extrato do seu banco em formato CSV</li>
          <li>• O arquivo deve ter colunas de data, descrição e valor</li>
          <li>• Na próxima etapa você poderá mapear as colunas</li>
          <li>• Duplicatas serão detectadas automaticamente</li>
        </ul>
      </div>

      {/* Supported Banks */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Compatível com extratos de:</p>
        <p className="mt-1 font-medium text-foreground">
          Nubank • Itaú • Bradesco • Santander • Banco do Brasil • Inter • C6 Bank • e outros
        </p>
      </div>
    </div>
  )
}

