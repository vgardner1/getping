-- Add source and event tracking to connections
ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS met_at_event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster event-based queries
CREATE INDEX IF NOT EXISTS idx_connections_event ON public.connections(met_at_event_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON public.connections(source);

-- Create a function to auto-create connection from profile view
CREATE OR REPLACE FUNCTION public.create_connection_from_profile_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create connection if viewer is authenticated and different from profile owner
  IF NEW.viewer_user_id IS NOT NULL AND NEW.viewer_user_id != NEW.profile_user_id THEN
    -- Insert forward connection
    INSERT INTO public.connections (user_id, target_user_id, source)
    VALUES (NEW.profile_user_id, NEW.viewer_user_id, 'profile_view')
    ON CONFLICT DO NOTHING;
    
    -- Insert reciprocal connection
    INSERT INTO public.connections (user_id, target_user_id, source)
    VALUES (NEW.viewer_user_id, NEW.profile_user_id, 'profile_view')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profile_views to auto-create connections
DROP TRIGGER IF EXISTS auto_create_connection_on_profile_view ON public.profile_views;
CREATE TRIGGER auto_create_connection_on_profile_view
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.create_connection_from_profile_view();

-- Allow users to update connection details (notes, event)
CREATE POLICY "Users can update their own connections metadata"
ON public.connections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);