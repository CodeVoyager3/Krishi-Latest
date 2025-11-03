-- Update storage policy to allow anonymous uploads
DROP POLICY IF EXISTS "Authenticated users can upload crop images" ON storage.objects;

CREATE POLICY "Anyone can upload crop images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-images');

CREATE POLICY "Anyone can delete crop images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'crop-images');
