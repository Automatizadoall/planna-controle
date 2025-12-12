-- Migration: Create recurring_transactions table
-- Description: Recurring transaction templates (subscriptions, bills)

-- Create frequency enum
CREATE TYPE public.recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  frequency public.recurring_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = no end
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recurring transactions"
  ON public.recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
  ON public.recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
  ON public.recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
  ON public.recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to calculate next occurrence
CREATE OR REPLACE FUNCTION public.calculate_next_occurrence(
  current_date DATE,
  freq public.recurring_frequency
)
RETURNS DATE AS $$
BEGIN
  CASE freq
    WHEN 'daily' THEN
      RETURN current_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN current_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN current_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      RETURN current_date + INTERVAL '1 year';
    ELSE
      RETURN current_date;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add FK to transactions table
ALTER TABLE public.transactions 
  ADD CONSTRAINT fk_recurring_transaction 
  FOREIGN KEY (recurring_id) 
  REFERENCES public.recurring_transactions(id) 
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_recurring_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_next ON public.recurring_transactions(next_occurrence) WHERE is_active = true;
CREATE INDEX idx_recurring_active ON public.recurring_transactions(is_active) WHERE is_active = true;

COMMENT ON TABLE public.recurring_transactions IS 'Recurring transaction templates (subscriptions, bills)';

