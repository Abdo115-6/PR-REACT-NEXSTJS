-- Full Schema Setup for DonationFlow
-- Run ALL of this in Supabase SQL Editor: https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/sql/new

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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

CREATE POLICY "campaigns_select_public" ON campaigns
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "campaigns_insert_own" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns_update_own" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns_delete_own" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

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
DROP POLICY IF EXISTS "donations_delete_own" ON donations;

CREATE POLICY "donations_select_public" ON donations
  FOR SELECT USING (true);

CREATE POLICY "donations_insert_allow" ON donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "donations_delete_own" ON donations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
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

INSERT INTO platform_settings (id, fee_percentage) VALUES (1, 5) ON CONFLICT (id) DO NOTHING;
