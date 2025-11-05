-- Create public bucket for 3D models
INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-models', '3d-models', true);

-- RLS: Anyone can read 3D models
CREATE POLICY "Public 3D models are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');

-- RLS: Authenticated users can upload 3D models
CREATE POLICY "Authenticated users can upload 3D models"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- RLS: Users can delete their own 3D models
CREATE POLICY "Users can delete own 3D models"
ON storage.objects FOR DELETE
USING (bucket_id = '3d-models' AND auth.uid() = owner);