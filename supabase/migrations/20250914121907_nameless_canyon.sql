/*
  # Add comment column to ratings table

  1. Changes
    - Add `comment` column to `ratings` table
    - Column allows text up to 50 characters
    - Column is optional (nullable)

  2. Constraints
    - Comment max length 50 characters
    - Column is nullable for optional comments
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ratings' AND column_name = 'comment'
  ) THEN
    ALTER TABLE ratings ADD COLUMN comment text CHECK (length(comment) <= 50);
  END IF;
END $$;