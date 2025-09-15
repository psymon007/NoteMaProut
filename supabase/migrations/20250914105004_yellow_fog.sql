/*
  # Create recording and prouts tables

  1. New Tables
    - `recording_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `attempt_date` (date)
      - `count` (integer)
    - `prouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_path` (text)
      - `created_at` (timestamp)
      - `notes` (integer, default 0)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS recording_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attempt_date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, attempt_date)
);

CREATE TABLE IF NOT EXISTS prouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notes integer DEFAULT 0
);

ALTER TABLE recording_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prouts ENABLE ROW LEVEL SECURITY;

-- Policies for recording_attempts
CREATE POLICY "Users can read own recording attempts"
  ON recording_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recording attempts"
  ON recording_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recording attempts"
  ON recording_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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