-- Add phone column to users table
ALTER TABLE public.users ADD COLUMN phone VARCHAR(20) UNIQUE;

-- Create an index for faster lookups by phone
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
