// Supabase Edge Function: Process Recurring Transactions
// Runs daily via cron to create transactions from recurring templates
// 
// Cron Schedule: 0 3 * * * (3:00 AM UTC daily)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecurringTransaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: 'income' | 'expense'
  amount: number
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  next_occurrence: string
  is_active: boolean
}

interface ProcessResult {
  total_processed: number
  total_created: number
  total_skipped: number
  total_deactivated: number
  errors: string[]
  details: {
    recurring_id: string
    description: string
    amount: number
    status: 'created' | 'skipped' | 'deactivated' | 'error'
    message?: string
  }[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const result: ProcessResult = {
    total_processed: 0,
    total_created: 0,
    total_skipped: 0,
    total_deactivated: 0,
    errors: [],
    details: [],
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    console.log(`[Process Recurring] Starting job for date: ${today}`)

    // Get all active recurring transactions due today or earlier
    const { data: dueRecurring, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_occurrence', today)
      .order('next_occurrence', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch recurring transactions: ${fetchError.message}`)
    }

    console.log(`[Process Recurring] Found ${dueRecurring?.length || 0} due transactions`)

    if (!dueRecurring || dueRecurring.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No recurring transactions due today',
          ...result,
          execution_time_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each recurring transaction
    for (const recurring of dueRecurring as RecurringTransaction[]) {
      result.total_processed++

      try {
        // Check if end_date has passed
        if (recurring.end_date && recurring.end_date < today) {
          // Deactivate the recurring transaction
          const { error: deactivateError } = await supabase
            .from('recurring_transactions')
            .update({ is_active: false })
            .eq('id', recurring.id)

          if (deactivateError) {
            throw new Error(`Failed to deactivate: ${deactivateError.message}`)
          }

          result.total_deactivated++
          result.details.push({
            recurring_id: recurring.id,
            description: recurring.description,
            amount: recurring.amount,
            status: 'deactivated',
            message: `End date (${recurring.end_date}) has passed`,
          })
          continue
        }

        // Create the transaction
        const transactionData = {
          user_id: recurring.user_id,
          account_id: recurring.account_id,
          category_id: recurring.category_id,
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          date: recurring.next_occurrence,
          recurring_id: recurring.id,
          auto_categorized: true,
          confidence: 1.0,
          notes: `Criado automaticamente de recorrência: ${recurring.description}`,
        }

        const { data: newTransaction, error: insertError } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()
          .single()

        if (insertError) {
          throw new Error(`Failed to create transaction: ${insertError.message}`)
        }

        // Calculate next occurrence
        const { data: nextDate, error: calcError } = await supabase
          .rpc('calculate_next_occurrence', {
            current_date: recurring.next_occurrence,
            freq: recurring.frequency,
          })

        if (calcError) {
          console.error(`[Process Recurring] Error calculating next date: ${calcError.message}`)
          // Fallback: calculate manually
          const currentDate = new Date(recurring.next_occurrence)
          let nextOccurrence: Date

          switch (recurring.frequency) {
            case 'daily':
              nextOccurrence = new Date(currentDate.setDate(currentDate.getDate() + 1))
              break
            case 'weekly':
              nextOccurrence = new Date(currentDate.setDate(currentDate.getDate() + 7))
              break
            case 'monthly':
              nextOccurrence = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              break
            case 'yearly':
              nextOccurrence = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
              break
            default:
              nextOccurrence = currentDate
          }

          // Update next_occurrence
          const { error: updateError } = await supabase
            .from('recurring_transactions')
            .update({ next_occurrence: nextOccurrence.toISOString().split('T')[0] })
            .eq('id', recurring.id)

          if (updateError) {
            console.error(`[Process Recurring] Error updating next_occurrence: ${updateError.message}`)
          }
        } else {
          // Update with RPC result
          const { error: updateError } = await supabase
            .from('recurring_transactions')
            .update({ next_occurrence: nextDate })
            .eq('id', recurring.id)

          if (updateError) {
            console.error(`[Process Recurring] Error updating next_occurrence: ${updateError.message}`)
          }
        }

        result.total_created++
        result.details.push({
          recurring_id: recurring.id,
          description: recurring.description,
          amount: recurring.amount,
          status: 'created',
          message: `Transaction created: ${newTransaction.id}`,
        })

        console.log(`[Process Recurring] Created transaction for: ${recurring.description}`)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        result.errors.push(`${recurring.id}: ${errorMessage}`)
        result.details.push({
          recurring_id: recurring.id,
          description: recurring.description,
          amount: recurring.amount,
          status: 'error',
          message: errorMessage,
        })
        console.error(`[Process Recurring] Error processing ${recurring.id}: ${errorMessage}`)
      }
    }

    const executionTime = Date.now() - startTime

    console.log(`[Process Recurring] Job completed in ${executionTime}ms`)
    console.log(`[Process Recurring] Created: ${result.total_created}, Deactivated: ${result.total_deactivated}, Errors: ${result.errors.length}`)

    return new Response(
      JSON.stringify({
        success: result.errors.length === 0,
        message: `Processed ${result.total_processed} recurring transactions`,
        ...result,
        execution_time_ms: executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Process Recurring] Fatal error: ${errorMessage}`)

    return new Response(
      JSON.stringify({
        success: false,
        message: `Job failed: ${errorMessage}`,
        ...result,
        execution_time_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

