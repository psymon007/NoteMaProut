/*
  # Create prouts table for audio recordings

  1. New Tables
    - `prouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_path` (text)
      - `created_at` (timestamp)
      - `notes` (integer, default 0)

  2. Security
    - Enable RLS on prouts table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS prouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notes integer DEFAULT 0
);

ALTER TABLE prouts ENABLE ROW LEVEL SECURITY;

-- Policies for prouts
CREATE POLICY "Users can read own prouts"
  ON prouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prouts"
  ON prouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all prouts for public viewing"
  ON prouts
  FOR SELECT
  TO authenticated
  USING (true);