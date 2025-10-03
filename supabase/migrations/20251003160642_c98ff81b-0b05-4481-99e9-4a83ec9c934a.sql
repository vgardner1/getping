-- Make phone_number required in waitlist table
ALTER TABLE public.waitlist 
ALTER COLUMN phone_number SET NOT NULL;