/*
  # Create ratings table for prout ratings and comments

  1. New Tables
    - `ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prout_id` (uuid, foreign key to prouts)
      - `rating` (integer, 1-10)
      - `comment` (text, max 50 characters)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on ratings table
    - Add policies for authenticated users to rate and view ratings
    - Prevent users from rating the same prout multiple times

  3. Constraints
    - Rating must be between 1 and 10
    - Comment max length 50 characters
    - Unique constraint on user_id + prout_id
*/

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prout_id uuid REFERENCES prouts(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment text CHECK (length(comment) <= 50),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prout_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
CREATE POLICY "Users can read all ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_prout_id ON ratings(prout_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);