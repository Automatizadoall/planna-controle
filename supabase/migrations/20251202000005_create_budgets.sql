-- Migration: Create budgets table
-- Description: Monthly budgets by category

-- Create budget_period enum
CREATE TYPE public.budget_period AS ENUM ('weekly', 'monthly', 'yearly');

-- Create budget_alert_type enum
CREATE TYPE public.budget_alert_type AS ENUM ('soft', 'hard');

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
  period public.budget_period NOT NULL DEFAULT 'monthly',
  alert_type public.budget_alert_type NOT NULL DEFAULT 'soft',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one budget per category per period per user
  CONSTRAINT unique_budget_per_category UNIQUE (user_id, category_id, period)
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_category ON public.budgets(category_id);

-- View: budget_status (calculates current spending vs limit)
CREATE OR REPLACE VIEW public.budget_status AS
SELECT 
  b.id,
  b.user_id,
  b.category_id,
  b.limit_amount,
  b.period,
  b.alert_type,
  b.start_date,
  b.is_recurring,
  b.created_at,
  b.updated_at,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  COALESCE(spent.total, 0) AS spent,
  ROUND((COALESCE(spent.total, 0) / b.limit_amount * 100)::numeric, 2) AS percentage,
  CASE 
    WHEN COALESCE(spent.total, 0) / b.limit_amount >= 1 THEN 'exceeded'
    WHEN COALESCE(spent.total, 0) / b.limit_amount >= 0.8 THEN 'warning'
    ELSE 'ok'
  END AS status
FROM public.budgets b
JOIN public.categories c ON c.id = b.category_id
LEFT JOIN LATERAL (
  SELECT SUM(t.amount) AS total
  FROM public.transactions t
  WHERE t.category_id = b.category_id
    AND t.user_id = b.user_id
    AND t.type = 'expense'
    AND CASE 
      WHEN b.period = 'monthly' THEN 
        DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
      WHEN b.period = 'weekly' THEN 
        DATE_TRUNC('week', t.date) = DATE_TRUNC('week', CURRENT_DATE)
      WHEN b.period = 'yearly' THEN 
        DATE_TRUNC('year', t.date) = DATE_TRUNC('year', CURRENT_DATE)
    END
) spent ON true;

COMMENT ON TABLE public.budgets IS 'Monthly budgets by category';
COMMENT ON VIEW public.budget_status IS 'Budget status with current spending calculated';

