-- Migration: Create categorization_rules table
-- Description: Auto-categorization rules (system + user-defined)

-- Create categorization_rules table
CREATE TABLE public.categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system rules
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL, -- Regex or keyword pattern
  priority INTEGER NOT NULL DEFAULT 0, -- Higher = more priority
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view system rules and own rules"
  ON public.categorization_rules FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own rules"
  ON public.categorization_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
  ON public.categorization_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
  ON public.categorization_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_rules_user_id ON public.categorization_rules(user_id);
CREATE INDEX idx_rules_category ON public.categorization_rules(category_id);
CREATE INDEX idx_rules_priority ON public.categorization_rules(priority DESC);
CREATE INDEX idx_rules_active ON public.categorization_rules(is_active) WHERE is_active = true;

-- Function to auto-categorize transaction
CREATE OR REPLACE FUNCTION public.auto_categorize(
  p_user_id UUID,
  p_description TEXT
)
RETURNS TABLE(category_id UUID, confidence NUMERIC) AS $$
DECLARE
  rule RECORD;
BEGIN
  -- Check user rules first, then system rules (ordered by priority)
  FOR rule IN 
    SELECT cr.category_id, cr.pattern, cr.priority
    FROM public.categorization_rules cr
    WHERE cr.is_active = true
      AND (cr.user_id = p_user_id OR cr.user_id IS NULL)
    ORDER BY 
      CASE WHEN cr.user_id = p_user_id THEN 0 ELSE 1 END, -- User rules first
      cr.priority DESC
  LOOP
    IF p_description ~* rule.pattern THEN
      category_id := rule.category_id;
      confidence := CASE 
        WHEN rule.priority >= 100 THEN 0.95
        WHEN rule.priority >= 90 THEN 0.85
        WHEN rule.priority >= 80 THEN 0.75
        ELSE 0.65
      END;
      RETURN NEXT;
      RETURN; -- Return first match
    END IF;
  END LOOP;
  
  -- No match found
  category_id := NULL;
  confidence := 0;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.categorization_rules IS 'Auto-categorization rules (system + user-defined)';
COMMENT ON FUNCTION public.auto_categorize IS 'Auto-categorize a transaction description based on rules';

