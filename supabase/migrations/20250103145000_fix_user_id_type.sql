-- Drop existing foreign key constraint if any
ALTER TABLE post_upvotes DROP CONSTRAINT IF EXISTS post_upvotes_user_id_fkey;

-- Change user_id from UUID to TEXT to support anonymous users
ALTER TABLE post_upvotes ALTER COLUMN user_id TYPE TEXT;

-- Recreate unique constraint
ALTER TABLE post_upvotes DROP CONSTRAINT IF EXISTS post_upvotes_post_id_user_id_key;
ALTER TABLE post_upvotes ADD CONSTRAINT post_upvotes_post_id_user_id_key UNIQUE (post_id, user_id);

-- Also update post_comments table to support anonymous users
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE post_comments ALTER COLUMN user_id TYPE TEXT;

-- Clear existing data to start fresh
DELETE FROM post_upvotes;
DELETE FROM post_comments;

-- Reset upvote counts
UPDATE disease_posts SET upvotes = 0;
