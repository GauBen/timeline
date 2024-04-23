CREATE VIEW auth_users AS SELECT id, email, created_at, email_confirmed_at, last_sign_in_at FROM auth.users;
