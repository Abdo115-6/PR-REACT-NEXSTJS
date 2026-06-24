-- Full Schema Setup for DonationFlow
-- Run ALL of this in Supabase SQL Editor: https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/sql/new

CREATE SCHEMA IF NOT EXISTS app_private;

-- 1. USERS TABLE (profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION app_private.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION app_private.sync_profile_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles AS profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'display_name', '')
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', ''),
      NULLIF(NEW.raw_user_meta_data->>'avatar', '')
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app_private.sync_profile_from_auth();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_select_public" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;

CREATE POLICY "campaigns_select_public" ON campaigns
  FOR SELECT USING (
    status = 'active'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "campaigns_insert_admin" ON campaigns
  FOR INSERT WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "campaigns_update_admin" ON campaigns
  FOR UPDATE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "campaigns_delete_admin" ON campaigns
  FOR DELETE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 3. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) DEFAULT 0,
  platform_fee_percentage INTEGER DEFAULT 5,
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations_select_public" ON donations;
DROP POLICY IF EXISTS "donations_insert_allow" ON donations;
DROP POLICY IF EXISTS "donations_update_own" ON donations;
DROP POLICY IF EXISTS "donations_delete_own" ON donations;

CREATE POLICY "donations_select_public" ON donations
  FOR SELECT USING (true);

CREATE POLICY "donations_insert_allow" ON donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "donations_update_own" ON donations
  FOR UPDATE USING (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "donations_delete_own" ON donations
  FOR DELETE USING (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Keep campaign totals aligned with donation inserts, edits, and removals.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  )
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_donation_insert ON donations;
CREATE TRIGGER on_donation_insert
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

DROP TRIGGER IF EXISTS on_donation_delete ON donations;
CREATE TRIGGER on_donation_delete
  AFTER DELETE ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

DROP TRIGGER IF EXISTS on_donation_update ON donations;
CREATE TRIGGER on_donation_update
  AFTER UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

UPDATE campaigns
SET current_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM donations
  WHERE donations.campaign_id = campaigns.id
);

-- 4. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  fee_percentage INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_all" ON platform_settings;
DROP POLICY IF EXISTS "settings_update_all" ON platform_settings;
DROP POLICY IF EXISTS "settings_insert_all" ON platform_settings;

CREATE POLICY "settings_select_all" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "settings_update_all" ON platform_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "settings_insert_all" ON platform_settings FOR INSERT WITH CHECK (true);

DROP TRIGGER IF EXISTS set_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

INSERT INTO platform_settings (id, fee_percentage) VALUES (1, 5) ON CONFLICT (id) DO NOTHING;
