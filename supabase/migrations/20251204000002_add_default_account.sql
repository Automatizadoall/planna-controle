-- Migration: Add is_default to accounts
-- Description: Adds default account flag for WhatsApp transaction integration

-- Add is_default column
ALTER TABLE public.accounts
ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

-- Create partial unique index to ensure only ONE default account per user
CREATE UNIQUE INDEX idx_accounts_user_default 
ON public.accounts(user_id) 
WHERE is_default = true AND NOT is_archived;

-- Function to set first account as default
CREATE OR REPLACE FUNCTION public.set_first_account_as_default()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the user's first non-archived account, set it as default
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND NOT is_archived
  ) THEN
    NEW.is_default := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set first account as default
CREATE TRIGGER set_first_account_default
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_first_account_as_default();

-- Function to handle default account changes (ensure only one default)
CREATE OR REPLACE FUNCTION public.handle_default_account_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this account as default, unset all other defaults for this user
  IF NEW.is_default = true AND (OLD.is_default IS NULL OR OLD.is_default = false) THEN
    UPDATE public.accounts
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  
  -- Prevent unsetting default if it's the only non-archived account
  IF NEW.is_default = false AND OLD.is_default = true THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true
      AND NOT is_archived
    ) THEN
      -- Check if there are other non-archived accounts to potentially set as default
      IF EXISTS (
        SELECT 1 FROM public.accounts
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND NOT is_archived
      ) THEN
        -- Allow the change, another account should be set as default manually
        NULL;
      ELSE
        -- This is the only account, keep it as default
        NEW.is_default := true;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for default account changes
CREATE TRIGGER handle_default_account_update
  BEFORE UPDATE OF is_default ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_default_account_change();

-- Set existing first account per user as default (for existing data)
WITH first_accounts AS (
  SELECT DISTINCT ON (user_id) id
  FROM public.accounts
  WHERE NOT is_archived
  ORDER BY user_id, created_at ASC
)
UPDATE public.accounts
SET is_default = true
WHERE id IN (SELECT id FROM first_accounts);

-- Add comment
COMMENT ON COLUMN public.accounts.is_default IS 'Whether this is the default account for WhatsApp transactions';


