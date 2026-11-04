-- Ajoute la photo de profil à la table des comptes OMAPI.
-- À exécuter une seule fois dans la base dédiée au portail OMAPI.
-- La commande est idempotente et ne modifie ni les comptes existants ni les autres bases.

ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS avatar_data TEXT;
