'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'

// Tipos para lazy loading
type jsPDFType = typeof import('jspdf').default
type ChartType = typeof import('chart.js').Chart

interface CategoryData {
  name: string
  total: number
  count: number
}

interface ExportPDFButtonProps {
  period: string
  startDate: string
  endDate: string
  totalIncome: number
  totalExpenses: number
  transactionCount: number
  expensesByCategory: CategoryData[]
  incomeByCategory: CategoryData[]
}

const formatCurrency = (v: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// Helper to generate pie chart as base64 image (lazy loads Chart.js)
async function generatePieChart(
  Chart: ChartType,
  data: CategoryData[],
  title: string,
  colors: string[]
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve('')
      return
    }

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 10 } }
          },
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    })

    setTimeout(() => {
      resolve(canvas.toDataURL('image/png'))
    }, 500)
  })
}

export function ExportPDFButton(props: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false)
  const chartLibRef = useRef<ChartType | null>(null)
  const { period, startDate, endDate, totalIncome, totalExpenses, 
          transactionCount, expensesByCategory, incomeByCategory } = props

  async function handleExport() {
    setLoading(true)
    try {
      // Lazy load jsPDF, autoTable e Chart.js apenas quando necessário
      const [
        { default: jsPDF },
        { default: autoTable },
        { Chart, ArcElement, Tooltip, Legend, PieController }
      ] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        import('chart.js')
      ])

      // Registrar componentes do Chart.js (apenas uma vez)
      if (!chartLibRef.current) {
        Chart.register(ArcElement, Tooltip, Legend, PieController)
        chartLibRef.current = Chart
      }

      const doc = new jsPDF()
      const w = doc.internal.pageSize.getWidth()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(16, 185, 129)
      doc.text('Poupefy - Relatório Financeiro', w / 2, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(`Período: ${startDate} a ${endDate}`, w / 2, 30, { align: 'center' })

      // Summary table
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Resumo', 14, 50)
      
      autoTable(doc, {
        startY: 55,
        head: [['Indicador', 'Valor']],
        body: [
          ['Receitas', formatCurrency(totalIncome)],
          ['Despesas', formatCurrency(totalExpenses)],
          ['Saldo', formatCurrency(totalIncome - totalExpenses)],
          ['Transações', transactionCount.toString()],
        ],
        headStyles: { fillColor: [16, 185, 129] },
      })

      let y = (doc as any).lastAutoTable.finalY + 15
      
      // Expenses section with pie chart
      if (expensesByCategory.length > 0) {
        doc.text('Despesas por Categoria', 14, y)
        
        // Generate pie chart
        const expenseColors = [
          '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
          '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
        ]
        const expenseChart = await generatePieChart(
          chartLibRef.current!,
          expensesByCategory.slice(0, 8),
          '',
          expenseColors
        )
        
        if (expenseChart) {
          doc.addImage(expenseChart, 'PNG', 14, y + 5, 80, 80)
        }
        
        // Table next to chart
        autoTable(doc, {
          startY: y + 5,
          margin: { left: 100 },
          head: [['Categoria', 'Valor', '%']],
          body: expensesByCategory.slice(0, 8).map(c => [
            c.name,
            formatCurrency(c.total),
            `${((c.total / totalExpenses) * 100).toFixed(1)}%`
          ]),
          headStyles: { fillColor: [239, 68, 68] },
          styles: { fontSize: 9 },
        })
        
        y = Math.max((doc as any).lastAutoTable.finalY, y + 90) + 15
      }

      // Add new page if needed
      if (y > 200 && incomeByCategory.length > 0) {
        doc.addPage()
        y = 20
      }

      // Income section with pie chart
      if (incomeByCategory.length > 0) {
        doc.text('Receitas por Categoria', 14, y)
        
        // Generate pie chart
        const incomeColors = [
          '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
          '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
        ]
        const incomeChart = await generatePieChart(
          chartLibRef.current!,
          incomeByCategory.slice(0, 8),
          '',
          incomeColors
        )
        
        if (incomeChart) {
          doc.addImage(incomeChart, 'PNG', 14, y + 5, 80, 80)
        }
        
        // Table next to chart
        autoTable(doc, {
          startY: y + 5,
          margin: { left: 100 },
          head: [['Categoria', 'Valor', '%']],
          body: incomeByCategory.slice(0, 8).map(c => [
            c.name,
            formatCurrency(c.total),
            `${((c.total / totalIncome) * 100).toFixed(1)}%`
          ]),
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 9 },
        })
      }

      doc.save(`relatorio-${startDate}-${endDate}.pdf`)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline" className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {loading ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  )
}

