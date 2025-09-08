-- Update the trigger function to handle additional profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, instagram_handle, linkedin_url, phone_number)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'instagram_handle',
    new.raw_user_meta_data ->> 'linkedin_url',
    new.raw_user_meta_data ->> 'phone_number'
  );
  RETURN new;
END;
$$;