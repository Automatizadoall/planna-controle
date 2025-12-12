-- Migration: Add phone_number to profiles
-- Description: Adds optional phone number field for WhatsApp integration (Planna)

-- Add phone_number column (optional, unique)
ALTER TABLE public.profiles
ADD COLUMN phone_number TEXT;

-- Add unique constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- Create index for fast lookups by phone
CREATE INDEX idx_profiles_phone_number ON public.profiles(phone_number)
WHERE phone_number IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.phone_number IS 'Phone number in E.164 international format (e.g., +5511999998888) for WhatsApp integration';


