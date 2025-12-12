-- Migration: Create phone lookup RPC for n8n/WhatsApp integration
-- Description: Function to lookup user and default account by phone number

-- Create return type for the lookup function
CREATE TYPE public.phone_lookup_result AS (
  user_id UUID,
  full_name TEXT,
  default_account_id UUID,
  default_account_name TEXT,
  default_account_type public.account_type
);

-- Create the lookup function
-- This function is meant to be called with service_role key from n8n
CREATE OR REPLACE FUNCTION public.get_user_by_phone(p_phone TEXT)
RETURNS public.phone_lookup_result AS $$
DECLARE
  result public.phone_lookup_result;
BEGIN
  -- Normalize phone number (remove spaces, dashes)
  p_phone := regexp_replace(p_phone, '[^0-9+]', '', 'g');
  
  -- Lookup user and default account
  SELECT 
    p.id,
    p.full_name,
    a.id,
    a.name,
    a.type
  INTO result
  FROM public.profiles p
  LEFT JOIN public.accounts a ON a.user_id = p.id AND a.is_default = true AND NOT a.is_archived
  WHERE p.phone_number = p_phone;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role (for n8n with service key)
GRANT EXECUTE ON FUNCTION public.get_user_by_phone(TEXT) TO service_role;

-- Also grant to authenticated users (in case needed from the app)
GRANT EXECUTE ON FUNCTION public.get_user_by_phone(TEXT) TO authenticated;

-- Create a helper function to get all accounts for a user (for n8n to offer choices)
CREATE OR REPLACE FUNCTION public.get_accounts_by_phone(p_phone TEXT)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  account_type public.account_type,
  is_default BOOLEAN,
  balance NUMERIC(12, 2)
) AS $$
BEGIN
  -- Normalize phone number
  p_phone := regexp_replace(p_phone, '[^0-9+]', '', 'g');
  
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.type,
    a.is_default,
    a.balance
  FROM public.profiles p
  INNER JOIN public.accounts a ON a.user_id = p.id AND NOT a.is_archived
  WHERE p.phone_number = p_phone
  ORDER BY a.is_default DESC, a.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_accounts_by_phone(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_accounts_by_phone(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_user_by_phone IS 'Lookup user and default account by phone number for WhatsApp integration';
COMMENT ON FUNCTION public.get_accounts_by_phone IS 'Get all accounts for a user by phone number for WhatsApp integration';

