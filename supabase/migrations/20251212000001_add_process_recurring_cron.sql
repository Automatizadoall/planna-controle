-- Migration: Add cron job for processing recurring transactions
-- Description: Configures pg_cron to run process-recurring Edge Function daily at 3 AM

-- Enable pg_cron extension (usually already enabled in Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a log table for cron job execution
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  message TEXT,
  details JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for cron logs (admin only - no user access)
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- No policies = no user access (only service role)

-- Index for querying recent logs
CREATE INDEX idx_cron_logs_job_created ON public.cron_job_logs(job_name, created_at DESC);

-- Create helper function to process recurring transactions
-- This can be called directly from pg_cron or via Edge Function
CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
RETURNS JSONB AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_recurring RECORD;
  v_next_date DATE;
  v_total_processed INT := 0;
  v_total_created INT := 0;
  v_total_deactivated INT := 0;
  v_errors TEXT[] := '{}';
  v_log_id UUID;
BEGIN
  -- Log start
  INSERT INTO public.cron_job_logs (job_name, status, message)
  VALUES ('process_recurring_transactions', 'started', 'Processing recurring transactions for ' || v_today)
  RETURNING id INTO v_log_id;

  -- Loop through all due recurring transactions
  FOR v_recurring IN
    SELECT *
    FROM public.recurring_transactions
    WHERE is_active = true
      AND next_occurrence <= v_today
    ORDER BY next_occurrence
  LOOP
    v_total_processed := v_total_processed + 1;
    
    BEGIN
      -- Check if end_date has passed
      IF v_recurring.end_date IS NOT NULL AND v_recurring.end_date < v_today THEN
        -- Deactivate
        UPDATE public.recurring_transactions
        SET is_active = false, updated_at = NOW()
        WHERE id = v_recurring.id;
        
        v_total_deactivated := v_total_deactivated + 1;
        CONTINUE;
      END IF;
      
      -- Create the transaction
      INSERT INTO public.transactions (
        user_id,
        account_id,
        category_id,
        type,
        amount,
        description,
        date,
        recurring_id,
        auto_categorized,
        confidence,
        notes
      ) VALUES (
        v_recurring.user_id,
        v_recurring.account_id,
        v_recurring.category_id,
        v_recurring.type,
        v_recurring.amount,
        v_recurring.description,
        v_recurring.next_occurrence,
        v_recurring.id,
        true,
        1.0,
        'Criado automaticamente de recorrência'
      );
      
      -- Calculate next occurrence
      v_next_date := public.calculate_next_occurrence(
        v_recurring.next_occurrence,
        v_recurring.frequency
      );
      
      -- Update next_occurrence
      UPDATE public.recurring_transactions
      SET next_occurrence = v_next_date, updated_at = NOW()
      WHERE id = v_recurring.id;
      
      v_total_created := v_total_created + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, v_recurring.id::TEXT || ': ' || SQLERRM);
    END;
  END LOOP;
  
  -- Log completion
  UPDATE public.cron_job_logs
  SET 
    status = CASE WHEN array_length(v_errors, 1) > 0 THEN 'failed' ELSE 'completed' END,
    message = 'Processed ' || v_total_processed || ' recurring transactions',
    details = jsonb_build_object(
      'total_processed', v_total_processed,
      'total_created', v_total_created,
      'total_deactivated', v_total_deactivated,
      'errors', v_errors
    ),
    completed_at = NOW()
  WHERE id = v_log_id;
  
  RETURN jsonb_build_object(
    'success', array_length(v_errors, 1) IS NULL,
    'total_processed', v_total_processed,
    'total_created', v_total_created,
    'total_deactivated', v_total_deactivated,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role (for Edge Functions and cron)
GRANT EXECUTE ON FUNCTION public.process_recurring_transactions() TO service_role;

-- Note: To schedule the cron job in Supabase, you need to run this in the SQL Editor:
-- 
-- SELECT cron.schedule(
--   'process-recurring-daily',           -- job name
--   '0 3 * * *',                          -- 3:00 AM daily
--   $$SELECT public.process_recurring_transactions()$$
-- );
--
-- Or use the Edge Function approach with Supabase's built-in cron:
-- In supabase/config.toml add:
-- [functions.process-recurring]
-- schedule = "0 3 * * *"

COMMENT ON FUNCTION public.process_recurring_transactions() IS 'Processes all due recurring transactions, creates transactions, and updates next occurrence dates. Run daily via cron.';
COMMENT ON TABLE public.cron_job_logs IS 'Logs for cron job executions for monitoring and debugging';

