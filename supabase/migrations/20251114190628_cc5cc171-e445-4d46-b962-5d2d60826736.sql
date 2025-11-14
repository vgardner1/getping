-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (via edge functions)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id_created_at 
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_read 
  ON public.notifications(user_id, read);

-- Function to create notification when contact request is submitted
CREATE OR REPLACE FUNCTION notify_profile_owner_of_contact_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  VALUES (
    NEW.profile_user_id,
    'contact_request',
    'New Contact Request! 🎉',
    NEW.visitor_name || ' shared their contact info with you',
    jsonb_build_object(
      'contact_request_id', NEW.id,
      'visitor_name', NEW.visitor_name,
      'visitor_email', NEW.visitor_email,
      'visitor_phone', NEW.visitor_phone
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger to create notification on contact request
CREATE TRIGGER on_contact_request_notify
  AFTER INSERT ON public.profile_contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_profile_owner_of_contact_request();