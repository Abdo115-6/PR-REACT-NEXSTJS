-- FIX: campaigns.user_id foreign key references wrong table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/sql/new

-- 1. Drop the existing foreign key constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;

-- 2. Check what 'users' table it references
-- (if the table is public.users, we need to handle this differently)

-- 3. Re-create referencing auth.users (where Supabase stores authenticated users)
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Also ensure the profiles table has the same fix
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Create a profile for the current user if missing
INSERT INTO public.profiles (id, full_name)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
