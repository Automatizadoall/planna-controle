'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileJson, FileSpreadsheet, CheckCircle2 } from 'lucide-react'

export function ExportDataCard() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setIsExporting(true)
    setError(null)
    setSuccess(false)

    try {
      // Call local API route (handles auth via cookies)
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: exportFormat }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      // Get the ZIP file
      const blob = await response.blob()
      
      // Get filename from header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `dados-exportados-${new Date().toISOString().slice(0, 10)}.zip`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)

    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao exportar dados')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados (LGPD)
        </CardTitle>
        <CardDescription>
          Baixe todos os seus dados em conformidade com a LGPD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Você tem o direito de solicitar uma cópia de todos os seus dados armazenados. 
          O arquivo ZIP incluirá: perfil, contas, transações, orçamentos, metas e mais.
        </p>

        {/* Format Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setExportFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              exportFormat === 'json'
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border-border hover:bg-accent'
            }`}
          >
            <FileJson className="h-4 w-4" />
            JSON
          </button>
          <button
            onClick={() => setExportFormat('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              exportFormat === 'csv'
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border-border hover:bg-accent'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Dados exportados com sucesso!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Meus Dados ({exportFormat.toUpperCase()})
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          O download pode levar alguns segundos dependendo da quantidade de dados.
        </p>
      </CardContent>
    </Card>
  )
}

