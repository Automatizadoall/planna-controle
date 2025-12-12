-- Migration: Adjust budgets and goals tables
-- Description: Add missing columns and rename fields for consistency

-- =====================
-- BUDGETS ADJUSTMENTS
-- =====================

-- Rename limit_amount to amount for consistency
ALTER TABLE public.budgets 
  RENAME COLUMN limit_amount TO amount;

-- Add is_active column (for soft delete)
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add alert_threshold column (percentage 0-100)
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS alert_threshold INTEGER NOT NULL DEFAULT 80 
  CHECK (alert_threshold >= 0 AND alert_threshold <= 100);

-- Create index for active budgets
CREATE INDEX IF NOT EXISTS idx_budgets_active ON public.budgets(is_active) WHERE is_active = true;

-- =====================
-- GOALS ADJUSTMENTS
-- =====================

-- Rename deadline to target_date for consistency
ALTER TABLE public.goals 
  RENAME COLUMN deadline TO target_date;

-- Make status nullable (we'll use current_amount >= target_amount check instead)
-- This is handled by the check_goal_completion trigger

-- =====================
-- UPDATE VIEW
-- =====================

-- Drop and recreate the budget_status view with new column names
DROP VIEW IF EXISTS public.budget_status;

CREATE OR REPLACE VIEW public.budget_status AS
SELECT 
  b.id,
  b.user_id,
  b.category_id,
  b.amount,
  b.period,
  b.alert_type,
  b.alert_threshold,
  b.start_date,
  b.is_recurring,
  b.is_active,
  b.created_at,
  b.updated_at,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  COALESCE(spent.total, 0) AS spent,
  ROUND((COALESCE(spent.total, 0) / b.amount * 100)::numeric, 2) AS percentage,
  CASE 
    WHEN COALESCE(spent.total, 0) / b.amount >= 1 THEN 'exceeded'
    WHEN COALESCE(spent.total, 0) / b.amount >= (b.alert_threshold::numeric / 100) THEN 'warning'
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
) spent ON true
WHERE b.is_active = true;

COMMENT ON VIEW public.budget_status IS 'Budget status with current spending calculated (active budgets only)';

