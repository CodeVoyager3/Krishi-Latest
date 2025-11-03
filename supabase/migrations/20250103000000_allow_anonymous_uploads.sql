-- Allow anonymous users to upload images to the public/ folder for basic disease detection
CREATE POLICY "Anonymous users can upload to public folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'crop-images' 
    AND (storage.foldername(name))[1] = 'public'
  );

