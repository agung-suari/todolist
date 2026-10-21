-- All access goes through the authenticated Next.js server, not Supabase's
-- public Data API. The backend DB role must own these tables or have BYPASSRLS.
BEGIN;

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuthThrottle" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  role_name TEXT;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format(
        'REVOKE ALL ON TABLE public."User", public."Task", public."Session", public."AuthThrottle" FROM %I',
        role_name
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
