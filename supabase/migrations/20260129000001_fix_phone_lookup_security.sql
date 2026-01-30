-- Migration: Fix phone lookup RPC security
-- Description: Remove authenticated grant from phone lookup functions
-- Security Fix: These functions should only be callable by service_role (n8n)

-- Revoke access from authenticated users
-- These functions expose sensitive user data and should only be used by backend services
REVOKE EXECUTE ON FUNCTION public.get_user_by_phone(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_accounts_by_phone(TEXT) FROM authenticated;

-- Add comment explaining the security restriction
COMMENT ON FUNCTION public.get_user_by_phone IS 
  'Lookup user and default account by phone number for WhatsApp integration. 
   SECURITY: Only callable by service_role (backend services like n8n). 
   Revoked from authenticated users to prevent data exposure.';

COMMENT ON FUNCTION public.get_accounts_by_phone IS 
  'Get all accounts for a user by phone number for WhatsApp integration. 
   SECURITY: Only callable by service_role (backend services like n8n). 
   Revoked from authenticated users to prevent data exposure.';
