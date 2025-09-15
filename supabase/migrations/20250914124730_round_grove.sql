/*
  # Corriger la visibilité des prouts pour le tribunal

  1. Problème
    - Les utilisateurs ne peuvent voir que leurs propres prouts
    - Le tribunal doit afficher tous les prouts de la communauté

  2. Solution
    - Modifier les politiques RLS pour permettre la lecture de tous les prouts
    - Maintenir la sécurité pour les opérations d'écriture

  3. Politiques
    - SELECT: Tous les utilisateurs authentifiés peuvent voir tous les prouts
    - INSERT: Les utilisateurs ne peuvent créer que leurs propres prouts
    - UPDATE: Les utilisateurs ne peuvent modifier que leurs propres prouts
    - DELETE: Les utilisateurs ne peuvent supprimer que leurs propres prouts
*/

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can read own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can read all prouts for public viewing" ON public.prouts;
DROP POLICY IF EXISTS "Users can insert own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can delete own prouts" ON public.prouts;

-- Créer les nouvelles politiques corrigées
CREATE POLICY "All authenticated users can read all prouts"
  ON public.prouts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own prouts"
  ON public.prouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prouts"
  ON public.prouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prouts"
  ON public.prouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prouts_created_at_desc ON public.prouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prouts_user_id ON public.prouts(user_id);