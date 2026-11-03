-- Exécuter dans la base ciprabem_omapi_portal avec un compte propriétaire/admin.
-- Ces quatre tables existent déjà; ce script accorde uniquement les droits requis
-- au rôle privé de l’API. Il ne crée ni ne modifie de table et ne migre aucune donnée.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.jobs, public.gopi_items
TO ciprabem_omapi_api;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.job_applications, public.gopi_orders
TO ciprabem_omapi_api;

-- Résout le nom réel des séquences IDENTITY/SERIAL associées aux clés id.
DO $permissions$
DECLARE
  table_name TEXT;
  sequence_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'jobs',
    'job_applications',
    'gopi_items',
    'gopi_orders'
  ] LOOP
    sequence_name := pg_get_serial_sequence(format('public.%I', table_name), 'id');
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO %I', sequence_name, 'ciprabem_omapi_api');
    END IF;
  END LOOP;
END
$permissions$;
