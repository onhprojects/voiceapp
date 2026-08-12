-- Create audio storage buckets if they don't exist
insert into storage.buckets
  (id, name, public)
values
  ('intake-audio', 'intake-audio', false),
  ('audio-text-audio', 'audio-text-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for intake-audio bucket
CREATE POLICY "Authenticated users can upload to intake-audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'intake-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can read own intake-audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'intake-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own intake-audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'intake-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for audio-text-audio bucket
CREATE POLICY "Authenticated users can upload to audio-text-audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-text-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can read own audio-text-audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio-text-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own audio-text-audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio-text-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role policies for audit/management
CREATE POLICY "Service role can manage intake-audio"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'intake-audio');

CREATE POLICY "Service role can manage audio-text-audio"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'audio-text-audio');
