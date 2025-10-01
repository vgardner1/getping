-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update handle_new_user function to extract first and last name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name,
    display_name,
    instagram_handle, 
    linkedin_url, 
    phone_number
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    CONCAT(
      COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(new.raw_user_meta_data ->> 'last_name', '')
    ),
    new.raw_user_meta_data ->> 'instagram_handle',
    new.raw_user_meta_data ->> 'linkedin_url',
    new.raw_user_meta_data ->> 'phone_number'
  );
  RETURN new;
END;
$$;

-- Update existing profiles to split display_name into first_name and last_name
UPDATE public.profiles
SET 
  first_name = SPLIT_PART(display_name, ' ', 1),
  last_name = SPLIT_PART(display_name, ' ', 2)
WHERE display_name IS NOT NULL AND first_name IS NULL;

-- For profiles with blank display_name, set it from first_name and last_name if available
UPDATE public.profiles
SET display_name = CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))
WHERE (display_name IS NULL OR display_name = '') 
AND (first_name IS NOT NULL OR last_name IS NOT NULL);