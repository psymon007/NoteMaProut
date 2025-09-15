/*
  # Corriger définitivement la visibilité des prouts pour le tribunal

  1. Problème
    - Les utilisateurs ne voient pas les prouts des autres dans le tribunal
    - Les politiques RLS bloquent l'accès aux prouts des autres utilisateurs

  2. Solution
    - Supprimer toutes les anciennes politiques
    - Créer des politiques claires et simples
    - Permettre à tous les utilisateurs authentifiés de voir tous les prouts

  3. Sécurité
    - Maintenir la protection pour les opérations d'écriture
    - Seuls les propriétaires peuvent modifier/supprimer leurs prouts
*/

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.prouts DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can read own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can read all prouts for public viewing" ON public.prouts;
DROP POLICY IF EXISTS "All authenticated users can read all prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can insert own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can insert their own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can update own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can update their own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can delete own prouts" ON public.prouts;
DROP POLICY IF EXISTS "Users can delete their own prouts" ON public.prouts;

-- Réactiver RLS
ALTER TABLE public.prouts ENABLE ROW LEVEL SECURITY;

-- Créer des politiques simples et claires
CREATE POLICY "tribunal_read_all_prouts"
  ON public.prouts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_own_prouts"
  ON public.prouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_prouts"
  ON public.prouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_prouts"
  ON public.prouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Vérifier que les index existent
CREATE INDEX IF NOT EXISTS idx_prouts_created_at_desc ON public.prouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prouts_user_id ON public.prouts(user_id);

-- Vérifier les permissions sur la table users aussi
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques users
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read all users for public viewing" ON public.users;

-- Permettre à tous les utilisateurs authentifiés de lire les profils publics
CREATE POLICY "authenticated_users_read_all_profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);