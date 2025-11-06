-- Create events table to cache Eventbrite events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eventbrite_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  url TEXT,
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_attendances table to track who's going to which events
CREATE TABLE IF NOT EXISTS public.event_attendances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create connection_meetings table to track where people met
CREATE TABLE IF NOT EXISTS public.connection_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  meeting_location TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events (readable by all authenticated users)
CREATE POLICY "Events are viewable by authenticated users"
  ON public.events
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Events can be inserted by authenticated users"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for event_attendances
CREATE POLICY "Users can view all event attendances"
  ON public.event_attendances
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own event attendances"
  ON public.event_attendances
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for connection_meetings
CREATE POLICY "Users can view their own connection meetings"
  ON public.connection_meetings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
      AND (c.user_id = auth.uid() OR c.target_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own connection meetings"
  ON public.connection_meetings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
      AND c.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_attendances_updated_at
  BEFORE UPDATE ON public.event_attendances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connection_meetings_updated_at
  BEFORE UPDATE ON public.connection_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_eventbrite_id ON public.events(eventbrite_id);
CREATE INDEX idx_event_attendances_user_id ON public.event_attendances(user_id);
CREATE INDEX idx_event_attendances_event_id ON public.event_attendances(event_id);
CREATE INDEX idx_connection_meetings_connection_id ON public.connection_meetings(connection_id);
CREATE INDEX idx_connection_meetings_event_id ON public.connection_meetings(event_id);