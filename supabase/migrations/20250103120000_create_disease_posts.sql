-- Create disease_posts table
CREATE TABLE public.disease_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id),
  farmer_name TEXT NOT NULL,
  farmer_avatar TEXT,
  disease_title TEXT NOT NULL,
  disease_description TEXT NOT NULL,
  disease_image TEXT NOT NULL,
  location TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create post_upvotes table to track who upvoted what
CREATE TABLE public.post_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.disease_posts(id) ON DELETE CASCADE,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.disease_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id),
  commenter_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disease_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Disease posts policies
CREATE POLICY "Anyone can view disease posts"
  ON public.disease_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create disease posts"
  ON public.disease_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own disease posts"
  ON public.disease_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disease posts"
  ON public.disease_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Post upvotes policies
CREATE POLICY "Anyone can view upvotes"
  ON public.post_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create upvotes"
  ON public.post_upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own upvotes"
  ON public.post_upvotes FOR DELETE
  USING (true);

-- Post comments policies
CREATE POLICY "Anyone can view comments"
  ON public.post_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_disease_posts_updated_at
  BEFORE UPDATE ON public.disease_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample disease posts
INSERT INTO public.disease_posts (farmer_name, farmer_avatar, disease_title, disease_description, disease_image, location, upvotes)
VALUES 
  ('Rajesh Kumar', 'https://api.dicebear.com/7.x/avatars/svg?seed=rajesh', 
   'Late Blight on Tomatoes', 
   'Found dark brown spots on my tomato leaves. The spots have a water-soaked appearance and white mold on the underside. Need urgent help!',
   'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800',
   'Punjab, India',
   24),
  
  ('Priya Sharma', 'https://api.dicebear.com/7.x/avatars/svg?seed=priya',
   'Powdery Mildew on Wheat',
   'White powdery coating appearing on wheat leaves. Seems to be spreading quickly across the field. What treatment should I use?',
   'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
   'Haryana, India',
   18),
  
  ('Amit Patel', 'https://api.dicebear.com/7.x/avatars/svg?seed=amit',
   'Bacterial Leaf Blight in Rice',
   'Yellow to white lesions on rice leaves starting from leaf tips. Water-soaked appearance visible. Field is about 2 hectares.',
   'https://images.unsplash.com/photo-1536514072410-5019a3c69182?w=800',
   'Maharashtra, India',
   32),
  
  ('Sunita Devi', 'https://api.dicebear.com/7.x/avatars/svg?seed=sunita',
   'Yellow Rust Alert',
   'Yellow-orange pustules forming on wheat leaves in parallel rows. Noticed this morning after heavy dew. Urgent advice needed.',
   'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
   'Uttar Pradesh, India',
   15),
  
  ('Krishna Reddy', 'https://api.dicebear.com/7.x/avatars/svg?seed=krishna',
   'Anthracnose in Chili Peppers',
   'Circular sunken lesions on chili fruits with orange spore masses. About 30% of crop affected. Need organic treatment options.',
   'https://images.unsplash.com/photo-1583331979558-37f1729fc8b2?w=800',
   'Andhra Pradesh, India',
   27),
  
  ('Meera Singh', 'https://api.dicebear.com/7.x/avatars/svg?seed=meera',
   'Black Spot on Roses',
   'Black circular spots with fringed margins on rose leaves. Leaves turning yellow and dropping. How to save my rose garden?',
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
   'Delhi, India',
   12);

-- Insert sample comments
INSERT INTO public.post_comments (post_id, commenter_name, comment_text)
SELECT id, 'Dr. Anil Verma', 'Apply copper-based fungicide immediately. Remove infected leaves to prevent spread.' 
FROM public.disease_posts WHERE disease_title = 'Late Blight on Tomatoes';

INSERT INTO public.post_comments (post_id, commenter_name, comment_text)
SELECT id, 'Farmer Ravi', 'I had the same issue last season. Bordeaux mixture worked well for me. Apply in early morning.' 
FROM public.disease_posts WHERE disease_title = 'Late Blight on Tomatoes';

INSERT INTO public.post_comments (post_id, commenter_name, comment_text)
SELECT id, 'Agricultural Expert', 'Use sulfur-based spray. Ensure good air circulation between plants. Avoid overhead irrigation.' 
FROM public.disease_posts WHERE disease_title = 'Powdery Mildew on Wheat';

INSERT INTO public.post_comments (post_id, commenter_name, comment_text)
SELECT id, 'Kumar Singh', 'Try neem oil solution as organic option. Mix with water and spray every 7 days.' 
FROM public.disease_posts WHERE disease_title = 'Anthracnose in Chili Peppers';
