/*
  Backfill profiles for users in auth.users who don't have a profile.
  Run this in Supabase SQL Editor.
*/
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  CASE WHEN u.raw_user_meta_data->>'role' = 'supply_chain' THEN 'supply_chain' ELSE 'procurement_officer' END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
