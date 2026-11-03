-- Exécuter dans ciprabem_omapi_portal avec un compte propriétaire/admin.
-- activity_logs existe déjà dans le schéma du portail. Les anciennes lignes
-- localStorage ne sont pas importées. Cette table vide mémorise la lecture par compte.
CREATE TABLE IF NOT EXISTS public.notification_reads (
  user_id BIGINT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL CHECK (length(notification_id) BETWEEN 1 AND 180),
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, notification_id)
);

CREATE INDEX IF NOT EXISTS notification_reads_user_read_at_idx
  ON public.notification_reads (user_id, read_at DESC);

GRANT SELECT, INSERT ON TABLE public.activity_logs TO ciprabem_omapi_api;
GRANT SELECT, INSERT, DELETE ON TABLE public.notification_reads TO ciprabem_omapi_api;

-- Autorise l’API à attribuer les id identity du journal.
DO $permissions$
DECLARE
  sequence_name TEXT;
BEGIN
  sequence_name := pg_get_serial_sequence('public.activity_logs', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO %I', sequence_name, 'ciprabem_omapi_api');
  END IF;
END
$permissions$;
