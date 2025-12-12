-- Migration: Add status to transactions
-- Description: Allows pending/scheduled transactions that don't affect balance until confirmed

-- Create transaction status enum
CREATE TYPE public.transaction_status AS ENUM (
  'confirmed',   -- Transação confirmada, afeta saldo
  'pending',     -- Aguardando confirmação (recorrências automáticas)
  'scheduled'    -- Agendada para o futuro (não afeta saldo ainda)
);

-- Add status column with default 'confirmed' for backwards compatibility
ALTER TABLE public.transactions 
ADD COLUMN status public.transaction_status NOT NULL DEFAULT 'confirmed';

-- Add notes column if not exists (for auto-generated transactions)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the balance trigger to only affect confirmed transactions
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only update balance for confirmed transactions
    IF NEW.status = 'confirmed' THEN
      IF NEW.type = 'income' THEN
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
      END IF;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      -- Reverting a confirmed transaction to pending/scheduled
      IF OLD.type = 'income' THEN
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
      END IF;
      
    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      -- Confirming a pending/scheduled transaction
      IF NEW.type = 'income' THEN
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
      END IF;
      
    ELSIF OLD.status = 'confirmed' AND NEW.status = 'confirmed' THEN
      -- Both confirmed, handle amount/account changes
      -- Revert old
      IF OLD.type = 'income' THEN
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
      END IF;
      
      -- Apply new
      IF NEW.type = 'income' THEN
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      ELSIF NEW.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
      END IF;
    END IF;
    -- If both are not confirmed, no balance change needed
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Only affect balance if was confirmed
    IF OLD.status = 'confirmed' THEN
      IF OLD.type = 'income' THEN
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'expense' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      ELSIF OLD.type = 'transfer' THEN
        UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for querying pending transactions
CREATE INDEX idx_transactions_status ON public.transactions(status) WHERE status != 'confirmed';
CREATE INDEX idx_transactions_pending ON public.transactions(user_id, status) WHERE status = 'pending';

-- Update process_recurring_transactions to create pending transactions
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
      
      -- Create the transaction as PENDING (not confirmed yet!)
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
        notes,
        status  -- NEW: Create as pending
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
        'Criado automaticamente de recorrência. Aguardando confirmação.',
        'pending'  -- PENDING status - won't affect balance until confirmed
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

COMMENT ON COLUMN public.transactions.status IS 'confirmed = affects balance, pending = awaiting user confirmation, scheduled = future transaction';

