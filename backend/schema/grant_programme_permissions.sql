-- Exécuter dans la base ciprabem_omapi_portal avec un compte propriétaire/admin.
-- Ces tables existent déjà; ce script accorde seulement les droits nécessaires
-- au rôle utilisé par l’API Node. Il ne crée, ne modifie et ne migre aucune donnée.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.formations, public.events
TO ciprabem_omapi_api;

GRANT SELECT, INSERT, DELETE
ON TABLE public.formation_registrations, public.event_registrations
TO ciprabem_omapi_api;

-- Résout le nom réel des séquences IDENTITY/SERIAL associées à chaque colonne id.
DO $permissions$
DECLARE
  table_name TEXT;
  sequence_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'formations',
    'formation_registrations',
    'events',
    'event_registrations'
  ] LOOP
    sequence_name := pg_get_serial_sequence(format('public.%I', table_name), 'id');
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO %I', sequence_name, 'ciprabem_omapi_api');
    END IF;
  END LOOP;
END
$permissions$;
