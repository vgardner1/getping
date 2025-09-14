-- Ensure unique connections and reciprocal auto-insert
-- 1) Create unique constraint to avoid duplicates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_connections_user_target'
  ) THEN
    CREATE UNIQUE INDEX uniq_connections_user_target ON public.connections (user_id, target_user_id);
  END IF;
END $$;

-- 2) Create function to insert reciprocal connection
CREATE OR REPLACE FUNCTION public.create_reciprocal_connection()
RETURNS TRIGGER AS $$
BEGIN
  -- Avoid self-connections
  IF NEW.user_id = NEW.target_user_id THEN
    RETURN NEW;
  END IF;

  -- Insert reciprocal if not exists
  INSERT INTO public.connections (user_id, target_user_id)
  SELECT NEW.target_user_id, NEW.user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.user_id = NEW.target_user_id AND c.target_user_id = NEW.user_id
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) Create trigger
DROP TRIGGER IF EXISTS trg_create_reciprocal_connection ON public.connections;
CREATE TRIGGER trg_create_reciprocal_connection
AFTER INSERT ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.create_reciprocal_connection();