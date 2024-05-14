ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;

CREATE VIEW auth_users WITH (security_invoker = true)
AS SELECT id, email, created_at, email_confirmed_at, last_sign_in_at FROM auth.users;
