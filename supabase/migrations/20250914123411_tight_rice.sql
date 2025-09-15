/*
  # Vérifier et corriger les politiques RLS pour la table ratings

  1. Vérifications
    - Table ratings existe
    - RLS est activé
    - Politiques sont en place

  2. Corrections
    - Active RLS si nécessaire
    - Recrée les politiques si manquantes
*/

-- Activer RLS sur la table ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can read all ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;

-- Recréer les politiques
CREATE POLICY "Users can read all ratings"
  ON public.ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Créer les index pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_ratings_prout_id ON public.ratings(prout_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at DESC);