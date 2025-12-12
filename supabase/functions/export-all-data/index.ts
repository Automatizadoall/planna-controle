// Supabase Edge Function: Export All User Data (LGPD/GDPR Compliance)
// Generates a ZIP file with all user data in JSON/CSV format
// 
// Endpoint: POST /functions/v1/export-all-data
// Auth: Required (Bearer token)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { JSZip } from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportOptions {
  format: 'json' | 'csv'
  include_deleted?: boolean
}

// Helper to convert array to CSV
function arrayToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
      return String(value).replace(/"/g, '""')
    }).map(v => `"${v}"`).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Export Data] Starting export for user: ${user.id}`)

    // Parse options from request body
    let options: ExportOptions = { format: 'json' }
    try {
      const body = await req.json()
      options = { ...options, ...body }
    } catch {
      // Use defaults
    }

    // Fetch all user data from each table
    const exportData: Record<string, any> = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      user_email: user.email,
    }

    // 1. Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    exportData.profile = profile

    // 2. Accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.accounts = accounts || []

    // 3. Categories (user's custom categories only)
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.categories = categories || []

    // 4. Transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    exportData.transactions = transactions || []

    // 5. Budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.budgets = budgets || []

    // 6. Goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.goals = goals || []

    // 7. Recurring Transactions
    const { data: recurring } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.recurring_transactions = recurring || []

    // 8. Categorization Rules
    const { data: rules } = await supabase
      .from('categorization_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    exportData.categorization_rules = rules || []

    // Calculate summary
    const summary = {
      total_accounts: exportData.accounts.length,
      total_transactions: exportData.transactions.length,
      total_budgets: exportData.budgets.length,
      total_goals: exportData.goals.length,
      total_recurring: exportData.recurring_transactions.length,
      total_rules: exportData.categorization_rules.length,
      date_range: {
        first_transaction: exportData.transactions[exportData.transactions.length - 1]?.date || null,
        last_transaction: exportData.transactions[0]?.date || null,
      },
    }
    exportData.summary = summary

    console.log(`[Export Data] Collected data: ${JSON.stringify(summary)}`)

    // Create ZIP file
    const zip = new JSZip()
    
    if (options.format === 'json') {
      // Add JSON files
      zip.file('profile.json', JSON.stringify(exportData.profile, null, 2))
      zip.file('accounts.json', JSON.stringify(exportData.accounts, null, 2))
      zip.file('categories.json', JSON.stringify(exportData.categories, null, 2))
      zip.file('transactions.json', JSON.stringify(exportData.transactions, null, 2))
      zip.file('budgets.json', JSON.stringify(exportData.budgets, null, 2))
      zip.file('goals.json', JSON.stringify(exportData.goals, null, 2))
      zip.file('recurring_transactions.json', JSON.stringify(exportData.recurring_transactions, null, 2))
      zip.file('categorization_rules.json', JSON.stringify(exportData.categorization_rules, null, 2))
      zip.file('summary.json', JSON.stringify({ ...summary, exported_at: exportData.exported_at }, null, 2))
    } else {
      // Add CSV files
      if (exportData.profile) {
        zip.file('profile.csv', arrayToCSV([exportData.profile]))
      }
      if (exportData.accounts.length > 0) {
        zip.file('accounts.csv', arrayToCSV(exportData.accounts))
      }
      if (exportData.categories.length > 0) {
        zip.file('categories.csv', arrayToCSV(exportData.categories))
      }
      if (exportData.transactions.length > 0) {
        zip.file('transactions.csv', arrayToCSV(exportData.transactions))
      }
      if (exportData.budgets.length > 0) {
        zip.file('budgets.csv', arrayToCSV(exportData.budgets))
      }
      if (exportData.goals.length > 0) {
        zip.file('goals.csv', arrayToCSV(exportData.goals))
      }
      if (exportData.recurring_transactions.length > 0) {
        zip.file('recurring_transactions.csv', arrayToCSV(exportData.recurring_transactions))
      }
      if (exportData.categorization_rules.length > 0) {
        zip.file('categorization_rules.csv', arrayToCSV(exportData.categorization_rules))
      }
      zip.file('summary.json', JSON.stringify({ ...summary, exported_at: exportData.exported_at }, null, 2))
    }

    // Add README
    zip.file('README.txt', `
EXPORTAÇÃO DE DADOS - CONTROLE FINANCEIRO PESSOAL
================================================

Este arquivo contém todos os seus dados pessoais armazenados no aplicativo,
em conformidade com a Lei Geral de Proteção de Dados (LGPD).

Exportado em: ${exportData.exported_at}
Email: ${user.email}

ARQUIVOS INCLUÍDOS:
-------------------
- profile.${options.format}: Seus dados de perfil
- accounts.${options.format}: Suas contas financeiras
- categories.${options.format}: Suas categorias personalizadas
- transactions.${options.format}: Todas as suas transações
- budgets.${options.format}: Seus orçamentos
- goals.${options.format}: Suas metas de poupança
- recurring_transactions.${options.format}: Suas transações recorrentes
- categorization_rules.${options.format}: Suas regras de categorização
- summary.json: Resumo estatístico

SEUS DIREITOS (LGPD):
---------------------
- Direito de acesso: Este arquivo atende esse direito
- Direito de correção: Você pode editar seus dados no app
- Direito de exclusão: Você pode solicitar a exclusão da conta
- Direito de portabilidade: Este arquivo permite transferir seus dados

Em caso de dúvidas, entre em contato conosco.
`)

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'uint8array' })
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `dados-exportados-${timestamp}.zip`

    console.log(`[Export Data] Export completed successfully: ${filename}`)

    // Return ZIP file
    return new Response(zipBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Summary': JSON.stringify(summary),
      },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Export Data] Error: ${errorMessage}`)

    return new Response(
      JSON.stringify({ error: `Export failed: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

